import { json, route } from "@/lib/server/http";
import { clearAuthCookie } from "@/lib/server/auth";
import { AUTH_COOKIES } from "@/lib/config/constants";

export const POST = route(async req => {
  const res = json({ ok: true });
  clearAuthCookie(req, res, AUTH_COOKIES.member);
  return res;
});
