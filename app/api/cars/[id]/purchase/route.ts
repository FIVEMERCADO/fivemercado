import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseClient } from "@/lib/supabase";
import { generateHandlingMeta } from "@/lib/handling-xml";
import type { HandlingValues } from "@/lib/handling-xml";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const supabase = supabaseClient();
  const discordId = (session.user as { discordId?: string }).discordId ?? "";

  // Obtener usuario
  const { data: user } = await supabase.from("users").select("id, credits").eq("discord_id", discordId).single();
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  // Obtener carro
  const { data: car } = await supabase.from("cars").select("*").eq("id", params.id).eq("is_published", true).single();
  if (!car) return NextResponse.json({ error: "Carro no encontrado" }, { status: 404 });

  // Verificar ya comprado
  const { data: existing } = await supabase.from("car_purchases").select("id").eq("user_id", user.id).eq("car_id", car.id).single();
  if (existing) return NextResponse.json({ error: "Ya compraste este carro" }, { status: 400 });

  // Verificar créditos
  if (!car.is_free && user.credits < car.price) {
    return NextResponse.json({ error: `Créditos insuficientes. Necesitas ${car.price} CR, tienes ${user.credits} CR.` }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const customHandling: Record<string, number> = body.handling ?? {};

  // Descontar créditos si no es gratis
  if (!car.is_free) {
    const { error: creditErr } = await supabase
      .from("users")
      .update({ credits: user.credits - car.price })
      .eq("id", user.id);
    if (creditErr) return NextResponse.json({ error: "Error descontando créditos" }, { status: 500 });
  }

  // Guardar compra
  await supabase.from("car_purchases").insert({
    user_id:         user.id,
    car_id:          car.id,
    price_paid:      car.is_free ? 0 : car.price,
    custom_handling: Object.keys(customHandling).length > 0 ? customHandling : car.handling,
  });

  // Generar handling.meta XML
  const finalHandling = Object.keys(customHandling).length > 0
    ? { ...car.handling, ...customHandling }
    : car.handling;

  const xml = generateHandlingMeta(car.handling_name, finalHandling as HandlingValues);

  // Enviar via Discord DM como archivo adjunto
  try {
    await sendHandlingDM(discordId, car, xml);
  } catch (e) {
    console.error("Error sending Discord DM:", e);
    // No falla la compra si Discord falla
  }

  return NextResponse.json({ ok: true, xml });
}

async function sendHandlingDM(discordId: string, car: { name: string; handling_name: string }, xml: string) {
  const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  if (!BOT_TOKEN) return;

  // Crear DM channel
  const dmRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
    method: "POST",
    headers: { Authorization: `Bot ${BOT_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ recipient_id: discordId }),
  });
  const dm = await dmRes.json();
  if (!dm.id) return;

  // Enviar archivo como multipart form
  const filename = `${car.handling_name}_handling.meta`;

  const boundary = "----FiveMercadoBoundary";
  const body = [
    `--${boundary}\r\nContent-Disposition: form-data; name="payload_json"\r\nContent-Type: application/json\r\n\r\n`,
    JSON.stringify({
      content: `✅ **¡Gracias por tu compra en FiveMercado!**\n\n🚗 **${car.name}**\n📁 Tu \`handling.meta\` personalizado está adjunto.\n\n**Instrucciones de instalación:**\n1. Abre la carpeta del carro en tu servidor FiveM\n2. Reemplaza el archivo \`handling.meta\` existente\n3. Reinicia el recurso con \`ensure [nombre-del-recurso]\`\n\n¡Disfruta tu carro! 🔥`,
      embeds: [{
        color: 0xff6600,
        footer: { text: "FiveMercado — fivemercado.com" }
      }]
    }),
    `\r\n--${boundary}\r\nContent-Disposition: form-data; name="files[0]"; filename="${filename}"\r\nContent-Type: text/xml\r\n\r\n`,
    xml,
    `\r\n--${boundary}--`,
  ].join("");

  await fetch(`https://discord.com/api/v10/channels/${dm.id}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });
}
