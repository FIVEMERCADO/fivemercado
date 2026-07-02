import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase";
import { verifyDownloadSig } from "@/lib/hmac";

// No requiere sesión — la URL firmada + nonce es la credencial completa
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = req.nextUrl;
  const scriptId = params.id;
  const uid   = searchParams.get("uid")   ?? "";
  const ts    = searchParams.get("ts")    ?? "";
  const nonce = searchParams.get("nonce") ?? "";
  const sig   = searchParams.get("sig")   ?? "";

  const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  // Capa 1 — Verificar firma HMAC + expiración (5 min, stateless)
  if (!uid || !ts || !nonce || !sig || !verifyDownloadSig(scriptId, uid, ts, nonce, sig)) {
    return NextResponse.redirect(`${BASE_URL}/marketplace?error=enlace_invalido_o_expirado`);
  }

  const supabase = supabaseClient();

  // Capa 2 — Verificar y consumir nonce (single-use, anti-replay, DB-backed)
  const { data: nonceRecord } = await supabase
    .from("download_nonces")
    .select("nonce")
    .eq("nonce", nonce)
    .eq("script_id", scriptId)
    .eq("user_id", uid)
    .gt("expires_at", new Date().toISOString()) // no expirado
    .maybeSingle();

  if (!nonceRecord) {
    return NextResponse.redirect(`${BASE_URL}/marketplace?error=enlace_ya_usado_o_expirado`);
  }

  // Consumir el nonce — a partir de aquí la URL no puede reutilizarse
  await supabase.from("download_nonces").delete().eq("nonce", nonce);

  // Capa 3 — Verificar propiedad del script
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", uid)
    .eq("script_id", scriptId)
    .maybeSingle();

  if (!purchase) {
    return NextResponse.redirect(`${BASE_URL}/marketplace?error=sin_acceso`);
  }

  // Obtener URL del archivo
  const { data: script } = await supabase
    .from("scripts")
    .select("files")
    .eq("id", scriptId)
    .single();

  const fileUrl = script?.files?.[0];
  if (!fileUrl) {
    return NextResponse.redirect(`${BASE_URL}/marketplace?error=sin_archivos`);
  }

  // Registrar descarga (fire-and-forget)
  void supabase.from("transactions").insert({
    user_id: uid,
    type: "DOWNLOAD",
    amount: 0,
    description: `Descarga del script ${scriptId}`,
  });

  // Redirigir al archivo real
  return NextResponse.redirect(fileUrl);
}
