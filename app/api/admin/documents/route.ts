import {
  assertFileSize,
  assertMimeType,
  isImageOrPdfMime,
  json,
  parseMultipart,
  requireFile,
  route,
} from "@/lib/server/http";
import { persistUpload } from "@/lib/server/storage";
import { UPLOAD_LIMITS } from "@/lib/config/constants";
import { requirePermission } from "@/features/access";
import { createDocument, createDocumentSchema, listAllDocuments, toSiteDocumentDto } from "@/features/documents";
import type { DocumentMutationResponse, DocumentsListResponse } from "@/types/api";

export const dynamic = "force-dynamic";

export const GET = route(async req => {
  await requirePermission(req, "documents.manage");
  const body: DocumentsListResponse = { documents: (await listAllDocuments()).map(toSiteDocumentDto) };
  return json(body);
});

/** Multipart: `file` (PDF or image, ≤20 MB) + title, description, audience, sortOrder. */
export const POST = route(async req => {
  const admin = await requirePermission(req, "documents.manage");
  const { fields, files } = await parseMultipart(req);
  // Validate text first so a bad request never leaves an orphan file.
  const input = createDocumentSchema.parse(fields);
  const file = requireFile(files, "file");
  assertMimeType(file, isImageOrPdfMime, "Only PDF or image files are allowed");
  assertFileSize(file, UPLOAD_LIMITS.previewBytes);

  const url = await persistUpload(file, { label: "document" });
  const doc = await createDocument(input, { url, name: file.name, mimeType: file.type }, admin.id);
  const body: DocumentMutationResponse = { ok: true, document: toSiteDocumentDto(doc) };
  return json(body, 201);
});
