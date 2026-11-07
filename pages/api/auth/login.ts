import { createApiHandler, parseBody, redirectSeeOther, wantsHtml } from "@/lib/server/http";
import { setAuthCookie, signMemberToken } from "@/lib/server/auth";
import { AUTH_COOKIES } from "@/lib/config/constants";
import { authenticateMember, memberLoginSchema } from "@/features/membership";
import type { MemberLoginResponse } from "@/types/api";

const handler = createApiHandler(["POST"]);

handler.post(async (req, res) => {
  const input = parseBody(memberLoginSchema, req.body);
  const user = await authenticateMember(input);

  const token = signMemberToken({ sub: user.id, email: user.email });
  setAuthCookie(req, res, AUTH_COOKIES.member, token);

  if (wantsHtml(req)) return redirectSeeOther(res, "/profile");

  const body: MemberLoginResponse = {
    ok: true,
    user: { id: user.id, email: user.email, name: user.ownerNameEnglish, status: user.status },
  };
  res.status(200).json(body);
});

export default handler;
