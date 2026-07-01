/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "cdn.discordapp.com" },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Impide que el sitio sea embebido en iframes (clickjacking)
          { key: "X-Frame-Options", value: "DENY" },
          // Evita que el browser "adivine" el MIME type
          { key: "X-Content-Type-Options", value: "nosniff" },
          // No filtrar el referrer a otros dominios
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Desactivar APIs de hardware innecesarias
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // No pre-resolver DNS de third parties
          { key: "X-DNS-Prefetch-Control", value: "off" },
        ],
      },
      {
        // Headers extra para las API routes
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
