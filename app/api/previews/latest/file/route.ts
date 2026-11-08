import { route } from "@/lib/server/http";
import { ApiError } from "@/lib/server/http/errors";
import { readStoredFile } from "@/lib/server/storage";
import { getLatestPreview } from "@/features/preview";

export const dynamic = "force-dynamic";

/**
 * Public: stream the latest guideline PDF from our own origin with
 * `Content-Disposition: inline`, so browsers preview it instead of downloading
 * (Vercel Blob serves PDFs as attachments).
 */
export const GET = route(async () => {
  const preview = await getLatestPreview();
  const file = await readStoredFile(preview.fileUrl);
  if (!file) throw ApiError.notFound("Guideline file not found");

  const headers = new Headers({
    "Content-Type": file.contentType === "application/octet-stream" ? "application/pdf" : file.contentType,
    "Content-Disposition": 'inline; filename="registration-guideline.pdf"',
    "Cache-Control": "public, max-age=60, s-maxage=300",
    "X-Content-Type-Options": "nosniff",
  });
  if (file.size) headers.set("Content-Length", String(file.size));

  return new Response(file.body as BodyInit, { status: 200, headers });
});
