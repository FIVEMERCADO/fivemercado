import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseClient } from "@/lib/supabase";

const VALID_REACTIONS = ["👍", "❤️", "🔥", "😢", "😡"] as const;
type Reaction = (typeof VALID_REACTIONS)[number];

// GET — conteos públicos (no requiere auth)
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = supabaseClient();
  const session = await auth();
  const discordId = (session?.user as { discordId?: string } | undefined)?.discordId;

  let userId: string | null = null;
  if (discordId) {
    const { data: u } = await supabase.from("users").select("id").eq("discord_id", discordId).single();
    userId = u?.id ?? null;
  }

  const { data: rows } = await supabase
    .from("script_reactions")
    .select("reaction, user_id")
    .eq("script_id", params.id);

  const counts: Record<string, number> = {};
  let userReaction: string | null = null;

  for (const r of rows ?? []) {
    counts[r.reaction] = (counts[r.reaction] ?? 0) + 1;
    if (userId && r.user_id === userId) userReaction = r.reaction;
  }

  return NextResponse.json({ counts, userReaction });
}

// POST — toggle reacción (requiere auth)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { reaction } = await req.json();
  if (!VALID_REACTIONS.includes(reaction as Reaction)) {
    return NextResponse.json({ error: "Reacción inválida" }, { status: 400 });
  }

  const discordId = (session.user as { discordId?: string }).discordId;
  if (!discordId) return NextResponse.json({ error: "Sin Discord ID" }, { status: 403 });

  const supabase = supabaseClient();
  const { data: user } = await supabase.from("users").select("id").eq("discord_id", discordId).single();
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  const { data: existing } = await supabase
    .from("script_reactions")
    .select("id, reaction")
    .eq("user_id", user.id)
    .eq("script_id", params.id)
    .maybeSingle();

  if (existing) {
    if (existing.reaction === reaction) {
      // Misma reacción → eliminar (toggle off)
      await supabase.from("script_reactions").delete().eq("id", existing.id);
    } else {
      // Reacción diferente → cambiar
      await supabase.from("script_reactions").update({ reaction }).eq("id", existing.id);
    }
  } else {
    await supabase.from("script_reactions").insert({
      user_id: user.id,
      script_id: params.id,
      reaction,
    });
  }

  // Devolver conteos actualizados
  const { data: rows } = await supabase
    .from("script_reactions")
    .select("reaction, user_id")
    .eq("script_id", params.id);

  const counts: Record<string, number> = {};
  let userReaction: string | null = null;
  for (const r of rows ?? []) {
    counts[r.reaction] = (counts[r.reaction] ?? 0) + 1;
    if (r.user_id === user.id) userReaction = r.reaction;
  }

  return NextResponse.json({ counts, userReaction });
}
