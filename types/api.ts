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

export type ProfileResponse = OkResponse & { profile: MemberDto };
export type UploadResponse = OkResponse & { url: string };

// ---------------------------------------------------------------------------
// Management users (dashboard accounts)

export type ManagementUserDto = {
  id: number;
  photoUrl: string | null;
  name: string;
  phone: string;
  address: string | null;
  role: ManagementRole;
  email: string;
  title: string | null;
  created: string;
};

export type ManagementUsersListResponse = { users: ManagementUserDto[] };
export type ManagementUserResponse = { user: ManagementUserDto };
export type ManagementUserCreatedResponse = OkResponse & { admin: ManagementUserDto };
export type ManagementUserUpdatedResponse = OkResponse & { user: ManagementUserDto };

export type AdminLoginResponse = OkResponse & {
  admin: { id: number; email: string; name: string; role: ManagementRole };
};

// ---------------------------------------------------------------------------
// Posts

export type PostDto = {
  id: number;
  title: string;
  content: string | null;
  coverUrl: string | null;
  published: boolean;
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

export type DashboardStats = MembershipStats & {
  adminUsers: number;
  postsTotal: number;
  postsPublished: number;
  postsDraft: number;
};
