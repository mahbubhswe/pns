import { json, route } from "@/lib/server/http";
import { getPublicSettings } from "@/features/settings";
import type { SettingsResponse } from "@/types/api";

export const dynamic = "force-dynamic";

/** Public: site name, fees and payment instructions for the registration UI. */
export const GET = route(async () => {
  const body: SettingsResponse = { settings: await getPublicSettings() };
  return json(body, { headers: { "Cache-Control": "no-store" } });
});
