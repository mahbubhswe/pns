import { json, parseQuery, route } from "@/lib/server/http";
import { requirePermission } from "@/features/access";
import { buildReport, reportQuerySchema } from "@/features/accounting";

export const GET = route(async req => {
  await requirePermission(req, "accounting.reports");
  const query = parseQuery(reportQuerySchema, req.nextUrl.searchParams);
  return json(await buildReport(query));
});
