import { json, parseIdParam, route } from "@/lib/server/http";
import { ApiError } from "@/lib/server/http/errors";
import { getCookie, requireAdmin, setAuthCookie, signAdminToken } from "@/lib/server/auth";
import { AUTH_COOKIES, IMPERSONATION_TTL_SECONDS } from "@/lib/config/constants";
import { legacyRoleFor } from "@/lib/shared/permissions";
import { requirePermission } from "@/features/access";
import { startStaffImpersonation } from "@/features/impersonation";
import type { ImpersonationResponse } from "@/types/api";

type Params = { id: string };

/**
 * Log in as another staff user. The caller's own admin token is parked in a
 * separate httpOnly cookie so "Return to my account" can restore it.
 */
export const POST = route<Params>(async (req, { params }) => {
  const actor = await requirePermission(req, "users.impersonate");
  if (requireAdmin(req).imp) throw ApiError.badRequest("Return to your own account before logging in as someone else.");
  const ownToken = getCookie(req, AUTH_COOKIES.admin)!;

  const target = await startStaffImpersonation(actor, parseIdParam(params.id));
  const token = signAdminToken(
    { sub: target.id, email: target.email, role: legacyRoleFor(target.permissions), imp: actor.id },
    IMPERSONATION_TTL_SECONDS
  );

  const body: ImpersonationResponse = { ok: true, redirectTo: "/dashboard" };
  const res = json(body);
  setAuthCookie(req, res, AUTH_COOKIES.impersonator, ownToken, IMPERSONATION_TTL_SECONDS);
  setAuthCookie(req, res, AUTH_COOKIES.admin, token, IMPERSONATION_TTL_SECONDS);
  return res;
});
