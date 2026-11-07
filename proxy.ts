import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIES } from "@/lib/config/constants";

/**
 * Page-level redirects based on the presence of auth cookies.
 *
 * This is a UX convenience only: it runs on the edge and does not verify the
 * token signature. Every API route re-verifies the JWT with `requireAdmin` /
 * `requireMember`, so a forged cookie can reach a page shell but no data.
 */
const MEMBER_AUTH_PAGES = ["/auth/login", "/auth/register"];
const MEMBER_PROTECTED = ["/profile"];
const ADMIN_PROTECTED = ["/dashboard"];

const startsWithAny = (pathname: string, prefixes: string[]) =>
  prefixes.some(p => pathname === p || pathname.startsWith(`${p}/`));

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasMemberToken = Boolean(req.cookies.get(AUTH_COOKIES.member)?.value);
  const hasAdminToken = Boolean(req.cookies.get(AUTH_COOKIES.admin)?.value);

  const redirectTo = (path: string) => {
    const url = req.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    return NextResponse.redirect(url);
  };

  if (hasMemberToken && startsWithAny(pathname, MEMBER_AUTH_PAGES)) return redirectTo("/profile");
  if (!hasMemberToken && startsWithAny(pathname, MEMBER_PROTECTED)) return redirectTo("/auth/login");
  if (!hasAdminToken && startsWithAny(pathname, ADMIN_PROTECTED)) return redirectTo("/admin/login");

  return NextResponse.next();
}

export const config = {
  // Exclude API routes, Next internals and static assets; only run on pages.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|uploads/).*)"],
};
