import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseClient } from "@/lib/supabase";

// POST /api/heartbeat — llamado periódicamente desde el cliente (cada 30s)
// Actualiza last_seen del usuario autenticado y devuelve conteo online
export async function POST() {
  const session = await auth();
  const supabase = supabaseClient();
  const now = new Date().toISOString();

  if (session?.user) {
    const discordId = (session.user as { discordId?: string }).discordId;
    if (discordId) {
      await supabase
        .from("users")
        .update({ last_seen: now })
        .eq("discord_id", discordId);
    }
  }

  // Contar usuarios con actividad en los últimos 5 minutos
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .gt("last_seen", fiveMinAgo);

  return NextResponse.json({ online: count ?? 0 });
}
