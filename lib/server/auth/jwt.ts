import jwt from "jsonwebtoken";
import { env } from "@/lib/config/env";
import { TOKEN_TTL_SECONDS } from "@/lib/config/constants";
import type { ManagementRole } from "@/lib/shared/membership";

/** Claims carried by a logged-in member (plot owner) token. */
export type MemberClaims = {
  kind: "member";
  sub: number;
  email: string;
  /** Set when a staff user is logged in as this member: the staff user's id. */
  imp?: number;
};

/** Claims carried by a logged-in management user (dashboard) token. */
export type AdminClaims = {
  kind: "admin";
  sub: number;
  email: string;
  role: ManagementRole;
  /** Set when another staff user is logged in as this one: that staff user's id. */
  imp?: number;
};

type Claims = MemberClaims | AdminClaims;

function sign(claims: Claims, ttlSeconds: number): string {
  return jwt.sign(claims, env.JWT_SECRET, { expiresIn: ttlSeconds });
}

export function signMemberToken(input: Omit<MemberClaims, "kind">, ttlSeconds = TOKEN_TTL_SECONDS): string {
  return sign({ kind: "member", ...input }, ttlSeconds);
}

export function signAdminToken(input: Omit<AdminClaims, "kind">, ttlSeconds = TOKEN_TTL_SECONDS): string {
  return sign({ kind: "admin", ...input }, ttlSeconds);
}

/**
 * Verify a token and make sure it is of the expected kind. Returns null for
 * any invalid, expired or mismatched token; never throws.
 *
 * Tokens issued before the `kind` claim existed are accepted as the requested
 * kind so existing sessions keep working after deploy.
 */
export function verifyToken<K extends Claims["kind"]>(
  token: string,
  kind: K
): Extract<Claims, { kind: K }> | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (!payload || typeof payload !== "object") return null;
    const sub = Number((payload as { sub?: unknown }).sub);
    if (!Number.isInteger(sub) || sub <= 0) return null;
    const claimedKind = (payload as { kind?: unknown }).kind;
    if (claimedKind !== undefined && claimedKind !== kind) return null;
    const rawImp = (payload as { imp?: unknown }).imp;
    const imp = rawImp === undefined ? undefined : Number(rawImp);
    if (imp !== undefined && (!Number.isInteger(imp) || imp <= 0)) return null;
    return { ...(payload as object), kind, sub, imp } as Extract<Claims, { kind: K }>;
  } catch {
    return null;
  }
}
