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

export const OWNERSHIP_PROOF_TYPES = ["LD_TAX_RECEIPT", "MUTATION_PAPER", "BDS_KHATIAN"] as const;
export type OwnershipProofType = (typeof OWNERSHIP_PROOF_TYPES)[number];

export const PAYMENT_METHODS = ["BKASH", "BANK"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

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
