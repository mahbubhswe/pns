import { z } from "zod";
import { MEMBER_UI_STATUSES, OWNERSHIP_PROOF_TYPES, PAYMENT_METHODS } from "@/lib/shared/membership";

const trimmed = z.string().trim();
const optionalTrimmed = trimmed.transform(v => (v === "" ? null : v)).nullish();
const boolish = z.preprocess(v => {
  if (typeof v === "boolean") return v;
  const s = String(v ?? "").trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "on";
}, z.boolean());

/** Multipart fields posted by the public registration form. */
export const registerMemberSchema = z.object({
  sectorNumber: trimmed.min(1, "Sector number is required"),
  roadNumber: trimmed.min(1, "Road number is required"),
  plotNumber: trimmed.min(1, "Plot number is required"),
  plotSize: trimmed.default(""),
  ownershipProofType: z.enum(OWNERSHIP_PROOF_TYPES).default("LD_TAX_RECEIPT"),
  ownerNameEnglish: trimmed.min(1, "Owner name (English) is required"),
  ownerNameBangla: trimmed.default(""),
  contactNumber: trimmed.min(1, "Contact number is required"),
  nidNumber: trimmed.min(1, "NID number is required"),
  presentAddress: trimmed.default(""),
  permanentAddress: trimmed.default(""),
  email: trimmed.toLowerCase().email("A valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  paymentMethod: z.enum(PAYMENT_METHODS).default("BKASH"),
  bkashTransactionId: optionalTrimmed,
  bkashAccountNumber: optionalTrimmed,
  bankAccountNumberFrom: optionalTrimmed,
  // membershipFee is intentionally not accepted from the client: the server
  // derives it from site settings and the chosen payment method.
  agreeDataUse: boolish.default(false),
});
export type RegisterMemberInput = z.infer<typeof registerMemberSchema>;

export const memberLoginSchema = z.object({
  email: trimmed.toLowerCase().min(1, "Email is required"),
  password: z.string().trim().min(1, "Password is required"),
});
export type MemberLoginInput = z.infer<typeof memberLoginSchema>;

export const updateMemberStatusSchema = z.object({
  status: z.enum(MEMBER_UI_STATUSES, { message: "Invalid status" }),
});
export type UpdateMemberStatusInput = z.infer<typeof updateMemberStatusSchema>;

const isoDate = z
  .string()
  .transform(v => new Date(v))
  .refine(d => !Number.isNaN(d.getTime()), "Invalid date");

/** `?start=YYYY-MM-DD&end=YYYY-MM-DD` filter on the members list. */
export const listMembersQuerySchema = z.object({
  start: isoDate.optional(),
  end: isoDate.optional(),
});
export type ListMembersQuery = z.infer<typeof listMembersQuerySchema>;

/** Rows posted by the XLSX import on the membership page. */
export const importMemberRowSchema = z.object({
  name: trimmed.default(""),
  email: trimmed.toLowerCase().optional(),
  phone: trimmed.optional(),
  membershipType: trimmed.optional(),
  status: trimmed.toLowerCase().optional(),
  joinedAt: z.union([z.string(), z.number()]).optional(),
});
export const importMembersSchema = z.union([importMemberRowSchema, z.array(importMemberRowSchema)]);
export type ImportMemberRow = z.infer<typeof importMemberRowSchema>;
