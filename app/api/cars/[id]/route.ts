import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = supabaseClient();
  const { data, error } = await supabase
    .from("cars")
    .select("id, name, brand, category, price, is_free, image_url, stats, handling_name, handling, description")
    .eq("id", params.id)
    .eq("is_published", true)
    .single();

  if (error || !data) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(data);
}
