/** @type {import('next').NextConfig} */

// CSP — Next.js 14 App Router necesita 'unsafe-inline'/'unsafe-eval' para el runtime.
// En el futuro se puede migrar a nonce-based CSP via middleware.
const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://cdn.discordapp.com https://api.dicebear.com https://*.supabase.co https://img.fivemercado.com",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "media-src 'self' https://img.fivemercado.com",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "cdn.discordapp.com" },
      { protocol: "https", hostname: "img.fivemercado.com" },
    ],
  },

  async headers() {
    return [
      {
        // Headers globales — todas las rutas
        source: "/(.*)",
        headers: [
          // Anti-clickjacking (SAMEORIGIN permite embeber dentro del mismo dominio)
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Evita que el browser "adivine" el MIME type → previene MIME sniffing attacks
          { key: "X-Content-Type-Options", value: "nosniff" },
          // No filtrar referrer a dominios externos
          { key: "Referrer-Policy", value: "same-origin" },
          // HSTS — fuerza HTTPS durante 1 año, incluye subdominios
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Previene ataques Spectre via cross-origin window.opener access
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          // Aislamiento del agente de origen (performance + seguridad)
          { key: "Origin-Agent-Cluster", value: "?1" },
          // Desactiva APIs de hardware innecesarias + FLoC/Topics API
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          // No pre-resolver DNS de terceros
          { key: "X-DNS-Prefetch-Control", value: "off" },
          // Previene apertura directa de archivos descargados en IE/Edge legacy
          { key: "X-Download-Options", value: "noopen" },
          // Bloquea Flash/Acrobat cross-domain policies
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          // Content Security Policy
          { key: "Content-Security-Policy", value: ContentSecurityPolicy },
        ],
      },
      {
        // API routes — más estrictas: nunca cachear, CSP sin scripts
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // El API sólo devuelve JSON — ningún recurso externo necesario
          { key: "Content-Security-Policy", value: "default-src 'none'; frame-ancestors 'none'" },
        ],
      },
    ];
  },
};

export default nextConfig;
