import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseClient } from "@/lib/supabase";

// POST — toggle save/unsave
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const discordId = (session.user as { discordId?: string }).discordId;
  if (!discordId) return NextResponse.json({ error: "Sin Discord ID" }, { status: 403 });

  const supabase = supabaseClient();
  const { data: user } = await supabase.from("users").select("id").eq("discord_id", discordId).single();
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  const { data: existing } = await supabase
    .from("saved_scripts")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("script_id", params.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("saved_scripts").delete().eq("user_id", user.id).eq("script_id", params.id);
    return NextResponse.json({ saved: false });
  } else {
    await supabase.from("saved_scripts").insert({ user_id: user.id, script_id: params.id });
    return NextResponse.json({ saved: true });
  }
}

// GET — check if current user saved this script
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ saved: false });

  const discordId = (session.user as { discordId?: string }).discordId;
  if (!discordId) return NextResponse.json({ saved: false });

  const supabase = supabaseClient();
  const { data: user } = await supabase.from("users").select("id").eq("discord_id", discordId).single();
  if (!user) return NextResponse.json({ saved: false });

  const { data } = await supabase
    .from("saved_scripts")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("script_id", params.id)
    .maybeSingle();

  return NextResponse.json({ saved: !!data });
}
