import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseClient } from "@/lib/supabase";

export async function GET() {
  const supabase = supabaseClient();
  const { data, error } = await supabase
    .from("cars")
    .select("id, name, brand, category, price, is_free, image_url, stats, handling_name, description")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
