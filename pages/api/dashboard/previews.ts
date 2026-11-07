import { assertMimeType, createApiHandler, isPdfMime, parseMultipart, requireFile } from "@/lib/server/http";
import { requireAdmin, type AdminRequest } from "@/lib/server/auth";
import { persistUpload } from "@/lib/server/storage";
import { UPLOAD_LIMITS } from "@/lib/config/constants";
import { createPreview, toPreviewDto } from "@/features/preview";
import type { PreviewCreatedResponse } from "@/types/api";

export const config = { api: { bodyParser: false } };

/** Upload the guideline PDF shown on the public registration page. */
const handler = createApiHandler<AdminRequest>(["POST"]);

handler.use(requireAdmin);

handler.post(async (req, res) => {
  const { fields, files } = await parseMultipart(req, { maxFileSize: UPLOAD_LIMITS.previewBytes });
  const pdf = requireFile(files, "file");
  assertMimeType(pdf, isPdfMime, "Only PDF files are allowed");

  const url = await persistUpload(pdf, { folder: "previews", label: "preview" });
  const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
  const preview = await createPreview(url, title || null);

  const body: PreviewCreatedResponse = { ok: true, preview: toPreviewDto(preview) };
  res.status(201).json(body);
});

export default handler;
