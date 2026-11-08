import { json, parseIdParam, route } from "@/lib/server/http";
import { ApiError } from "@/lib/server/http/errors";
import { requireAdmin, setAuthCookie, signMemberToken } from "@/lib/server/auth";
import { AUTH_COOKIES, IMPERSONATION_TTL_SECONDS } from "@/lib/config/constants";
import { requirePermission } from "@/features/access";
import { startMemberImpersonation } from "@/features/impersonation";
import type { ImpersonationResponse } from "@/types/api";

type Params = { id: string };

/**
 * Log in as a member. Members use their own cookie, so the staff session stays
 * signed in to the dashboard; the member session opens at /profile.
 */
export const POST = route<Params>(async (req, { params }) => {
  const actor = await requirePermission(req, "members.impersonate");
  if (requireAdmin(req).imp) throw ApiError.badRequest("Return to your own account before logging in as a member.");

  const member = await startMemberImpersonation(actor, parseIdParam(params.id));
  const token = signMemberToken({ sub: member.id, email: member.email, imp: actor.id }, IMPERSONATION_TTL_SECONDS);

  const body: ImpersonationResponse = { ok: true, redirectTo: "/profile" };
  const res = json(body);
  setAuthCookie(req, res, AUTH_COOKIES.member, token, IMPERSONATION_TTL_SECONDS);
  return res;
});
