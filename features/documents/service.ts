import { prisma } from "@/lib/prisma";
import type { PostAudience, Prisma, SiteDocument } from "@/lib/generated/prisma";
import { ApiError } from "@/lib/server/http/errors";
import type { SiteDocumentDto } from "@/types/api";
import type { CreateDocumentInput, UpdateDocumentInput } from "./schema";

/**
 * Society documents (constitution, certificates, ...). The stored file URL is
 * never sent to the browser: files are served by /api/documents/[id]/file,
 * which checks the document's audience on every request.
 */

const ORDER = [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }];

export function toSiteDocumentDto(d: SiteDocument): SiteDocumentDto {
  return {
    id: d.id,
    title: d.title,
    description: d.description ?? null,
    fileName: d.fileName ?? null,
    isPdf: (d.mimeType ?? "").includes("pdf") || /\.pdf($|\?)/i.test(d.fileUrl),
    audience: d.audience,
    sortOrder: d.sortOrder,
    viewUrl: `/api/documents/${d.id}/file`,
    createdAt: d.createdAt.toISOString(),
  };
}

export async function listAllDocuments(): Promise<SiteDocument[]> {
  return prisma.siteDocument.findMany({ orderBy: ORDER });
}

/** Who is looking: a visitor, a logged-in member, or a staff user. */
export type DocumentViewer = { member: boolean; staff: boolean };

function audiencesFor(viewer: DocumentViewer): PostAudience[] {
  if (viewer.staff) return ["PUBLIC", "MEMBERS", "STAFF"];
  return viewer.member ? ["PUBLIC", "MEMBERS"] : ["PUBLIC"];
}

/** The /documents page: public documents, plus members-only ones for members. Never staff-only. */
export async function listReadableDocuments(viewer: { member: boolean }): Promise<SiteDocument[]> {
  return prisma.siteDocument.findMany({ where: { audience: { in: audiencesFor({ ...viewer, staff: false }) } }, orderBy: ORDER });
}

/** A document the viewer may open, or null (missing and forbidden look the same). */
export async function getReadableDocument(id: number, viewer: DocumentViewer): Promise<SiteDocument | null> {
  const doc = await prisma.siteDocument.findUnique({ where: { id } });
  if (!doc || !audiencesFor(viewer).includes(doc.audience)) return null;
  return doc;
}

export async function createDocument(
  input: CreateDocumentInput,
  file: { url: string; name: string; mimeType: string },
  uploadedById: number
): Promise<SiteDocument> {
  return prisma.siteDocument.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      audience: input.audience,
      sortOrder: input.sortOrder,
      fileUrl: file.url,
      fileName: file.name,
      mimeType: file.mimeType,
      uploadedById,
    },
  });
}

export async function updateDocument(id: number, input: UpdateDocumentInput): Promise<SiteDocument> {
  if (!(await prisma.siteDocument.findUnique({ where: { id }, select: { id: true } }))) {
    throw ApiError.notFound("Document not found");
  }
  const data: Prisma.SiteDocumentUpdateInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.audience !== undefined) data.audience = input.audience;
  if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
  return prisma.siteDocument.update({ where: { id }, data });
}

export async function deleteDocument(id: number): Promise<SiteDocument> {
  return prisma.siteDocument.delete({ where: { id } });
}
