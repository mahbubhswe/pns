import { json, parseBody, parseIdParam, readBody, route } from "@/lib/server/http";
import { deleteUploadIfLocal } from "@/lib/server/storage";
import { requirePermission } from "@/features/access";
import { deleteDocument, toSiteDocumentDto, updateDocument, updateDocumentSchema } from "@/features/documents";
import type { DocumentMutationResponse } from "@/types/api";

type Params = { id: string };

export const PATCH = route<Params>(async (req, { params }) => {
  await requirePermission(req, "documents.manage");
  const input = parseBody(updateDocumentSchema, await readBody(req));
  const body: DocumentMutationResponse = { ok: true, document: toSiteDocumentDto(await updateDocument(parseIdParam(params.id), input)) };
  return json(body);
});

export const DELETE = route<Params>(async (req, { params }) => {
  await requirePermission(req, "documents.manage");
  const doc = await deleteDocument(parseIdParam(params.id));
  deleteUploadIfLocal(doc.fileUrl);
  return json({ ok: true });
});
