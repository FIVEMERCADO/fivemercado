const { createHmac, randomBytes } = require("crypto");

/**
 * Genera firma HMAC-SHA256 para una URL de descarga.
 * Idéntica lógica a lib/hmac.ts del proyecto Next.js.
 */
function createDownloadSig(scriptId, userId) {
  const ts    = String(Date.now());
  const nonce = randomBytes(12).toString("hex"); // 24 hex chars, suficientemente único
  const sig   = createHmac("sha256", process.env.DOWNLOAD_SECRET ?? "missing_secret")
    .update(`${scriptId}:${userId}:${ts}:${nonce}`)
    .digest("hex");
  return { ts, nonce, sig };
}

/**
 * Genera la URL de descarga firmada y guarda el nonce en DB (single-use).
 * @returns {Promise<string>} URL completa lista para compartir por DM
 */
async function generateDownloadUrl(supabase, scriptId, userId) {
  const { ts, nonce, sig } = createDownloadSig(scriptId, userId);

  // Eliminar nonces anteriores del mismo usuario+script
  await supabase
    .from("download_nonces")
    .delete()
    .eq("user_id", userId)
    .eq("script_id", scriptId);

  // Guardar nuevo nonce (TTL 5 minutos)
  await supabase.from("download_nonces").insert({
    nonce,
    script_id: scriptId,
    user_id:   userId,
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });

  const SITE = process.env.SITE_URL ?? "https://fivemercado.vercel.app";
  return `${SITE}/api/scripts/${scriptId}/download?uid=${encodeURIComponent(userId)}&ts=${ts}&nonce=${encodeURIComponent(nonce)}&sig=${sig}`;
}

module.exports = { generateDownloadUrl };
