import { createApiHandler } from "@/lib/server/http";
import { getPublicSettings } from "@/features/settings";
import type { SettingsResponse } from "@/types/api";

/** Public: site name, fees and payment instructions for the registration UI. */
const handler = createApiHandler(["GET"]);

handler.get(async (_req, res) => {
  const body: SettingsResponse = { settings: await getPublicSettings() };
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json(body);
});

export default handler;
