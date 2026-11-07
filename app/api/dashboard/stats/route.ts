import { json, route } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/auth";
import { getDashboardStats } from "@/features/dashboard";

export const GET = route(async req => {
  requireAdmin(req);
  return json(await getDashboardStats());
});
