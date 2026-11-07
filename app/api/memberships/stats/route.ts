import { json, route } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/auth";
import { getMembershipStats } from "@/features/membership";

export const GET = route(async req => {
  requireAdmin(req);
  return json(await getMembershipStats());
});
