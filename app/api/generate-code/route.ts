import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseClient } from "@/lib/supabase";

// ── Rate limiter en memoria ──────────────────────────────────────────────────
// En producción usar Upstash Redis. Aquí funciona por instancia serverless.
const RL = new Map<string, { count: number; resetAt: number }>();
const RL_MAX  = 5;               // máximo 5 códigos
const RL_WINDOW = 60 * 60 * 1000; // por hora

function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = RL.get(userId);

  if (!entry || now > entry.resetAt) {
    RL.set(userId, { count: 1, resetAt: now + RL_WINDOW });
    return { allowed: true, remaining: RL_MAX - 1 };
  }

  if (entry.count >= RL_MAX) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: RL_MAX - entry.count };
}

// ── Código alfanumérico seguro ───────────────────────────────────────────────
function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ── POST /api/generate-code ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Autenticación
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { script_id } = body;

  if (!script_id || typeof script_id !== "string") {
    return NextResponse.json({ error: "script_id requerido" }, { status: 400 });
  }

  const discordId = (session.user as { discordId?: string }).discordId;
  if (!discordId) {
    return NextResponse.json({ error: "Cuenta de Discord no vinculada" }, { status: 403 });
  }

  const supabase = supabaseClient();

  // 2. Resolver usuario en DB
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("discord_id", discordId)
    .single();

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  // 3. Rate limit — 5 códigos/hora por usuario
  const rl = checkRateLimit(user.id);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Límite de códigos alcanzado. Intenta de nuevo en 1 hora." },
      {
        status: 429,
        headers: { "Retry-After": "3600", "X-RateLimit-Remaining": "0" },
      }
    );
  }

  // 4. Verificar que el usuario REALMENTE compró este script
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("script_id", script_id)
    .single();

  if (!purchase) {
    return NextResponse.json(
      { error: "No tienes este script en tu biblioteca" },
      { status: 403 }
    );
  }

  // 5. Invalidar códigos anteriores no usados para esta compra
  await supabase
    .from("redeem_codes")
    .update({ used: true, used_at: new Date().toISOString() })
    .eq("purchase_id", purchase.id)
    .eq("used", false);

  // 6. Generar y guardar nuevo código
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
    console.error("Error generando código:", error);
    return NextResponse.json({ error: "Error interno al generar código" }, { status: 500 });
  }

  return NextResponse.json(
    { code: redeemCode.code },
    { headers: { "X-RateLimit-Remaining": String(rl.remaining) } }
  );
}
