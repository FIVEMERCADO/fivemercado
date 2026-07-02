import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.SUPABASE_URL ?? "NOT SET";

  // Test raw fetch
  let fetchResult = "not tried";
  try {
    const res = await fetch(`${url}/cars?limit=1`, {
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        apikey: process.env.SUPABASE_SERVICE_KEY ?? "",
      },
    });
    fetchResult = `HTTP ${res.status} — ${await res.text().then(t => t.slice(0, 200))}`;
  } catch (e: unknown) {
    fetchResult = `FETCH ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json({ url, fetchResult });
}
