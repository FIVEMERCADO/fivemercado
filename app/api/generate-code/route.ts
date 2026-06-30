import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseClient } from "@/lib/supabase";

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { script_id } = body;

  if (!script_id) {
    return NextResponse.json({ error: "Missing script_id" }, { status: 400 });
  }

  const supabase = supabaseClient();
  const discordId = (session.user as { discordId?: string }).discordId;

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("discord_id", discordId)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("script_id", script_id)
    .single();

  if (!purchase) {
    return NextResponse.json({ error: "You have not purchased this script" }, { status: 403 });
  }

  // Invalidate existing unused codes for this purchase
  await supabase
    .from("redeem_codes")
    .update({ used: true, used_at: new Date().toISOString() })
    .eq("purchase_id", purchase.id)
    .eq("used", false);

  // Generate new code
  const code = generateCode();

  const { data: redeemCode, error } = await supabase
    .from("redeem_codes")
    .insert({
      purchase_id: purchase.id,
      user_id: user.id,
      script_id: script_id,
      code: code,
      used: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });
  }

  return NextResponse.json({ code: redeemCode.code });
}
