import { json, route } from "@/lib/server/http";
import { requirePermission } from "@/features/access";
import { getDashboardStats } from "@/features/dashboard";

export const GET = route(async req => {
  await requirePermission(req, "dashboard.view");
  return json(await getDashboardStats());
});
