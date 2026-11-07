import { createApiHandler } from "@/lib/server/http";
import { getLatestPreview } from "@/features/preview";
import type { LatestPreviewResponse } from "@/types/api";

/** Public: URL of the most recent guideline PDF. */
const handler = createApiHandler(["GET"]);

handler.get(async (_req, res) => {
  const preview = await getLatestPreview();
  const body: LatestPreviewResponse = { url: preview.fileUrl };
  res.status(200).json(body);
});

export default handler;
