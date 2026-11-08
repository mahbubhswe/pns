import { assertFileSize, assertMimeType, isImageMime, isImageOrPdfMime, json, parseMultipart, requireFile, route } from "@/lib/server/http";
import { persistUpload } from "@/lib/server/storage";
import { UPLOAD_LIMITS } from "@/lib/config/constants";
import type { UploadResponse } from "@/types/api";
import { requirePermission } from "@/features/access";

/**
 * Dashboard upload for images (post covers, staff photos, slides). With
 * `?kind=document` it also accepts PDFs (voucher attachments).
 */
export const POST = route(async req => {
  await requirePermission(req);
  const document = req.nextUrl.searchParams.get("kind") === "document";
  const { files } = await parseMultipart(req);
  const file = requireFile(files, "file");
  if (document) {
    assertMimeType(file, isImageOrPdfMime, "Only images or PDF files are allowed");
    assertFileSize(file, UPLOAD_LIMITS.documentBytes);
  } else {
    assertMimeType(file, isImageMime, "Only image files are allowed");
    assertFileSize(file, UPLOAD_LIMITS.imageBytes);
  }

  const url = await persistUpload(file, { label: document ? "attachment" : "image" });
  const body: UploadResponse = { ok: true, url };
  return json(body);
});
