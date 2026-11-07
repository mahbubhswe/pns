import type { NextApiRequest, NextApiResponse } from "next";
import { parse as parseCookieHeader, serialize as serializeCookie } from "cookie";
import { TOKEN_TTL_SECONDS, type AuthCookieName } from "@/lib/config/constants";

/** Read one cookie from the raw Cookie header. */
export function getCookie(req: NextApiRequest, name: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  const value = parseCookieHeader(header)[name];
  return value ?? null;
}

function isLocalhost(req: NextApiRequest): boolean {
  const host = req.headers.host || "";
  return /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
}

function baseOptions(req: NextApiRequest) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    path: "/",
    secure: !isLocalhost(req) && process.env.NODE_ENV === "production",
  };
}

/** Attach an auth cookie to the response. Multiple Set-Cookie headers are preserved. */
export function setAuthCookie(req: NextApiRequest, res: NextApiResponse, name: AuthCookieName, token: string) {
  appendSetCookie(res, serializeCookie(name, token, { ...baseOptions(req), maxAge: TOKEN_TTL_SECONDS }));
}

export function clearAuthCookie(req: NextApiRequest, res: NextApiResponse, name: AuthCookieName) {
  appendSetCookie(res, serializeCookie(name, "", { ...baseOptions(req), maxAge: 0 }));
}

function appendSetCookie(res: NextApiResponse, cookie: string) {
  const existing = res.getHeader("Set-Cookie");
  const list = Array.isArray(existing) ? existing : existing ? [String(existing)] : [];
  res.setHeader("Set-Cookie", [...list, cookie]);
}
