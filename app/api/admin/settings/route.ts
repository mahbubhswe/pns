import { json, parseBody, readBody, route } from "@/lib/server/http";
import { requireAdmin, requireRole } from "@/lib/server/auth";
import { getSettings, updateSettings, updateSiteSettingsSchema } from "@/features/settings";
import type { SettingsResponse, SettingsUpdatedResponse } from "@/types/api";

/** Any management user may read settings. */
export const GET = route(async req => {
  requireAdmin(req);
  const body: SettingsResponse = { settings: await getSettings() };
  return json(body);
});

/** Only ADMINs may change them. */
export const PATCH = route(async req => {
  const admin = requireRole(req, "ADMIN");
  const input = parseBody(updateSiteSettingsSchema, await readBody(req));
  const settings = await updateSettings(input, admin.sub);
  const body: SettingsUpdatedResponse = { ok: true, settings };
  return json(body);
});
