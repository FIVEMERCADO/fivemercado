import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase";
import { getPayPalAccessToken, PAYPAL_BASE } from "@/lib/paypal";
import { notifyTopUp } from "@/lib/discord-notify";

// PayPal redirige aquí tras el pago: /api/paypal/capture?token={orderID}&PayerID={id}
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const orderID = searchParams.get("token");

  const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  if (!orderID) {
    return NextResponse.redirect(`${BASE_URL}/credits?error=missing_token`);
  }

  const supabase = supabaseClient();

  // 1. Buscar la orden pendiente en DB (previene replays)
  const { data: pending, error: pendingErr } = await supabase
    .from("pending_orders")
    .select("id, user_id, credits, amount")
    .eq("order_id", orderID)
    .single();

  if (pendingErr || !pending) {
    return NextResponse.redirect(`${BASE_URL}/credits?error=order_not_found`);
  }

  try {
    // 2. Capturar el pago en PayPal (solo funciona 1 vez)
    const accessToken = await getPayPalAccessToken();

    const captureRes = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await captureRes.json();

    if (result.status !== "COMPLETED") {
      console.error("PayPal capture not completed:", result);
      return NextResponse.redirect(`${BASE_URL}/credits?error=payment_failed`);
    }

    // 3. Verificar el monto real pagado (anti-fraude: nunca confiar solo en la URL)
    const captureUnit = result.purchase_units?.[0]?.payments?.captures?.[0];
    const amountPaid = parseFloat(captureUnit?.amount?.value ?? "0");

    if (amountPaid !== pending.amount) {
      console.error(`Monto incorrecto: esperado ${pending.amount}, recibido ${amountPaid}`);
      return NextResponse.redirect(`${BASE_URL}/credits?error=amount_mismatch`);
    }

    // 4. Añadir créditos al usuario (atómico via RPC)
    const { error: rpcError } = await supabase.rpc("add_credits", {
      p_user_id: pending.user_id,
      p_credits: pending.credits,
    });

    if (rpcError) {
      console.error("Error añadiendo créditos:", rpcError);
      return NextResponse.redirect(`${BASE_URL}/credits?error=credits_failed`);
    }

    // 5. Registrar transacción
    await supabase.from("transactions").insert({
      user_id: pending.user_id,
      type: "PAYPAL_TOPUP",
      amount: pending.credits,
      description: `Compra PayPal — ${pending.credits} créditos (€${pending.amount})`,
    });

    // 6. Eliminar la orden pendiente (ya procesada)
    await supabase.from("pending_orders").delete().eq("order_id", orderID);

    // 7. DM de confirmación de recarga — fire & forget
    const { data: buyerUser } = await supabase
      .from("users")
      .select("discord_id")
      .eq("id", pending.user_id)
      .single();
    if (buyerUser?.discord_id) {
      notifyTopUp({
        discordId: buyerUser.discord_id,
        credits: pending.credits,
        euros: pending.amount,
      }).catch(() => {});
    }

    return NextResponse.redirect(`${BASE_URL}/credits?success=true`);
  } catch (err) {
    console.error("PayPal capture error:", err);
    return NextResponse.redirect(`${BASE_URL}/credits?error=server_error`);
  }
}
