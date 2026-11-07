import {
  ApiError,
  assertFileSize,
  assertMimeType,
  isImageMime,
  isImageOrPdfMime,
  json,
  parseMultipart,
  pickFile,
  preflight,
  route,
  type ParsedMultipart,
} from "@/lib/server/http";
import { persistUpload } from "@/lib/server/storage";
import { UPLOAD_LIMITS } from "@/lib/config/constants";
import { logger } from "@/lib/server/logger";
import { registerMember, registerMemberSchema, sendApplicationEmail } from "@/features/membership";
import { getSettings } from "@/features/settings";
import { feeForPaymentMethod } from "@/lib/shared/settings";
import type { RegisterMemberResponse } from "@/types/api";

const CORS_METHODS = ["POST", "OPTIONS"];

async function persistOptional(
  files: ParsedMultipart["files"],
  field: string,
  label: string,
  accept: (mime: string) => boolean
): Promise<string | null> {
  const file = pickFile(files, field);
  if (!file) return null;
  assertMimeType(file, accept, `${field} must be an image or PDF`);
  assertFileSize(file, UPLOAD_LIMITS.documentBytes);
  return persistUpload(file, { label });
}

export const OPTIONS = preflight(CORS_METHODS);

/** Public membership registration (multipart form + document uploads). */
export const POST = route(
  async req => {
    const settings = await getSettings();
    if (!settings.registration.open) throw ApiError.forbidden(settings.registration.closedMessage);

    const { fields, files } = await parseMultipart(req);

    // Validate text fields before touching storage so bad input never leaves orphan files.
    const input = registerMemberSchema.parse(fields);

    const uploaded = {
      ownershipProofFile: await persistOptional(files, "ownershipProofFile", "ownershipProof", isImageOrPdfMime),
      ownerPhoto: await persistOptional(files, "ownerPhoto", "ownerPhoto", isImageMime),
      paymentReceipt: await persistOptional(files, "paymentReceipt", "paymentReceipt", isImageOrPdfMime),
    };

    const membershipFee = feeForPaymentMethod(settings, input.paymentMethod);
    const user = await registerMember(input, uploaded, membershipFee);
    logger.info("Member registered", { userId: user.id });

    const emailSent = await sendApplicationEmail(user);

    const body: RegisterMemberResponse = {
      ok: true,
      id: user.id,
      emailSent,
      message: emailSent
        ? "Registration completed successfully. Please check your email for the application PDF."
        : "Registration completed successfully.",
    };
    return json(body, 201);
  },
  { cors: CORS_METHODS }
);
