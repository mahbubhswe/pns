import { assertMimeType, createApiHandler, isImageMime, parseMultipart, requireFile } from "@/lib/server/http";
import { requireAdmin, type AdminRequest } from "@/lib/server/auth";
import { persistUpload } from "@/lib/server/storage";
import { UPLOAD_LIMITS } from "@/lib/config/constants";
import type { UploadResponse } from "@/types/api";

export const config = { api: { bodyParser: false } };

/** Generic image upload used by the dashboard (post covers, user photos). */
const handler = createApiHandler<AdminRequest>(["POST"]);

handler.use(requireAdmin);

handler.post(async (req, res) => {
  const { files } = await parseMultipart(req, { maxFileSize: UPLOAD_LIMITS.imageBytes });
  const file = requireFile(files, "file");
  assertMimeType(file, isImageMime, "Only image files are allowed");

  const url = await persistUpload(file, { label: "image" });
  const body: UploadResponse = { ok: true, url };
  res.status(200).json(body);
});

export default handler;
