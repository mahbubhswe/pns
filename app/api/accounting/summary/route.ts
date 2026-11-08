import { json, route } from "@/lib/server/http";
import { requirePermission } from "@/features/access";
import { getAccountingSummary } from "@/features/accounting";

export const GET = route(async req => {
  await requirePermission(req, ["accounting.view", "accounting.reports"]);
  return json(await getAccountingSummary());
});
