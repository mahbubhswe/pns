import { assertFileSize, assertMimeType, isImageMime, json, parseMultipart, requireFile, route } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/auth";
import { persistUpload } from "@/lib/server/storage";
import { UPLOAD_LIMITS } from "@/lib/config/constants";
import type { UploadResponse } from "@/types/api";

/** Generic image upload used by the dashboard (post covers, user photos, slides). */
export const POST = route(async req => {
  requireAdmin(req);
  const { files } = await parseMultipart(req);
  const file = requireFile(files, "file");
  assertMimeType(file, isImageMime, "Only image files are allowed");
  assertFileSize(file, UPLOAD_LIMITS.imageBytes);

  const url = await persistUpload(file, { label: "image" });
  const body: UploadResponse = { ok: true, url };
  return json(body);
});
