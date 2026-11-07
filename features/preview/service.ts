import { prisma } from "@/lib/prisma";
import type { PreviewDocument } from "@/lib/generated/prisma";
import { ApiError } from "@/lib/server/http/errors";
import type { PreviewDto } from "@/types/api";

export function toPreviewDto(p: PreviewDocument): PreviewDto {
  return {
    id: p.id,
    title: p.title ?? null,
    fileUrl: p.fileUrl,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
  };
}

export async function createPreview(fileUrl: string, title?: string | null): Promise<PreviewDocument> {
  return prisma.previewDocument.create({ data: { fileUrl, title: title ?? null } });
}

export async function getLatestPreview(): Promise<PreviewDocument> {
  const preview = await prisma.previewDocument.findFirst({ orderBy: { createdAt: "desc" } });
  if (!preview) throw ApiError.notFound("No preview available");
  return preview;
}
