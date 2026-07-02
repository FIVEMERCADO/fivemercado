import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseClient } from "@/lib/supabase";
import { createDownloadSig } from "@/lib/hmac";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const scriptId = params.id;
  const discordId = (session.user as { discordId?: string }).discordId;

  if (!discordId) {
    return NextResponse.json({ error: "Cuenta de Discord no vinculada" }, { status: 403 });
  }

  const supabase = supabaseClient();

  // Resolver usuario
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("discord_id", discordId)
    .single();

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  // Verificar propiedad del script
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("script_id", scriptId)
    .maybeSingle();

  if (!purchase) {
    return NextResponse.json({ error: "No tienes acceso a este recurso" }, { status: 403 });
  }

  // Obtener archivos del script
  const { data: script } = await supabase
    .from("scripts")
    .select("files, title")
    .eq("id", scriptId)
    .single();

  if (!script?.files?.length) {
    return NextResponse.json({ error: "Este recurso no tiene archivos disponibles aún" }, { status: 404 });
  }

  // Generar firma HMAC + nonce
  const { ts, nonce, sig } = createDownloadSig(scriptId, user.id);

  // Eliminar nonces anteriores del mismo usuario+script (uno activo a la vez)
  await supabase
    .from("download_nonces")
    .delete()
    .eq("user_id", user.id)
    .eq("script_id", scriptId);

  // Guardar nonce en DB para single-use enforcement (TTL: 5 min)
  const { error: nonceError } = await supabase.from("download_nonces").insert({
    nonce,
    script_id: scriptId,
    user_id: user.id,
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });

  if (nonceError) {
    return NextResponse.json({ error: "Error generando enlace de descarga" }, { status: 500 });
  }

  const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const downloadUrl = `${BASE_URL}/api/scripts/${scriptId}/download?uid=${encodeURIComponent(user.id)}&ts=${ts}&nonce=${encodeURIComponent(nonce)}&sig=${sig}`;

  return NextResponse.json({ downloadUrl, filename: script.title });
}
