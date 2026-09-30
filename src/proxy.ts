import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/signedToken";

const ADMIN_COOKIE_NAME = "collaktiv_admin_session";

function hasValidAdminCookie(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const payload = verifyToken<{ admin: true; exp: number }>(token, secret);
  return payload?.admin === true;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/admin/login" ||
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/logout"
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    if (!hasValidAdminCookie(request)) {
      return NextResponse.json({ error: "Ej inloggad." }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!hasValidAdminCookie(request)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
