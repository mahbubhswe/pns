/**
 * Membership business constants and enum mappings.
 *
 * Isomorphic: safe to import from both React components and API routes.
 * Keep this file free of Node-only imports.
 */

export const MEMBERSHIP_FEE_BKASH = 1020; // BDT
export const MEMBERSHIP_FEE_BANK = 1000; // BDT
/** Default fee stored on a new membership when none is provided. */
export const MEMBERSHIP_FEE_DEFAULT = MEMBERSHIP_FEE_BKASH;

export const PAYMENT_DETAILS = {
  bkashNumber: "01625358082",
  bank: {
    name: "Sonali Bank Limited, Dhaka University Branch",
    accountName: "Purbachal Newtown Society",
    accountNumber: "4405702001730",
    routingNumber: "200271750",
  },
} as const;

export const MEMBER_TYPES = ["GENERAL", "ASSOCIATE"] as const;
export type MemberType = (typeof MEMBER_TYPES)[number];
export const MEMBER_TYPE_LABELS: Record<MemberType, { label: string; hint: string }> = {
  GENERAL: { label: "General", hint: "For the owner of a plot in Purbachal New Town." },
  ASSOCIATE: { label: "Associate", hint: "For a family member of a plot owner (spouse, son, daughter…)." },
};
/** Suggestions for an Associate applicant's relation to the plot owner (free text is allowed). */
export const OWNER_RELATIONS = ["Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Son-in-law", "Daughter-in-law"];

/** Bangladeshi NID: old 13/17-digit numbers and the 10-digit Smart Card number. */
export function isValidNid(value: string): boolean {
  return /^(\d{10}|\d{13}|\d{17})$/.test(value.replace(/[\s-]/g, ""));
}

/** Reference shared with an applicant on submission, e.g. APP-2026-00042. */
export function formatApplicationRef(id: number, createdAt: Date = new Date()): string {
  return `APP-${createdAt.getFullYear()}-${String(id).padStart(5, "0")}`;
}

/** Membership ID assigned on approval when the member has none, e.g. PNS-00042. */
export function formatPnsId(id: number): string {
  return `PNS-${String(id).padStart(5, "0")}`;
}

export const OWNERSHIP_PROOF_TYPES = ["LD_TAX_RECEIPT", "MUTATION_PAPER", "BDS_KHATIAN"] as const;
export type OwnershipProofType = (typeof OWNERSHIP_PROOF_TYPES)[number];

export const PAYMENT_METHODS = ["BKASH", "BANK", "ONLINE"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = ["UNPAID", "PAID", "FAILED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = { UNPAID: "Payment pending", PAID: "Paid", FAILED: "Payment failed" };

/** Database representation of a member's review status. */
export const MEMBER_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

/** Friendly representation used by the dashboard UI and CSV exports. */
export const MEMBER_UI_STATUSES = ["pending", "active", "inactive"] as const;
export type MemberUiStatus = (typeof MEMBER_UI_STATUSES)[number];

const DB_TO_UI: Record<MemberStatus, MemberUiStatus> = {
  PENDING: "pending",
  APPROVED: "active",
  REJECTED: "inactive",
};

const UI_TO_DB: Record<MemberUiStatus, MemberStatus> = {
  pending: "PENDING",
  active: "APPROVED",
  inactive: "REJECTED",
};

export function memberStatusToUi(status: string | null | undefined): MemberUiStatus {
  return DB_TO_UI[status as MemberStatus] ?? "pending";
}

export function memberStatusFromUi(status: string | null | undefined): MemberStatus | null {
  const key = String(status ?? "").toLowerCase() as MemberUiStatus;
  return UI_TO_DB[key] ?? null;
}

export const MANAGEMENT_ROLES = ["ADMIN", "EDITOR", "VIEWER"] as const;
export type ManagementRole = (typeof MANAGEMENT_ROLES)[number];
