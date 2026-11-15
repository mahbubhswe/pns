import { z } from "zod";
import { MEMBER_TYPES, MEMBER_UI_STATUSES, OWNERSHIP_PROOF_TYPES, PAYMENT_METHODS, isValidNid } from "@/lib/shared/membership";

const trimmed = z.string().trim();
const optionalTrimmed = trimmed.transform(v => (v === "" ? null : v)).nullish();
const boolish = z.preprocess(v => {
  if (typeof v === "boolean") return v;
  const s = String(v ?? "").trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "on";
}, z.boolean());

/** Multipart fields posted by the public registration form. */
export const registerMemberSchema = z
  .object({
  membershipType: z.enum(MEMBER_TYPES).default("GENERAL"),
  relationToOwner: optionalTrimmed,
  ownerPnsId: optionalTrimmed,
  sectorNumber: trimmed.min(1, "Sector number is required"),
  roadNumber: trimmed.min(1, "Road number is required"),
  plotNumber: trimmed.min(1, "Plot number is required"),
  plotSize: trimmed.default(""),
  ownershipProofType: z.enum(OWNERSHIP_PROOF_TYPES).default("LD_TAX_RECEIPT"),
  ownerNameEnglish: trimmed.min(1, "Owner name (English) is required"),
  ownerNameBangla: trimmed.default(""),
  contactNumber: trimmed.min(1, "Contact number is required"),
  nidNumber: trimmed.refine(isValidNid, "NID must be 10 (Smart Card), 13 or 17 digits"),
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
  })
  .superRefine((v, ctx) => {
    if (v.membershipType !== "ASSOCIATE") return;
    if (!v.relationToOwner) ctx.addIssue({ code: "custom", path: ["relationToOwner"], message: "Relation with the plot owner is required" });
    if (!v.ownerPnsId) ctx.addIssue({ code: "custom", path: ["ownerPnsId"], message: "PNS ID of the plot owner is required" });
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
const cell = z.preprocess(v => (v === null || v === undefined ? "" : String(v)), z.string().trim().max(500));

export const importMemberRowSchema = z.object({
  pnsId: cell.optional(),
  name: cell.default(""),
  nameBangla: cell.optional(),
  email: cell.transform(v => v.toLowerCase()).optional(),
  phone: cell.optional(),
  nid: cell.optional(),
  sector: cell.optional(),
  road: cell.optional(),
  plot: cell.optional(),
  plotSize: cell.optional(),
  address: cell.optional(),
  membershipType: cell.optional(),
  status: cell.transform(v => v.toLowerCase()).optional(),
  joinedAt: z.union([z.string(), z.number()]).optional(),
});
export const importMembersSchema = z.union([importMemberRowSchema, z.array(importMemberRowSchema)]);
export type ImportMemberRow = z.infer<typeof importMemberRowSchema>;
