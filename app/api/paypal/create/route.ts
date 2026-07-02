import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseClient } from "@/lib/supabase";
import { getPayPalAccessToken, PAYPAL_BASE, PACKAGES } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  // 1. Autenticación obligatoria
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { package: pkg } = await req.json();

  // 2. Validar paquete
  const pkgKey = String(pkg);
  const selectedPkg = PACKAGES[pkgKey];
  if (!selectedPkg) {
    return NextResponse.json({ error: "Paquete inválido" }, { status: 400 });
  }

  const discordId = (session.user as { discordId?: string }).discordId;
  if (!discordId) {
    return NextResponse.json({ error: "Cuenta de Discord no vinculada" }, { status: 403 });
  }

  const supabase = supabaseClient();

  // 3. Resolver usuario en DB
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("discord_id", discordId)
    .single();

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const BASE_URL =
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  try {
    // 4. Obtener token de PayPal
    const accessToken = await getPayPalAccessToken();

    // 5. Crear orden en PayPal
    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `${user.id}-${Date.now()}`, // idempotency key
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: { currency_code: "EUR", value: selectedPkg.amount },
            description: `FiveMercado — ${selectedPkg.credits} créditos`,
          },
        ],
        application_context: {
          brand_name: "FiveMercado",
          locale: "es-ES",
          landing_page: "LOGIN",
          user_action: "PAY_NOW",
          return_url: `${BASE_URL}/api/paypal/capture`,
          cancel_url: `${BASE_URL}/credits?error=cancelled`,
        },
      }),
    });

    if (!orderRes.ok) {
      const err = await orderRes.json();
      console.error("PayPal create order error:", err);
      return NextResponse.json({ error: "Error al crear orden en PayPal" }, { status: 500 });
    }

    const order = await orderRes.json();

    // 6. Guardar orden pendiente en Supabase
    await supabase.from("pending_orders").insert({
      user_id: user.id,
      order_id: order.id,
      credits: selectedPkg.credits,
      amount: parseFloat(selectedPkg.amount),
    });

    // 7. Devolver URL de aprobación de PayPal
    const approveUrl = (order.links as { rel: string; href: string }[]).find(
      (l) => l.rel === "approve"
    )?.href;

    if (!approveUrl) {
      return NextResponse.json({ error: "URL de aprobación no encontrada" }, { status: 500 });
    }

    return NextResponse.json({ approveUrl, orderId: order.id });
  } catch (err) {
    console.error("PayPal create error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
