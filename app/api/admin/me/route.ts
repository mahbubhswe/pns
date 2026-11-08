import { json, route } from "@/lib/server/http";
import { requirePermission } from "@/features/access";
import type { AdminMeResponse } from "@/types/api";

export const dynamic = "force-dynamic";

/** The signed-in staff member and their permissions (drives the dashboard navigation). */
export const GET = route(async req => {
  const admin = await requirePermission(req);
  const body: AdminMeResponse = { admin };
  return json(body, { headers: { "Cache-Control": "no-store" } });
});
