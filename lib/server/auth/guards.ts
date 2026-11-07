import type { NextApiRequest, NextApiResponse } from "next";
import type { NextHandler } from "next-connect";
import { AUTH_COOKIES } from "@/lib/config/constants";
import { ApiError } from "@/lib/server/http/errors";
import { getCookie } from "./cookies";
import { verifyToken, type AdminClaims, type MemberClaims } from "./jwt";

/** Request with a verified management user attached. */
export type AdminRequest = NextApiRequest & { admin: AdminClaims };
/** Request with a verified member attached. */
export type MemberRequest = NextApiRequest & { member: MemberClaims };

/**
 * Resolve the current admin from the request cookie, or null.
 * Use this when auth is optional, or outside next-connect (multipart routes).
 */
export function getAdminFromRequest(req: NextApiRequest): AdminClaims | null {
  const token = getCookie(req, AUTH_COOKIES.admin);
  return token ? verifyToken(token, "admin") : null;
}

export function getMemberFromRequest(req: NextApiRequest): MemberClaims | null {
  const token = getCookie(req, AUTH_COOKIES.member);
  return token ? verifyToken(token, "member") : null;
}

/** Throwing variants, for use inside plain handlers. */
export function requireAdminClaims(req: NextApiRequest): AdminClaims {
  const admin = getAdminFromRequest(req);
  if (!admin) throw ApiError.unauthorized();
  return admin;
}

export function requireMemberClaims(req: NextApiRequest): MemberClaims {
  const member = getMemberFromRequest(req);
  if (!member) throw ApiError.unauthorized();
  return member;
}

/**
 * next-connect middleware: `handler.use(requireAdmin)`.
 * Attaches `req.admin` and short-circuits with 401 otherwise.
 */
export function requireAdmin(req: NextApiRequest, _res: NextApiResponse, next: NextHandler) {
  (req as AdminRequest).admin = requireAdminClaims(req);
  return next();
}

export function requireMember(req: NextApiRequest, _res: NextApiResponse, next: NextHandler) {
  (req as MemberRequest).member = requireMemberClaims(req);
  return next();
}

/** Restrict a route to specific management roles, e.g. `requireRole("ADMIN")`. */
export function requireRole(...roles: AdminClaims["role"][]) {
  return (req: NextApiRequest, _res: NextApiResponse, next: NextHandler) => {
    const admin = (req as AdminRequest).admin ?? requireAdminClaims(req);
    if (!roles.includes(admin.role)) throw ApiError.forbidden();
    (req as AdminRequest).admin = admin;
    return next();
  };
}
