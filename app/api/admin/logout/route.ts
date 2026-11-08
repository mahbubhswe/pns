import { json, route } from "@/lib/server/http";
import { clearAuthCookie } from "@/lib/server/auth";
import { AUTH_COOKIES } from "@/lib/config/constants";

export const POST = route(async req => {
  const res = json({ ok: true });
  clearAuthCookie(req, res, AUTH_COOKIES.admin);
  // Signing out while logged in as someone ends both sessions.
  clearAuthCookie(req, res, AUTH_COOKIES.impersonator);
  return res;
});
