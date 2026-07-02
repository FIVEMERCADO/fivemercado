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

// GET — listar todos los carros
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const supabase = supabaseClient();
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — crear carro
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await req.json();
  const { name, brand, category, description, price, is_free, image_url, r2_path, handling_name, handling, stats, handling_xml } = body;

  if (!name || !brand || !handling_name) {
    return NextResponse.json({ error: "Faltan campos obligatorios: name, brand, handling_name" }, { status: 400 });
  }

  const supabase = supabaseClient();
  const { data, error } = await supabase
    .from("cars")
    .insert({
      name,
      brand,
      category: category ?? "Sport",
      description: description ?? "",
      price: is_free ? 0 : (price ?? 0),
      is_free: is_free ?? false,
      image_url: image_url || null,
      r2_path: r2_path || null,
      handling_name: handling_name.toUpperCase(),
      handling: handling ?? {},
      handling_xml: handling_xml || null,
      stats: stats ?? { speed: 50, acceleration: 50, braking: 50, handling: 50 },
      is_published: false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
