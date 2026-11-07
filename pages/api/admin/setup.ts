import { createApiHandler, parseBody } from "@/lib/server/http";
import { setAuthCookie, signAdminToken } from "@/lib/server/auth";
import { AUTH_COOKIES } from "@/lib/config/constants";
import { logger } from "@/lib/server/logger";
import { createFirstAdmin, needsInitialSetup, setupAdminSchema } from "@/features/management-user";
import type { AdminLoginResponse, SetupStatusResponse } from "@/types/api";

/**
 * First-run setup. Public by necessity (there is nobody to authenticate yet),
 * but POST is refused as soon as any management user exists.
 */
const handler = createApiHandler(["GET", "POST"]);

handler.get(async (_req, res) => {
  const body: SetupStatusResponse = { needsSetup: await needsInitialSetup() };
  res.status(200).json(body);
});

handler.post(async (req, res) => {
  const input = parseBody(setupAdminSchema, req.body);
  const admin = await createFirstAdmin(input);
  logger.info("Initial admin created via setup", { adminId: admin.id });

  // Log the new admin in straight away.
  const token = signAdminToken({ sub: admin.id, email: admin.email, role: admin.role });
  setAuthCookie(req, res, AUTH_COOKIES.admin, token);

  const body: AdminLoginResponse = {
    ok: true,
    admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
  };
  res.status(201).json(body);
});

export default handler;
