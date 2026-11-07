import { json, parseBody, readBody, route } from "@/lib/server/http";
import { setAuthCookie, signAdminToken } from "@/lib/server/auth";
import { AUTH_COOKIES } from "@/lib/config/constants";
import { logger } from "@/lib/server/logger";
import { createFirstAdmin, needsInitialSetup, setupAdminSchema } from "@/features/management-user";
import type { AdminLoginResponse, SetupStatusResponse } from "@/types/api";

export const dynamic = "force-dynamic";

/**
 * First-run setup. Public by necessity (there is nobody to authenticate yet),
 * but POST is refused as soon as any management user exists.
 */
export const GET = route(async () => {
  const body: SetupStatusResponse = { needsSetup: await needsInitialSetup() };
  return json(body);
});

export const POST = route(async req => {
  const input = parseBody(setupAdminSchema, await readBody(req));
  const admin = await createFirstAdmin(input);
  logger.info("Initial admin created via setup", { adminId: admin.id });

  const token = signAdminToken({ sub: admin.id, email: admin.email, role: admin.role });
  const body: AdminLoginResponse = {
    ok: true,
    admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
  };
  const res = json(body, 201);
  setAuthCookie(req, res, AUTH_COOKIES.admin, token);
  return res;
});
