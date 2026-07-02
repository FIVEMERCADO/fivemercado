import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseClient } from "@/lib/supabase";
import { notifyPurchase } from "@/lib/discord-notify";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { script_id } = await req.json();
  const supabase = supabaseClient();
  const discordId = (session.user as { discordId?: string }).discordId;

  const { data: user } = await supabase
    .from("users")
    .select("id, credits")
    .eq("discord_id", discordId)
    .single();

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { data: script } = await supabase
    .from("scripts")
    .select("id, price, is_free, title, author_id")
    .eq("id", script_id)
    .single();

  if (!script) return NextResponse.json({ error: "Script not found" }, { status: 404 });

  const alreadyPurchased = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("script_id", script_id)
    .maybeSingle();

  if (alreadyPurchased.data) {
    return NextResponse.json({ error: "Already purchased" }, { status: 409 });
  }

  if (!script.is_free) {
    if (user.credits < script.price) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }
    // Deduct credits
    await supabase
      .from("users")
      .update({ credits: user.credits - script.price })
      .eq("id", user.id);

    // Credit the author
    if (script.author_id) {
      const { data: author } = await supabase
        .from("users")
        .select("id, credits")
        .eq("id", script.author_id)
        .single();
      if (author) {
        await supabase
          .from("users")
          .update({ credits: author.credits + script.price })
          .eq("id", script.author_id);
        await supabase.from("transactions").insert({
          user_id: script.author_id,
          type: "SCRIPT_SALE",
          amount: script.price,
          description: `Sale: ${script.title}`,
        });
      }
    }

    // Record buyer transaction
    await supabase.from("transactions").insert({
      user_id: user.id,
      type: "PURCHASE",
      amount: -script.price,
      description: `Purchased: ${script.title}`,
    });
  }

  // Record purchase
  await supabase.from("purchases").insert({
    user_id: user.id,
    script_id: script_id,
    price_paid: script.is_free ? 0 : script.price,
  });

  // DM automático via Discord bot — fire & forget (no bloquea la respuesta)
  if (discordId) {
    notifyPurchase({
      discordId,
      userId: user.id,
      scriptId: script_id,
      scriptTitle: script.title,
      pricePaid: script.is_free ? 0 : script.price,
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
