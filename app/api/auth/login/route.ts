import { json, parseBody, readBody, redirectSeeOther, route, wantsHtml } from "@/lib/server/http";
import { setAuthCookie, signMemberToken } from "@/lib/server/auth";
import { AUTH_COOKIES } from "@/lib/config/constants";
import { authenticateMember, memberLoginSchema } from "@/features/membership";
import type { MemberLoginResponse } from "@/types/api";

export const POST = route(async req => {
  const input = parseBody(memberLoginSchema, await readBody(req));
  const user = await authenticateMember(input);
  const token = signMemberToken({ sub: user.id, email: user.email });

  const body: MemberLoginResponse = {
    ok: true,
    user: { id: user.id, email: user.email, name: user.ownerNameEnglish, status: user.status },
  };
  const res = wantsHtml(req) ? redirectSeeOther(req, "/profile") : json(body);
  setAuthCookie(req, res, AUTH_COOKIES.member, token);
  return res;
});
