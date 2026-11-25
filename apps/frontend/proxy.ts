import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route guard, runs before the page renders.
 *  - /account, /checkout : need a login cookie (the API still verifies it on every call)
 *  - /admin              : the session is verified with the API and must belong to an ADMIN
 */
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://localhost:5000";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  const toLogin = () => {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  };

  if (!token) return toLogin();

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    try {
      const res = await fetch(`${BACKEND_ORIGIN}/api/auth/me`, {
        headers: { cookie: `auth_token=${token}` },
        cache: "no-store",
      });
      if (res.status === 401) return toLogin();
      const body = (await res.json()) as { user?: { role?: string } };
      if (body.user?.role !== "ADMIN") return NextResponse.redirect(new URL("/", request.url));
    } catch {
      // API unreachable: don't expose the admin area, and don't trap the user either.
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout/:path*"],
};
