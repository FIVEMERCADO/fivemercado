import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseClient } from "@/lib/supabase";
import { applyHandlingChanges, generateHandlingMeta } from "@/lib/handling-xml";
import type { HandlingValues } from "@/lib/handling-xml";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const supabase = supabaseClient();
  const discordId = (session.user as { discordId?: string }).discordId ?? "";

  const { data: user } = await supabase.from("users").select("id, credits").eq("discord_id", discordId).single();
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  // Incluir handling_xml en la consulta del carro
  const { data: car } = await supabase
    .from("cars")
    .select("*, handling_xml")
    .eq("id", params.id)
    .eq("is_published", true)
    .single();
  if (!car) return NextResponse.json({ error: "Carro no encontrado" }, { status: 404 });

  const { data: existing } = await supabase.from("car_purchases").select("id").eq("user_id", user.id).eq("car_id", car.id).single();
  if (existing) return NextResponse.json({ error: "Ya compraste este carro" }, { status: 400 });

  if (!car.is_free && user.credits < car.price) {
    return NextResponse.json({ error: `Créditos insuficientes. Necesitas ${car.price} CR, tienes ${user.credits} CR.` }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const customHandling: Record<string, number> = body.handling ?? {};
  const hasCustom = Object.keys(customHandling).length > 0;

  if (!car.is_free) {
    const { error: creditErr } = await supabase
      .from("users")
      .update({ credits: user.credits - car.price })
      .eq("id", user.id);
    if (creditErr) return NextResponse.json({ error: "Error descontando créditos" }, { status: 500 });
  }

  await supabase.from("car_purchases").insert({
    user_id:         user.id,
    car_id:          car.id,
    price_paid:      car.is_free ? 0 : car.price,
    custom_handling: hasCustom ? customHandling : car.handling,
  });

  // ── Generar XML ──────────────────────────────────────────────────────────────
  // Si el carro tiene el XML original guardado, usarlo como base y solo
  // reemplazar los campos editados. Esto garantiza que strModelFlags,
  // SubHandlingData, vecCentreOfMassOffset, etc. sean correctos para ese carro.
  let xml: string;
  if (car.handling_xml) {
    xml = hasCustom
      ? applyHandlingChanges(car.handling_xml as string, customHandling)
      : (car.handling_xml as string);
  } else {
    // Fallback: generar desde valores JSON (menos preciso — falta SubHandlingData, flags, etc.)
    const finalHandling = hasCustom ? { ...car.handling, ...customHandling } : car.handling;
    xml = generateHandlingMeta(car.handling_name, finalHandling as HandlingValues);
  }

  try {
    await sendHandlingDM(discordId, car, xml, hasCustom);
  } catch (e) {
    console.error("Discord DM error:", e);
  }

  return NextResponse.json({ ok: true, hasOriginalXml: !!car.handling_xml });
}

async function sendHandlingDM(
  discordId: string,
  car: { name: string; handling_name: string },
  xml: string,
  isCustom: boolean
) {
  const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  if (!BOT_TOKEN) return;

  const dmRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
    method: "POST",
    headers: { Authorization: `Bot ${BOT_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ recipient_id: discordId }),
  });
  const dm = await dmRes.json() as { id?: string };
  if (!dm.id) return;

  const filename = `${car.handling_name}_handling.meta`;
  const content = isCustom
    ? `✅ **¡Gracias por tu compra en FiveMercado!**\n\n🚗 **${car.name}** — Handling Personalizado\n📁 Tu \`handling.meta\` con tus ajustes está adjunto.\n\n**Instalación:**\n1. Abre la carpeta del carro en \`resources/\`\n2. Reemplaza el \`handling.meta\` existente\n3. Usa \`ensure [nombre-recurso]\` en la consola\n\n🔥 ¡Disfruta tu configuración personalizada!`
    : `✅ **¡Gracias por tu compra en FiveMercado!**\n\n🚗 **${car.name}** — Handling Original\n📁 El \`handling.meta\` original del fabricante está adjunto.\n\n**Instalación:**\n1. Abre la carpeta del carro en \`resources/\`\n2. Reemplaza el \`handling.meta\` existente\n3. Usa \`ensure [nombre-recurso]\` en la consola\n\n💡 ¿Quieres personalizar el handling? Visita fivemercado.com`;

  const boundary = "----FiveMercadoBoundary7x";
  const bodyParts = [
    `--${boundary}\r\nContent-Disposition: form-data; name="payload_json"\r\nContent-Type: application/json\r\n\r\n`,
    JSON.stringify({ content, embeds: [{ color: 0xff6600, footer: { text: "FiveMercado — fivemercado.com" } }] }),
    `\r\n--${boundary}\r\nContent-Disposition: form-data; name="files[0]"; filename="${filename}"\r\nContent-Type: text/xml\r\n\r\n`,
    xml,
    `\r\n--${boundary}--`,
  ].join("");

  await fetch(`https://discord.com/api/v10/channels/${dm.id}/messages`, {
    method: "POST",
    headers: { Authorization: `Bot ${BOT_TOKEN}`, "Content-Type": `multipart/form-data; boundary=${boundary}` },
    body: bodyParts,
  });
}
