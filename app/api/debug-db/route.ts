import { NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const url1 = process.env.SUPABASE_URL ?? "NOT SET";
  const url2 = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "NOT SET";
  const key  = process.env.SUPABASE_SERVICE_KEY
    ? "SET (" + process.env.SUPABASE_SERVICE_KEY.slice(0, 20) + "...)"
    : "NOT SET";

  const supabase = supabaseClient();
  const { data, error } = await supabase.from("cars").select("id,name").limit(2);

  return NextResponse.json({ SUPABASE_URL: url1, NEXT_PUBLIC_SUPABASE_URL: url2, SUPABASE_SERVICE_KEY: key, data, error });
}
