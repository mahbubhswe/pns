import { json, route } from "@/lib/server/http";
import { getLatestPreview } from "@/features/preview";
import type { LatestPreviewResponse } from "@/types/api";

export const dynamic = "force-dynamic";

/**
 * Public: URL of the most recent guideline PDF. Points at our own
 * `/api/previews/latest/file` proxy (not the raw Blob URL) so the PDF opens
 * inline; 404s here when no guideline has been uploaded yet.
 */
export const GET = route(async () => {
  await getLatestPreview();
  const body: LatestPreviewResponse = { url: "/api/previews/latest/file" };
  return json(body);
});
