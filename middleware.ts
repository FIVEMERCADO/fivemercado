import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// Rutas que requieren sesión activa
const PRIVATE_PAGES = ["/profile", "/credits", "/upload"];
const PRIVATE_APIS  = ["/api/generate-code", "/api/purchase", "/api/credits"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPrivatePage = PRIVATE_PAGES.some((p) => pathname.startsWith(p));
  const isPrivateApi  = PRIVATE_APIS.some((p) => pathname.startsWith(p));

  if (!isPrivatePage && !isPrivateApi) return NextResponse.next();

  const session = await auth();

  // API sin sesión → 401 JSON (nunca redirect)
  if (isPrivateApi) {
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Página privada sin sesión → redirect al home con callback
  if (!session?.user) {
    const url = new URL("/", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/credits/:path*",
    "/upload/:path*",
    "/api/generate-code/:path*",
    "/api/purchase/:path*",
    "/api/credits/:path*",
  ],
};
