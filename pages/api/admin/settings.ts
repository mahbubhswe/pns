import { createApiHandler, parseBody } from "@/lib/server/http";
import { requireAdmin, requireRole, type AdminRequest } from "@/lib/server/auth";
import { getSettings, updateSettings, updateSiteSettingsSchema } from "@/features/settings";
import type { SettingsResponse, SettingsUpdatedResponse } from "@/types/api";

const handler = createApiHandler<AdminRequest>(["GET", "PATCH"]);

handler.use(requireAdmin);

/** Any management user may read settings. */
handler.get(async (_req, res) => {
  const body: SettingsResponse = { settings: await getSettings() };
  res.status(200).json(body);
});

/** Only ADMINs may change them. */
handler.patch(requireRole("ADMIN"), async (req, res) => {
  const input = parseBody(updateSiteSettingsSchema, req.body);
  const settings = await updateSettings(input, req.admin.sub);
  const body: SettingsUpdatedResponse = { ok: true, settings };
  res.status(200).json(body);
});

export default handler;
