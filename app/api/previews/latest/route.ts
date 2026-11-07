import { json, route } from "@/lib/server/http";
import { getLatestPreview } from "@/features/preview";
import type { LatestPreviewResponse } from "@/types/api";

export const dynamic = "force-dynamic";

/** Public: URL of the most recent guideline PDF. */
export const GET = route(async () => {
  const preview = await getLatestPreview();
  const body: LatestPreviewResponse = { url: preview.fileUrl };
  return json(body);
});
