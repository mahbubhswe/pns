/**
 * Server-side constants. Business constants shared with the browser live in
 * `lib/shared/*` instead; this file is for infrastructure knobs only.
 */

export const AUTH_COOKIES = {
  /** Logged-in member (plot owner). */
  member: "pns_token",
  /** Logged-in management user (dashboard). */
  admin: "admin_token",
  /** While a staff user is logged in as someone else: their own admin token, to return to. */
  impersonator: "admin_impersonator",
} as const;

export type AuthCookieName = (typeof AUTH_COOKIES)[keyof typeof AUTH_COOKIES];

/** JWT lifetime, in seconds. Cookie maxAge uses the same value. */
export const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

/** "Log in as" sessions are short-lived: they end on their own after this. */
export const IMPERSONATION_TTL_SECONDS = 60 * 60; // 1 hour

export const BCRYPT_ROUNDS = 10;

export const UPLOAD_LIMITS = {
  /** Images: avatars, owner photos, post covers. */
  imageBytes: 10 * 1024 * 1024,
  /** Documents: ownership proofs, payment receipts. */
  documentBytes: 10 * 1024 * 1024,
  /** Preview PDFs uploaded from the dashboard. */
  previewBytes: 20 * 1024 * 1024,
} as const;

/** Local upload folders, relative to `public/`. */
export const UPLOAD_FOLDERS = {
  general: "uploads",
  previews: "uploads/previews",
} as const;
