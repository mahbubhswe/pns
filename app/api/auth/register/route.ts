import {
  ApiError,
  assertFileSize,
  assertMimeType,
  isImageOrPdfMime,
  json,
  parseMultipart,
  pickFile,
  preflight,
  publicOrigin,
  route,
  type ParsedMultipart,
} from "@/lib/server/http";
import { persistUpload } from "@/lib/server/storage";
import { UPLOAD_LIMITS } from "@/lib/config/constants";
import { logger } from "@/lib/server/logger";
import { registerMember, registerMemberSchema } from "@/features/membership";
import { getActiveGateway, startPayment } from "@/features/payment";
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

/**
 * Public membership registration (multipart form + document uploads).
 * The application is saved as unpaid and the applicant is sent to the payment
 * gateway; the confirmation email goes out once the payment is confirmed.
 */
export const POST = route(
  async req => {
    const settings = await getSettings();
    if (!settings.registration.open) throw ApiError.forbidden(settings.registration.closedMessage);
    if (!(await getActiveGateway())) throw ApiError.forbidden("Online payment is not set up yet, so applications can't be taken right now. Please try again later.");

    const { fields, files } = await parseMultipart(req);

    // Validate text fields before touching storage so bad input never leaves orphan files.
    const input = registerMemberSchema.parse(fields);

    const uploaded = {
      ownershipProofFile: await persistOptional(files, "ownershipProofFile", "ownershipProof", isImageOrPdfMime),
      ownerPhoto: await persistOptional(files, "ownerPhoto", "ownerPhoto", isImageOrPdfMime),
    };

    const membershipFee = feeForPaymentMethod(settings, "ONLINE", input.membershipType);
    const user = await registerMember(input, uploaded, membershipFee);
    logger.info("Member registered", { userId: user.id });

    // If the gateway call fails the application is still saved; the applicant can pay later from /track.
    const paymentUrl = await startPayment(user, publicOrigin(req), settings.site.name);

    const body: RegisterMemberResponse = {
      ok: true,
      id: user.id,
      applicationRef: user.applicationRef ?? "",
      paymentUrl,
      message: `Application saved. Your reference number is ${user.applicationRef}. Continue to pay the membership fee online.`,
    };
    return json(body, 201);
  },
  { cors: CORS_METHODS }
);
