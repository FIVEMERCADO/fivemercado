import { createHmac } from "crypto";

// DOWNLOAD_SECRET debe estar en .env — mínimo 32 chars aleatorios
// openssl rand -hex 32

export function createDownloadSig(
  scriptId: string,
  userId: string
): { ts: string; nonce: string; sig: string } {
  const ts = String(Date.now());
  // nonce de 16 bytes hex (no usamos crypto.randomUUID porque no está disponible en edge)
  const arr = new Uint8Array(16);
  if (typeof globalThis.crypto !== "undefined") {
    globalThis.crypto.getRandomValues(arr);
  }
  const nonce = Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("").slice(0, 24);

  const sig = createHmac("sha256", process.env.DOWNLOAD_SECRET ?? "missing_secret")
    .update(`${scriptId}:${userId}:${ts}:${nonce}`)
    .digest("hex");

  return { ts, nonce, sig };
}

export function verifyDownloadSig(
  scriptId: string,
  userId: string,
  ts: string,
  nonce: string,
  sig: string
): boolean {
  const tsNum = parseInt(ts, 10);
  if (isNaN(tsNum)) return false;

  // URL válida por 5 minutos (igual que el TTL del nonce en DB)
  if (Date.now() - tsNum > 5 * 60 * 1000) return false;
  // No aceptar timestamps del futuro (>1 min de margen de reloj)
  if (tsNum - Date.now() > 60_000) return false;

  const expected = createHmac("sha256", process.env.DOWNLOAD_SECRET ?? "missing_secret")
    .update(`${scriptId}:${userId}:${ts}:${nonce}`)
    .digest("hex");

  // Comparación en tiempo constante para evitar timing attacks
  return sig.length === expected.length && sig === expected;
}
