/**
 * API contracts (DTOs) shared by API routes and the React client.
 *
 * Rules:
 *  - Only plain JSON-serialisable types (dates are ISO strings).
 *  - Never export Prisma models from here; map them in `features/<x>/mapper.ts`.
 *  - A change here is an API change: update both the mapper and the consumer.
 */
import type {
  ManagementRole,
  MemberStatus,
  MemberUiStatus,
  OwnershipProofType,
  PaymentMethod,
} from "@/lib/shared/membership";
import type { SiteSettings } from "@/lib/shared/settings";
import type { PostAudience } from "@/lib/shared/posts";

// ---------------------------------------------------------------------------
// Generic envelopes

export type OkResponse = { ok: true };

export type ApiErrorResponse = {
  ok: false;
  error: string;
  code: string;
  details?: unknown;
};

// ---------------------------------------------------------------------------
// Membership (plot owners)

export type MemberDto = {
  id: number;
  sectorNumber: string;
  roadNumber: string;
  plotNumber: string;
  plotSize: string;
  ownershipProofType: OwnershipProofType;
  ownershipProofFile: string | null;
  ownerNameEnglish: string;
  ownerNameBangla: string;
  contactNumber: string;
  nidNumber: string;
  presentAddress: string;
  permanentAddress: string;
  email: string;
  ownerPhoto: string | null;
  paymentMethod: PaymentMethod;
  bkashTransactionId: string | null;
  bkashAccountNumber: string | null;
  bankAccountNumberFrom: string | null;
  paymentReceipt: string | null;
  membershipFee: number;
  agreeDataUse: boolean;
  /** Friendly status used by the dashboard: active | pending | inactive. */
  status: MemberUiStatus;
  /** Raw review status stored in the database. */
  statusCode: MemberStatus;
  createdAt: string;
  updatedAt: string;
  /** Alias of createdAt kept for the membership grid / CSV export. */
  joinedAt: string;
};

export type MembersListResponse = { members: MemberDto[] };
export type MemberResponse = { member: MemberDto };
export type MemberMutationResponse = OkResponse & { member: MemberDto };

export type MembershipStats = {
  total: number;
  active: number;
  pending: number;
  inactive: number;
  byType: Record<string, number>;
};

export type ImportMembersResponse = OkResponse & { count: number };

export type RegisterMemberResponse = OkResponse & {
  id: number;
  message: string;
  emailSent: boolean;
};

export type MemberLoginResponse = OkResponse & {
  user: { id: number; email: string; name: string; status: MemberStatus };
};

export type ProfileResponse = OkResponse & {
  profile: MemberDto;
  /** Set when a staff user is viewing this profile via "log in as". */
  impersonatedBy: ImpersonatorDto | null;
};
export type UploadResponse = OkResponse & { url: string };

// ---------------------------------------------------------------------------
// Management users (dashboard accounts)

export type ManagementUserDto = {
  id: number;
  photoUrl: string | null;
  name: string;
  phone: string;
  address: string | null;
  /** Legacy enum kept in sync with the assigned role. */
  role: ManagementRole;
  roleId: number | null;
  roleName: string;
  permissions: string[];
  isActive: boolean;
  lastLoginAt: string | null;
  email: string;
  title: string | null;
  created: string;
};

/** The signed-in staff member, as returned by GET /api/admin/me. */
export type AdminMeDto = {
  id: number;
  name: string;
  email: string;
  title: string | null;
  photoUrl: string | null;
  roleId: number | null;
  roleName: string;
  permissions: string[];
  /** Set when another staff user is logged in as this one via "log in as". */
  impersonatedBy: ImpersonatorDto | null;
};
export type AdminMeResponse = { admin: AdminMeDto };

export type RoleDto = {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
  userCount: number;
  updatedAt: string;
};
export type RolesListResponse = { roles: RoleDto[] };
export type RoleMutationResponse = OkResponse & { role: RoleDto };

export type ManagementUsersListResponse = { users: ManagementUserDto[] };
export type ManagementUserResponse = { user: ManagementUserDto };
export type ManagementUserCreatedResponse = OkResponse & { admin: ManagementUserDto };
export type ManagementUserUpdatedResponse = OkResponse & { user: ManagementUserDto };

export type AdminLoginResponse = OkResponse & {
  admin: { id: number; email: string; name: string; role: ManagementRole };
};

// ---------------------------------------------------------------------------
// "Log in as" (impersonation)

export type ImpersonatorDto = { id: number; name: string };
/** Where the browser should go next (the target's home page). */
export type ImpersonationResponse = OkResponse & { redirectTo: string };

// ---------------------------------------------------------------------------
// Posts

export type PostDto = {
  id: number;
  title: string;
  content: string | null;
  coverUrl: string | null;
  published: boolean;
  audience: PostAudience;
  created: string;
};

/** A post as the website shows it (never drafts or staff-only posts). */
export type PublicPostDto = {
  id: number;
  title: string;
  /** Plain-text summary. */
  excerpt: string;
  /** Sanitised HTML body; only on the detail page. */
  contentHtml: string | null;
  coverUrl: string | null;
  membersOnly: boolean;
  created: string;
};

export type PostsListResponse = { posts: PostDto[] };
export type PostResponse = { post: PostDto };
export type PostMutationResponse = OkResponse & { post: PostDto };

// ---------------------------------------------------------------------------
// Previews (guideline PDF shown on the registration page)

export type PreviewDto = {
  id: number;
  title: string | null;
  fileUrl: string;
  createdAt: string;
};

export type PreviewCreatedResponse = OkResponse & { preview: PreviewDto };
export type LatestPreviewResponse = { url: string };

// ---------------------------------------------------------------------------
// First-run setup & site settings

export type SetupStatusResponse = { needsSetup: boolean };

export type SettingsResponse = { settings: SiteSettings };
export type SettingsUpdatedResponse = OkResponse & { settings: SiteSettings };

// ---------------------------------------------------------------------------
// Dashboard

export type RecentMemberDto = {
  id: number;
  ownerNameEnglish: string;
  email: string;
  sectorNumber: string;
  plotNumber: string;
  ownerPhoto: string | null;
  status: MemberUiStatus;
  createdAt: string;
};

export type DashboardStats = MembershipStats & {
  adminUsers: number;
  postsTotal: number;
  postsPublished: number;
  postsDraft: number;
  /** Registrations per month for the last 12 months, oldest first ("YYYY-MM"). */
  monthly: Array<{ key: string; count: number }>;
  recent: RecentMemberDto[];
};

// ---------------------------------------------------------------------------
// Accounting

export type FundAccountType = "CASH" | "BANK" | "MOBILE_BANKING";
export type LedgerHeadType = "INCOME" | "EXPENSE";
export type VoucherType = "INCOME" | "EXPENSE" | "TRANSFER";
export type VoucherStatus = "POSTED" | "VOID";

export type FundAccountDto = {
  id: number;
  name: string;
  type: FundAccountType;
  accountNumber: string | null;
  institution: string | null;
  branch: string | null;
  notes: string | null;
  isActive: boolean;
  openingBalance: number;
  balance: number;
  voucherCount: number;
};
export type FundAccountsResponse = { accounts: FundAccountDto[] };
export type FundAccountMutationResponse = OkResponse & { account: FundAccountDto };

export type LedgerHeadDto = {
  id: number;
  name: string;
  code: string | null;
  type: LedgerHeadType;
  description: string | null;
  isActive: boolean;
  isSystem: boolean;
  voucherCount: number;
  total: number;
};
export type LedgerHeadsResponse = { heads: LedgerHeadDto[] };
export type LedgerHeadMutationResponse = OkResponse & { head: LedgerHeadDto };

export type VoucherDto = {
  id: number;
  voucherNo: string;
  type: VoucherType;
  status: VoucherStatus;
  /** YYYY-MM-DD */
  date: string;
  amount: number;
  headId: number | null;
  headName: string | null;
  headCode: string | null;
  accountId: number;
  accountName: string | null;
  toAccountId: number | null;
  toAccountName: string | null;
  partyName: string | null;
  reference: string | null;
  description: string | null;
  attachmentUrl: string | null;
  memberId: number | null;
  memberName: string | null;
  createdBy: string | null;
  voidReason: string | null;
  voidedAt: string | null;
  voidedBy: string | null;
  createdAt: string;
};
export type VouchersResponse = {
  vouchers: VoucherDto[];
  totals: { income: number; expense: number; transfer: number; count: number };
};
export type VoucherResponse = { voucher: VoucherDto };
export type VoucherMutationResponse = OkResponse & { voucher: VoucherDto };

export type HeadTotalDto = { headId: number | null; code: string | null; name: string; type: LedgerHeadType; amount: number; count: number };
export type AccountBalanceDto = { accountId: number; name: string; type: FundAccountType; amount: number };

export type AccountingSummary = {
  asOf: string;
  totalBalance: number;
  balances: Array<{ id: number; name: string; type: FundAccountType; balance: number; accountNumber: string | null }>;
  month: { income: number; expense: number; net: number };
  year: { income: number; expense: number; net: number; topExpenses: HeadTotalDto[]; topIncome: HeadTotalDto[] };
  trend: Array<{ key: string; label: string; income: number; expense: number }>;
  recent: VoucherDto[];
  approvedMembersWithoutFeeEntry: number;
};

export type MemberFeeSyncPreview = { count: number; total: number; byMethod: { BKASH: number; BANK: number } };
export type MemberFeeSyncResponse = OkResponse & { created: number; skipped: number };

export type IncomeExpenditureReport = { income: HeadTotalDto[]; expense: HeadTotalDto[]; totalIncome: number; totalExpense: number; surplus: number };
export type ReceiptsPaymentsReport = {
  opening: AccountBalanceDto[];
  openingTotal: number;
  receipts: HeadTotalDto[];
  totalReceipts: number;
  payments: HeadTotalDto[];
  totalPayments: number;
  closing: AccountBalanceDto[];
  closingTotal: number;
  debitTotal: number;
  creditTotal: number;
};
export type CashBookReport = {
  account: { id: number; name: string; type: FundAccountType; accountNumber: string | null };
  opening: number;
  rows: Array<{ id: number; date: string; voucherNo: string; type: VoucherType; particulars: string; reference: string | null; receipt: number; payment: number; balance: number }>;
  totalReceipts: number;
  totalPayments: number;
  closing: number;
};
export type HeadLedgerReport = {
  head: { id: number; name: string; code: string | null; type: LedgerHeadType };
  rows: Array<{ id: number; date: string; voucherNo: string; party: string; account: string | null; description: string | null; reference: string | null; amount: number; cumulative: number }>;
  total: number;
};
export type DayBookReport = {
  rows: Array<VoucherDto & { particulars: string }>;
  totals: { income: number; expense: number; transfer: number; voided: number };
};
export type TrialBalanceReport = {
  rows: Array<{ group: string; code: string | null; name: string; debit: number; credit: number }>;
  totalDebit: number;
  totalCredit: number;
  balanced: boolean;
};
export type BalanceSheetReport = {
  assets: Array<{ name: string; group: string; amount: number }>;
  totalAssets: number;
  fund: { openingFund: number; accumulatedSurplus: number; total: number };
  balanced: boolean;
};
export type MonthlySummaryReport = {
  year: number;
  months: Array<{ month: number; label: string; income: number; expense: number; net: number }>;
  totals: { income: number; expense: number; net: number };
};

export type ReportType =
  | "income-expenditure"
  | "receipts-payments"
  | "cash-book"
  | "head-ledger"
  | "day-book"
  | "trial-balance"
  | "balance-sheet"
  | "monthly-summary";

export type ReportResponse =
  | { type: "income-expenditure"; period: ReportPeriod; data: IncomeExpenditureReport }
  | { type: "receipts-payments"; period: ReportPeriod; data: ReceiptsPaymentsReport }
  | { type: "cash-book"; period: ReportPeriod; data: CashBookReport }
  | { type: "head-ledger"; period: ReportPeriod; data: HeadLedgerReport }
  | { type: "day-book"; period: ReportPeriod; data: DayBookReport }
  | { type: "trial-balance"; period: ReportPeriod; data: TrialBalanceReport }
  | { type: "balance-sheet"; period: ReportPeriod; data: BalanceSheetReport }
  | { type: "monthly-summary"; period: ReportPeriod; data: MonthlySummaryReport };
export type ReportPeriod = { from: string | null; to: string };
