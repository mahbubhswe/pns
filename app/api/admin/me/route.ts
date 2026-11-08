import { json, route } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/auth";
import { requirePermission } from "@/features/access";
import { describeImpersonator } from "@/features/impersonation";
import type { AdminMeResponse } from "@/types/api";

export const dynamic = "force-dynamic";

/** The signed-in staff member and their permissions (drives the dashboard navigation). */
export const GET = route(async req => {
  const admin = await requirePermission(req);
  const impersonatedBy = await describeImpersonator(requireAdmin(req).imp);
  const body: AdminMeResponse = { admin: { ...admin, impersonatedBy } };
  return json(body, { headers: { "Cache-Control": "no-store" } });
});
