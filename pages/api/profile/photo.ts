import { assertMimeType, createApiHandler, isImageMime, parseMultipart, requireFile } from "@/lib/server/http";
import { requireMember, type MemberRequest } from "@/lib/server/auth";
import { deleteUploadIfLocal, persistUpload } from "@/lib/server/storage";
import { UPLOAD_LIMITS } from "@/lib/config/constants";
import { getMemberById, updateMemberPhoto } from "@/features/membership";
import type { UploadResponse } from "@/types/api";

export const config = { api: { bodyParser: false } };

/** Member updates their own profile photo. */
const handler = createApiHandler<MemberRequest>(["POST"]);

handler.use(requireMember);

handler.post(async (req, res) => {
  const { files } = await parseMultipart(req, { maxFileSize: UPLOAD_LIMITS.imageBytes });
  const photo = requireFile(files, "photo");
  assertMimeType(photo, isImageMime, "Only image files are allowed");

  const current = await getMemberById(req.member.sub);
  const url = await persistUpload(photo, { label: "avatar" });
  await updateMemberPhoto(current.id, url);
  deleteUploadIfLocal(current.ownerPhoto);

  const body: UploadResponse = { ok: true, url };
  res.status(200).json(body);
});

export default handler;
