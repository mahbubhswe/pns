import { json, route } from "@/lib/server/http";
import { ApiError } from "@/lib/server/http/errors";
import { clearAuthCookie, getAdminFromRequest, getCookie, setAuthCookie, verifyToken } from "@/lib/server/auth";
import { AUTH_COOKIES } from "@/lib/config/constants";
import { logImpersonationStop } from "@/features/impersonation";
import type { ImpersonationResponse } from "@/types/api";

/** "Return to my account": swap the parked staff token back in. */
export const POST = route(async req => {
  const current = getAdminFromRequest(req);
  const parked = getCookie(req, AUTH_COOKIES.impersonator);
  const own = parked ? verifyToken(parked, "admin") : null;
  if (!current?.imp || !own || own.sub !== current.imp) {
    throw ApiError.badRequest("You are not logged in as someone else.");
  }

  logImpersonationStop("staff", own.sub, current.sub);
  const body: ImpersonationResponse = { ok: true, redirectTo: "/dashboard/users" };
  const res = json(body);
  setAuthCookie(req, res, AUTH_COOKIES.admin, parked!);
  clearAuthCookie(req, res, AUTH_COOKIES.impersonator);
  return res;
});
