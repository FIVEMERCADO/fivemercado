import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseClient } from "@/lib/supabase";

const PACKAGES = {
  "100": { credits: 100, price: 5.0 },
  "300": { credits: 300, price: 15.0 },
  "500": { credits: 500, price: 25.0 },
  "1000": { credits: 1000, price: 65.0 },
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { package_id } = await req.json();
  const pkg = PACKAGES[package_id as keyof typeof PACKAGES];
  if (!pkg) return NextResponse.json({ error: "Invalid package" }, { status: 400 });

  const supabase = supabaseClient();
  const discordId = (session.user as { discordId?: string }).discordId;

  const { data: user } = await supabase
    .from("users")
    .select("id, credits")
    .eq("discord_id", discordId)
    .single();

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await supabase
    .from("users")
    .update({ credits: user.credits + pkg.credits })
    .eq("id", user.id);

  await supabase.from("transactions").insert({
    user_id: user.id,
    type: "PAYPAL_TOPUP",
    amount: pkg.credits,
    description: `Purchased ${pkg.credits} credits via PayPal (€${pkg.price})`,
  });

  return NextResponse.json({ success: true, newBalance: user.credits + pkg.credits });
}
