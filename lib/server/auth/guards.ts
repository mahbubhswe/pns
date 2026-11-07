import type { NextRequest } from "next/server";
import { AUTH_COOKIES } from "@/lib/config/constants";
import { ApiError } from "@/lib/server/http/errors";
import { getCookie } from "./cookies";
import { verifyToken, type AdminClaims, type MemberClaims } from "./jwt";

/**
 * Request guards for Route Handlers. Each returns the verified claims or
 * throws an `ApiError` that `route()` turns into 401 / 403.
 *
 *   export const GET = route(async req => {
 *     const admin = requireAdmin(req);
 *     ...
 *   });
 */

/** Resolve the current admin from the request cookie, or null. */
export function getAdminFromRequest(req: NextRequest): AdminClaims | null {
  const token = getCookie(req, AUTH_COOKIES.admin);
  return token ? verifyToken(token, "admin") : null;
}

export function getMemberFromRequest(req: NextRequest): MemberClaims | null {
  const token = getCookie(req, AUTH_COOKIES.member);
  return token ? verifyToken(token, "member") : null;
}

export function requireAdmin(req: NextRequest): AdminClaims {
  const admin = getAdminFromRequest(req);
  if (!admin) throw ApiError.unauthorized();
  return admin;
}

export function requireMember(req: NextRequest): MemberClaims {
  const member = getMemberFromRequest(req);
  if (!member) throw ApiError.unauthorized();
  return member;
}

/** Restrict a handler to specific management roles, e.g. `requireRole(req, "ADMIN")`. */
export function requireRole(req: NextRequest, ...roles: AdminClaims["role"][]): AdminClaims {
  const admin = requireAdmin(req);
  if (!roles.includes(admin.role)) throw ApiError.forbidden();
  return admin;
}

// ---------------------------------------------------------------------------
// Server Components / layouts (read-only cookie store from `next/headers`)

type CookieReader = { get(name: string): { value: string } | undefined };

export function getAdminFromCookies(store: CookieReader): AdminClaims | null {
  const token = store.get(AUTH_COOKIES.admin)?.value;
  return token ? verifyToken(token, "admin") : null;
}

export function getMemberFromCookies(store: CookieReader): MemberClaims | null {
  const token = store.get(AUTH_COOKIES.member)?.value;
  return token ? verifyToken(token, "member") : null;
}
