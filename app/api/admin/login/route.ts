import { json, parseBody, readBody, redirectSeeOther, route, wantsHtml } from "@/lib/server/http";
import { clearAuthCookie, setAuthCookie, signAdminToken } from "@/lib/server/auth";
import { AUTH_COOKIES } from "@/lib/config/constants";
import { adminLoginSchema, authenticateManagementUser } from "@/features/management-user";
import type { AdminLoginResponse } from "@/types/api";

export const POST = route(async req => {
  const input = parseBody(adminLoginSchema, await readBody(req));
  const admin = await authenticateManagementUser(input);
  const token = signAdminToken({ sub: admin.id, email: admin.email, role: admin.role });

  const body: AdminLoginResponse = {
    ok: true,
    admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
  };
  const res = wantsHtml(req) ? redirectSeeOther(req, "/dashboard") : json(body);
  setAuthCookie(req, res, AUTH_COOKIES.admin, token);
  clearAuthCookie(req, res, AUTH_COOKIES.impersonator);
  return res;
});
