import { assertFileSize, assertMimeType, isPdfMime, json, parseMultipart, requireFile, route } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/auth";
import { persistUpload } from "@/lib/server/storage";
import { UPLOAD_LIMITS } from "@/lib/config/constants";
import { createPreview, toPreviewDto } from "@/features/preview";
import type { PreviewCreatedResponse } from "@/types/api";

/** Upload the guideline PDF shown on the public registration page. */
export const POST = route(async req => {
  requireAdmin(req);
  const { fields, files } = await parseMultipart(req);
  const pdf = requireFile(files, "file");
  assertMimeType(pdf, isPdfMime, "Only PDF files are allowed");
  assertFileSize(pdf, UPLOAD_LIMITS.previewBytes);

  const url = await persistUpload(pdf, { folder: "previews", label: "preview" });
  const preview = await createPreview(url, fields.title || null);

  const body: PreviewCreatedResponse = { ok: true, preview: toPreviewDto(preview) };
  return json(body, 201);
});
