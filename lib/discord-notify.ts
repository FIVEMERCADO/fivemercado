/**
 * Notificaciones Discord desde Next.js usando la REST API directamente.
 * No requiere que el bot esté corriendo — usa el token para enviar DMs.
 */

import { createDownloadSig } from "@/lib/hmac";
import { supabaseClient } from "@/lib/supabase";

const DISCORD_API = "https://discord.com/api/v10";
const BOT_TOKEN   = process.env.DISCORD_BOT_TOKEN ?? "";
const LOGS_CHANNEL = process.env.DISCORD_LOGS_CHANNEL_ID ?? "";
const SITE        = process.env.NEXTAUTH_URL ?? "https://fivemercado.vercel.app";

async function discordPost(path: string, body: object) {
  const res = await fetch(`${DISCORD_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord ${res.status}: ${text}`);
  }
  return res.json();
}

/** Genera HMAC URL e inserta nonce en DB */
async function buildDownloadUrl(scriptId: string, userId: string): Promise<string> {
  const supabase = supabaseClient();
  const { ts, nonce, sig } = createDownloadSig(scriptId, userId);

  await supabase.from("download_nonces").delete().eq("user_id", userId).eq("script_id", scriptId);
  await supabase.from("download_nonces").insert({
    nonce,
    script_id: scriptId,
    user_id: userId,
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });

  return `${SITE}/api/scripts/${scriptId}/download?uid=${encodeURIComponent(userId)}&ts=${ts}&nonce=${encodeURIComponent(nonce)}&sig=${sig}`;
}

/** DM al comprador con link de descarga + notificación en canal de logs */
export async function notifyPurchase({
  discordId,
  userId,
  scriptId,
  scriptTitle,
  pricePaid,
}: {
  discordId: string;
  userId: string;
  scriptId: string;
  scriptTitle: string;
  pricePaid: number;
}) {
  if (!BOT_TOKEN) return;

  try {
    const downloadUrl = await buildDownloadUrl(scriptId, userId);

    // Abrir canal DM con el usuario
    const dmChannel = await discordPost("/users/@me/channels", {
      recipient_id: discordId,
    });

    // Enviar embed con botón de descarga
    await discordPost(`/channels/${dmChannel.id}/messages`, {
      embeds: [
        {
          color: 0x2cade0,
          title: "🎉 ¡Compra completada!",
          description:
            `Tu compra de **${scriptTitle}** fue procesada exitosamente.\n\n` +
            `> ⚠️ El enlace expira en **5 minutos** y es de **un solo uso**.\n` +
            `> 🔄 Para generar uno nuevo usa \`/descargar\` en nuestro servidor.`,
          fields: [
            {
              name: "📦 Script",
              value: scriptTitle,
              inline: true,
            },
            {
              name: "💳 Créditos gastados",
              value: `${pricePaid} créditos`,
              inline: true,
            },
          ],
          footer: { text: "FiveMercado • El marketplace FiveM en español" },
          timestamp: new Date().toISOString(),
        },
      ],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 5,
              label: "📥 Descargar ahora",
              url: downloadUrl,
            },
            {
              type: 2,
              style: 5,
              label: "🛒 Ver mis compras",
              url: `${SITE}/profile`,
            },
          ],
        },
      ],
    });
  } catch (err) {
    // DMs desactivados u otro error — no crítico
    console.warn("[discord-notify] DM failed:", (err as Error).message);
  }

  // Registrar en canal de logs del servidor (fire & forget)
  if (LOGS_CHANNEL) {
    discordPost(`/channels/${LOGS_CHANNEL}/messages`, {
      embeds: [
        {
          color: 0x2ecc71,
          title: "💰 Nueva venta",
          fields: [
            { name: "Script",   value: scriptTitle,          inline: true },
            { name: "Créditos", value: `${pricePaid}`,       inline: true },
          ],
          footer: { text: "FiveMercado Ventas" },
          timestamp: new Date().toISOString(),
        },
      ],
    }).catch(() => {});
  }
}

/** DM de confirmación de recarga PayPal */
export async function notifyTopUp({
  discordId,
  credits,
  euros,
}: {
  discordId: string;
  credits: number;
  euros: number;
}) {
  if (!BOT_TOKEN) return;

  try {
    const dmChannel = await discordPost("/users/@me/channels", {
      recipient_id: discordId,
    });

    await discordPost(`/channels/${dmChannel.id}/messages`, {
      embeds: [
        {
          color: 0x2cade0,
          title: "🪙 ¡Créditos recargados!",
          description:
            `Se acreditaron **${credits} créditos** a tu cuenta.\n` +
            `Pago recibido: **€${euros}** via PayPal.`,
          fields: [
            {
              name: "💡 ¿Qué hacer ahora?",
              value: `Visita el [marketplace](${SITE}/marketplace) y compra los scripts que quieras.`,
            },
          ],
          footer: { text: "FiveMercado" },
          timestamp: new Date().toISOString(),
        },
      ],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 5,
              label: "🛒 Ir al Marketplace",
              url: `${SITE}/marketplace`,
            },
          ],
        },
      ],
    });
  } catch {
    // Silencioso
  }
}
