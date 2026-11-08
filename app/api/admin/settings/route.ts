import { json, parseBody, readBody, route } from "@/lib/server/http";
import { getSettings, updateSettings, updateSiteSettingsSchema } from "@/features/settings";
import type { SettingsResponse, SettingsUpdatedResponse } from "@/types/api";
import { requirePermission } from "@/features/access";

/** Any active staff member may read settings. */
export const GET = route(async req => {
  await requirePermission(req);
  const body: SettingsResponse = { settings: await getSettings() };
  return json(body);
});

/** Changing them needs settings.manage (Super Admin by default). */
export const PATCH = route(async req => {
  const admin = await requirePermission(req, "settings.manage");
  const input = parseBody(updateSiteSettingsSchema, await readBody(req));
  const settings = await updateSettings(input, admin.id);
  const body: SettingsUpdatedResponse = { ok: true, settings };
  return json(body);
});
