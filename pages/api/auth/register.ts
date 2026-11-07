import type { Fields, Files } from "formidable";
import {
  assertMimeType,
  cors,
  createApiHandler,
  isImageMime,
  isImageOrPdfMime,
  parseMultipart,
  pickFile,
  type FormidableFile,
} from "@/lib/server/http";
import { persistUpload } from "@/lib/server/storage";
import { UPLOAD_LIMITS } from "@/lib/config/constants";
import { logger } from "@/lib/server/logger";
import { registerMember, registerMemberSchema, sendApplicationEmail } from "@/features/membership";
import { getSettings } from "@/features/settings";
import { feeForPaymentMethod } from "@/lib/shared/settings";
import { ApiError } from "@/lib/server/http/errors";
import type { RegisterMemberResponse } from "@/types/api";

export const config = { api: { bodyParser: false } };

/** Multipart fields arrive as string arrays; flatten to the first value. */
function flattenFields(fields: Fields): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(fields)) {
    out[key] = Array.isArray(value) ? value[0] : value;
  }
  return out;
}

async function persistOptional(
  files: Files,
  field: string,
  label: string,
  accept: (mime: string) => boolean
): Promise<string | null> {
  const file: FormidableFile | null = pickFile(files[field]);
  if (!file) return null;
  assertMimeType(file, accept, `${field} must be an image or PDF`);
  return persistUpload(file, { label });
}

/** Public membership registration (multipart form + document uploads). */
const handler = createApiHandler(["POST"]);

handler.use(cors(["POST", "OPTIONS"]));

handler.post(async (req, res) => {
  const settings = await getSettings();
  if (!settings.registration.open) throw ApiError.forbidden(settings.registration.closedMessage);

  const { fields, files } = await parseMultipart(req, {
    maxFileSize: UPLOAD_LIMITS.documentBytes,
    multiples: true,
  });

  // Validate text fields before touching storage so bad input never leaves orphan files.
  const input = registerMemberSchema.parse(flattenFields(fields));

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
  res.status(201).json(body);
});

export default handler;
