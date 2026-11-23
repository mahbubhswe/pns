import { json, parseBody, readBody, route } from "@/lib/server/http";
import { ApiError } from "@/lib/server/http/errors";
import { setAuthCookie, signMemberToken } from "@/lib/server/auth";
import { AUTH_COOKIES } from "@/lib/config/constants";
import { inspectResetLink, resetPassword, resetPasswordSchema } from "@/features/membership";
import type { OkResponse } from "@/types/api";

/** Check a link before showing the form: `?token=…` → the member's name and whether an email is needed. */
export const GET = route(async req => {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) throw ApiError.badRequest("This link is invalid or has expired. Please ask for a new one.");
  return json(await inspectResetLink(token));
});

/** Set the new password and sign the member in. */
export const POST = route(async req => {
  const input = parseBody(resetPasswordSchema, await readBody(req));
  const user = await resetPassword(input);
  const body: OkResponse = { ok: true };
  const res = json(body);
  setAuthCookie(req, res, AUTH_COOKIES.member, signMemberToken({ sub: user.id, email: user.email }));
  return res;
});
