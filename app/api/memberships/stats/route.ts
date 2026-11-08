import { json, route } from "@/lib/server/http";
import { requirePermission } from "@/features/access";
import { getMembershipStats } from "@/features/membership";

export const GET = route(async req => {
  await requirePermission(req, "members.view");
  return json(await getMembershipStats());
});
