import { json, route } from "@/lib/server/http";
import { clearAuthCookie, getMemberFromRequest } from "@/lib/server/auth";
import { AUTH_COOKIES } from "@/lib/config/constants";
import { logImpersonationStop } from "@/features/impersonation";

export const POST = route(async req => {
  const member = getMemberFromRequest(req);
  if (member?.imp) logImpersonationStop("member", member.imp, member.sub);
  const res = json({ ok: true });
  clearAuthCookie(req, res, AUTH_COOKIES.member);
  return res;
});
