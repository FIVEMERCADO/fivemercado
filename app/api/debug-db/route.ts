import { NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "NOT SET";
  const key = process.env.SUPABASE_SERVICE_KEY
    ? "SET (" + process.env.SUPABASE_SERVICE_KEY.slice(0, 20) + "...)"
    : "NOT SET";

  const supabase = supabaseClient();
  const { data, error } = await supabase.from("cars").select("id,name").limit(2);

  return NextResponse.json({ url, key, data, error });
}
