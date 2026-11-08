import { assertFileSize, assertMimeType, isImageMime, json, parseMultipart, requireFile, route } from "@/lib/server/http";
import { requireMember } from "@/lib/server/auth";
import { ApiError } from "@/lib/server/http/errors";
import { deleteUploadIfLocal, persistUpload } from "@/lib/server/storage";
import { UPLOAD_LIMITS } from "@/lib/config/constants";
import { getMemberById, updateMemberPhoto } from "@/features/membership";
import type { UploadResponse } from "@/types/api";

/** Member updates their own profile photo. */
export const POST = route(async req => {
  const member = requireMember(req);
  if (member.imp) throw ApiError.forbidden("Staff can view but not change a member's profile while logged in as them.");
  const { files } = await parseMultipart(req);
  const photo = requireFile(files, "photo");
  assertMimeType(photo, isImageMime, "Only image files are allowed");
  assertFileSize(photo, UPLOAD_LIMITS.imageBytes);

  const current = await getMemberById(member.sub);
  const url = await persistUpload(photo, { label: "avatar" });
  await updateMemberPhoto(current.id, url);
  deleteUploadIfLocal(current.ownerPhoto);

  const body: UploadResponse = { ok: true, url };
  return json(body);
});
