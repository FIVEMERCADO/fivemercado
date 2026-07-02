const { createClient } = require("@supabase/supabase-js");

let _client = null;

function db() {
  if (!_client) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_KEY en el .env");
    }
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }
  return _client;
}

/** Devuelve el usuario de DB dado su Discord ID, o null si no existe */
async function getUserByDiscordId(discordId) {
  const { data } = await db()
    .from("users")
    .select("id, username, credits")
    .eq("discord_id", discordId)
    .single();
  return data;
}

module.exports = { db, getUserByDiscordId };
