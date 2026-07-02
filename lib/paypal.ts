// Helper para la PayPal REST API v2
// PAYPAL_SANDBOX=true → sandbox.paypal.com  (testing)
// PAYPAL_SANDBOX=false / omitido → api.paypal.com  (producción)

export const PAYPAL_BASE =
  process.env.PAYPAL_SANDBOX === "true"
    ? "https://api.sandbox.paypal.com"
    : "https://api.paypal.com";

export const PACKAGES: Record<string, { credits: number; amount: string }> = {
  "100":  { credits: 100,  amount: "5.00"  },
  "300":  { credits: 300,  amount: "15.00" },
  "500":  { credits: 500,  amount: "25.00" },
  "1000": { credits: 1000, amount: "65.00" },
};

export async function getPayPalAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString("base64");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal auth failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token as string;
}
