import { NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "NOT SET";
  const key = process.env.SUPABASE_SERVICE_KEY ? "SET" : "NOT SET";

  const supabase = supabaseClient();
  const { data, error } = await supabase.from("cars").select("id,name").limit(2);

  return NextResponse.json({
    url,
    key,
    data,
    error: error ? {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      str: String(error),
    } : null,
  });
}
