import { json, parseBody, readBody, route } from "@/lib/server/http";
import { requirePermission } from "@/features/access";
import { getGatewaySettings, updateGatewaySchema, updateGatewaySettings } from "@/features/payment";
import type { GatewaySettingsResponse } from "@/types/api";

/** Online payment (SSLCommerz) credentials. The password is write-only. */
export const GET = route(async req => {
  await requirePermission(req, "settings.manage");
  const body: GatewaySettingsResponse = { gateway: await getGatewaySettings() };
  return json(body);
});

export const PUT = route(async req => {
  const actor = await requirePermission(req, "settings.manage");
  const input = parseBody(updateGatewaySchema, await readBody(req));
  const body: GatewaySettingsResponse = { gateway: await updateGatewaySettings(input, actor.id) };
  return json(body);
});
