import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// Requieren sesión
const PRIVATE_PAGES = ["/profile", "/credits", "/upload", "/marketplace"];
const PRIVATE_APIS  = [
  "/api/generate-code",
  "/api/purchase",
  "/api/credits",
  "/api/paypal/create",
];

// Además de sesión, requieren membresía en el servidor Discord
const GUILD_PAGES = ["/marketplace", "/profile", "/credits", "/upload"];
const GUILD_APIS  = ["/api/purchase", "/api/credits", "/api/paypal/create", "/api/generate-code"];

// Nota: /api/scripts/[id]/download NO está aquí — su credencial es la firma HMAC

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPrivatePage = PRIVATE_PAGES.some((p) => pathname.startsWith(p));
  const isPrivateApi  = PRIVATE_APIS.some((p) => pathname.startsWith(p));

  if (!isPrivatePage && !isPrivateApi) return NextResponse.next();

  const session = await auth();

  // ── Sin sesión ──────────────────────────────────────────────────────────────
  if (!session?.user) {
    if (isPrivateApi) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const url = new URL("/", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // ── Sesión activa pero no está en el servidor Discord ───────────────────────
  const guildMember = (session.user as { guildMember?: boolean }).guildMember ?? false;
  const needsGuild  = GUILD_PAGES.some((p) => pathname.startsWith(p)) ||
                      GUILD_APIS.some((p) => pathname.startsWith(p));

  if (needsGuild && !guildMember) {
    if (isPrivateApi) {
      return NextResponse.json(
        { error: "Debes unirte al servidor de Discord de FiveMercado para acceder." },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL("/join", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/marketplace/:path*",
    "/profile/:path*",
    "/credits/:path*",
    "/upload/:path*",
    "/api/generate-code/:path*",
    "/api/purchase/:path*",
    "/api/credits/:path*",
    "/api/paypal/create",
  ],
};
