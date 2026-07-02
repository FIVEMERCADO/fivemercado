import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseClient } from "@/lib/supabase";

const ADMIN_IDS = (process.env.ADMIN_DISCORD_IDS ?? "").split(",").map((s) => s.trim());

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  const discordId = (session.user as { discordId?: string }).discordId ?? "";
  return ADMIN_IDS.includes(discordId) ? session : null;
}

// PATCH — actualizar carro
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await req.json();
  const supabase = supabaseClient();

  // Filtrar solo campos permitidos
  const allowed = [
    "name", "brand", "category", "description", "price", "is_free",
    "image_url", "r2_path", "handling_name", "handling", "stats", "is_published",
  ];
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }
  if (body.handling_name) update.handling_name = String(body.handling_name).toUpperCase();
  if (body.is_free) update.price = 0;

  const { data, error } = await supabase
    .from("cars")
    .update(update)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE — eliminar carro
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const supabase = supabaseClient();
  const { error } = await supabase.from("cars").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
