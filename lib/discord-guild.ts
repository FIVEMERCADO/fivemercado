const GUILD_ID    = process.env.DISCORD_GUILD_ID ?? "1521957094121803887";
const BOT_TOKEN   = process.env.DISCORD_BOT_TOKEN ?? "";
const DISCORD_API = "https://discord.com/api/v10";

/** Verifica si un usuario está en el servidor Discord de FiveMercado */
export async function isGuildMember(discordId: string): Promise<boolean> {
  if (!BOT_TOKEN) return true; // dev: sin token = no bloquear

  try {
    const res = await fetch(`${DISCORD_API}/guilds/${GUILD_ID}/members/${discordId}`, {
      headers: { Authorization: `Bot ${BOT_TOKEN}` },
      // No cachear — siempre verificar en tiempo real
      cache: "no-store",
    });
    return res.status === 200;
  } catch {
    return true; // Si Discord falla, no bloquear al usuario
  }
}
