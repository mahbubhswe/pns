import { z } from "zod";

const trimmed = z.string().trim();
const optionalText = (max: number) =>
  z
    .union([z.string(), z.null()])
    .optional()
    .transform(v => {
      if (v === undefined) return undefined;
      const s = (v ?? "").trim();
      return s ? s.slice(0, max) : null;
    });

/** "YYYY-MM-DD" → Date at 00:00 UTC (vouchers are stored date-only, in UTC). */
export const isoDay = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date")
  .transform(s => new Date(`${s}T00:00:00.000Z`))
  .refine(d => !Number.isNaN(d.getTime()), "Pick a valid date");

const amount = z.coerce
  .number({ message: "Enter an amount" })
  .positive("Amount must be more than zero")
  .max(999_999_999_999, "Amount is too large")
  .transform(n => Math.round(n * 100) / 100);

const money = z.coerce.number().min(-999_999_999_999).max(999_999_999_999).transform(n => Math.round(n * 100) / 100);

export const FUND_ACCOUNT_TYPES = ["CASH", "BANK", "MOBILE_BANKING"] as const;
export const LEDGER_HEAD_TYPES = ["INCOME", "EXPENSE"] as const;
export const VOUCHER_TYPES = ["INCOME", "EXPENSE", "TRANSFER"] as const;

// ---------------------------------------------------------------------------
// Fund accounts

export const createFundAccountSchema = z.object({
  name: trimmed.min(2, "Give the account a name").max(80),
  type: z.enum(FUND_ACCOUNT_TYPES, { message: "Choose an account type" }),
  accountNumber: optionalText(60),
  institution: optionalText(120),
  branch: optionalText(120),
  openingBalance: money.default(0),
  notes: optionalText(1000),
});
export type CreateFundAccountInput = z.infer<typeof createFundAccountSchema>;

export const updateFundAccountSchema = createFundAccountSchema
  .partial()
  .extend({ isActive: z.boolean().optional() })
  .refine(v => Object.keys(v).length > 0, { message: "Nothing to update" });
export type UpdateFundAccountInput = z.infer<typeof updateFundAccountSchema>;

// ---------------------------------------------------------------------------
// Ledger heads

export const createLedgerHeadSchema = z.object({
  name: trimmed.min(2, "Give the head a name").max(80),
  code: optionalText(20).transform(v => (v ? v.toUpperCase() : v)),
  type: z.enum(LEDGER_HEAD_TYPES, { message: "Choose Income or Expense" }),
  description: optionalText(500),
});
export type CreateLedgerHeadInput = z.infer<typeof createLedgerHeadSchema>;

export const updateLedgerHeadSchema = z
  .object({
    name: trimmed.min(2, "Name is too short").max(80).optional(),
    code: optionalText(20).transform(v => (v ? v.toUpperCase() : v)),
    description: optionalText(500),
    isActive: z.boolean().optional(),
  })
  .refine(v => Object.values(v).some(x => x !== undefined), { message: "Nothing to update" });
export type UpdateLedgerHeadInput = z.infer<typeof updateLedgerHeadSchema>;

// ---------------------------------------------------------------------------
// Vouchers

const optionalId = z
  .union([z.coerce.number().int().positive(), z.literal(""), z.null()])
  .optional()
  .transform(v => (typeof v === "number" ? v : null));

export const voucherInputSchema = z.object({
  type: z.enum(VOUCHER_TYPES, { message: "Choose income, expense or transfer" }),
  date: isoDay,
  amount,
  headId: optionalId,
  accountId: z.coerce.number({ message: "Choose the cash/bank account" }).int().positive("Choose the cash/bank account"),
  toAccountId: optionalId,
  partyName: optionalText(160),
  reference: optionalText(120),
  description: optionalText(1000),
  attachmentUrl: optionalText(1000),
  memberId: optionalId,
});
export type VoucherInput = z.infer<typeof voucherInputSchema>;

/** PATCH: same fields; the type of an existing voucher can't change (the number carries it). */
export const updateVoucherSchema = voucherInputSchema.omit({ type: true });
export type UpdateVoucherInput = z.infer<typeof updateVoucherSchema>;

export const voidVoucherSchema = z.object({
  reason: trimmed.min(3, "Please write why this voucher is being voided").max(500),
});

const optionalDay = z
  .string()
  .optional()
  .transform(v => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T00:00:00.000Z`) : null));

const optionalPositiveInt = z
  .string()
  .optional()
  .transform(v => {
    const n = Number(v);
    return v && Number.isInteger(n) && n > 0 ? n : null;
  });

export const listVouchersQuerySchema = z.object({
  from: optionalDay,
  to: optionalDay,
  type: z
    .string()
    .optional()
    .transform(v => (VOUCHER_TYPES as readonly string[]).includes(String(v).toUpperCase()) ? (String(v).toUpperCase() as (typeof VOUCHER_TYPES)[number]) : null),
  status: z
    .string()
    .optional()
    .transform(v => (v === "POSTED" || v === "VOID" ? v : null)),
  headId: optionalPositiveInt,
  accountId: optionalPositiveInt,
  memberId: optionalPositiveInt,
  q: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(5000).default(1000),
});
export type ListVouchersQuery = z.infer<typeof listVouchersQuerySchema>;

// ---------------------------------------------------------------------------
// Reports & membership-fee sync

export const REPORT_TYPES = [
  "income-expenditure",
  "receipts-payments",
  "cash-book",
  "head-ledger",
  "day-book",
  "trial-balance",
  "balance-sheet",
  "monthly-summary",
] as const;

export const reportQuerySchema = z.object({
  type: z.enum(REPORT_TYPES, { message: "Unknown report type" }),
  from: optionalDay,
  to: optionalDay,
  accountId: optionalPositiveInt,
  headId: optionalPositiveInt,
  year: optionalPositiveInt,
});
export type ReportQuery = z.infer<typeof reportQuerySchema>;

export const memberFeeSyncSchema = z.object({
  bkashAccountId: optionalId,
  bankAccountId: optionalId,
  headId: optionalId,
});
export type MemberFeeSyncInput = z.infer<typeof memberFeeSyncSchema>;
