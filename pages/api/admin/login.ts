import { createApiHandler, parseBody, redirectSeeOther, wantsHtml } from "@/lib/server/http";
import { setAuthCookie, signAdminToken } from "@/lib/server/auth";
import { AUTH_COOKIES } from "@/lib/config/constants";
import { adminLoginSchema, authenticateManagementUser } from "@/features/management-user";
import type { AdminLoginResponse } from "@/types/api";

const handler = createApiHandler(["POST"]);

handler.post(async (req, res) => {
  const input = parseBody(adminLoginSchema, req.body);
  const admin = await authenticateManagementUser(input);

  const token = signAdminToken({ sub: admin.id, email: admin.email, role: admin.role });
  setAuthCookie(req, res, AUTH_COOKIES.admin, token);

  if (wantsHtml(req)) return redirectSeeOther(res, "/dashboard");

  const body: AdminLoginResponse = {
    ok: true,
    admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
  };
  res.status(200).json(body);
});

export default handler;
