import type { NextRequest, NextResponse } from "next/server";
import { TOKEN_TTL_SECONDS, type AuthCookieName } from "@/lib/config/constants";

/** Read one cookie from the request. */
export function getCookie(req: NextRequest, name: string): string | null {
  return req.cookies.get(name)?.value ?? null;
}

function isLocalhost(req: NextRequest): boolean {
  const host = req.headers.get("host") || "";
  return /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
}

function baseOptions(req: NextRequest) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: !isLocalhost(req) && process.env.NODE_ENV === "production",
  };
}

/** Attach an auth cookie to a response (JSON or redirect). */
export function setAuthCookie(
  req: NextRequest,
  res: NextResponse,
  name: AuthCookieName,
  token: string,
  maxAge: number = TOKEN_TTL_SECONDS
): void {
  res.cookies.set({ name, value: token, ...baseOptions(req), maxAge });
}

export function clearAuthCookie(req: NextRequest, res: NextResponse, name: AuthCookieName): void {
  res.cookies.set({ name, value: "", ...baseOptions(req), maxAge: 0 });
}
