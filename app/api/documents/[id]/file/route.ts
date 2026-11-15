import { parseIdParam, route } from "@/lib/server/http";
import { ApiError } from "@/lib/server/http/errors";
import { getAdminFromRequest, getMemberFromRequest } from "@/lib/server/auth";
import { readStoredFile } from "@/lib/server/storage";
import { loadAdminContext } from "@/features/access";
import { getReadableDocument } from "@/features/documents";

export const dynamic = "force-dynamic";

type Params = { id: string };

/**
 * Open a society document inline. Public documents for everyone,
 * members-only for logged-in members (and staff), staff-only for active staff.
 */
export const GET = route<Params>(async (req, { params }) => {
  const adminClaims = getAdminFromRequest(req);
  const staff = adminClaims ? Boolean(await loadAdminContext(adminClaims.sub)) : false;
  const member = Boolean(getMemberFromRequest(req)) || staff;

  const doc = await getReadableDocument(parseIdParam(params.id), { member, staff });
  if (!doc) throw ApiError.notFound("Document not found");
  const file = await readStoredFile(doc.fileUrl);
  if (!file) throw ApiError.notFound("Document file is missing");

  const name = (doc.fileName || `document-${doc.id}`).replace(/[^\w.\- ]+/g, "_");
  const headers = new Headers({
    "Content-Type": doc.mimeType || file.contentType,
    "Content-Disposition": `inline; filename="${name}"`,
    // Public files can be cached briefly; restricted ones never in shared caches.
    "Cache-Control": doc.audience === "PUBLIC" ? "public, max-age=60, s-maxage=300" : "private, no-store",
    "X-Content-Type-Options": "nosniff",
  });
  if (file.size) headers.set("Content-Length", String(file.size));
  return new Response(file.body as BodyInit, { status: 200, headers });
});
