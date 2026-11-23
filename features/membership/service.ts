import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import type { Prisma, User } from "@/lib/generated/prisma";
import { BCRYPT_ROUNDS } from "@/lib/config/constants";
import { ApiError } from "@/lib/server/http/errors";
import { MEMBERSHIP_FEE_DEFAULT, formatApplicationRef, formatPnsId, memberStatusFromUi } from "@/lib/shared/membership";
import type { MembershipStats } from "@/types/api";
import type {
  ImportMemberRow,
  ListMembersQuery,
  MemberLoginInput,
  RegisterMemberInput,
  TrackApplicationInput,
} from "./schema";

/** URLs of the documents uploaded alongside a registration. */
export type RegistrationFiles = {
  ownershipProofFile: string | null;
  ownerPhoto: string | null;
};

/** `membershipFee` is decided by the caller from site settings, never by the client. */
export async function registerMember(
  input: RegisterMemberInput,
  files: RegistrationFiles,
  membershipFee: number
): Promise<User> {
  const password = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const associate = input.membershipType === "ASSOCIATE";

  const user = await prisma.user.create({
    data: {
      membershipType: input.membershipType,
      relationToOwner: associate ? (input.relationToOwner ?? null) : null,
      ownerPnsId: associate ? (input.ownerPnsId ?? null) : null,
      sectorNumber: input.sectorNumber,
      roadNumber: input.roadNumber,
      plotNumber: input.plotNumber,
      plotSize: input.plotSize,
      ownershipProofType: input.ownershipProofType,
      ownershipProofFile: files.ownershipProofFile,
      ownerNameEnglish: input.ownerNameEnglish,
      ownerNameBangla: input.ownerNameBangla || input.ownerNameEnglish,
      contactNumber: input.contactNumber,
      nidNumber: input.nidNumber,
      presentAddress: input.presentAddress,
      permanentAddress: input.permanentAddress,
      email: input.email,
      ownerPhoto: files.ownerPhoto,
      password,
      // Paid online through the gateway after submission; manual payment is no longer accepted.
      paymentMethod: "ONLINE",
      paymentStatus: "UNPAID",
      membershipFee,
      agreeDataUse: input.agreeDataUse,
    },
  });
  // The reference uses the row id, so it is set right after the insert.
  return prisma.user.update({
    where: { id: user.id },
    data: { applicationRef: formatApplicationRef(user.id, user.createdAt) },
  });
}

/** Returns the member when credentials are valid, otherwise throws 401. */
export async function authenticateMember(input: MemberLoginInput): Promise<User> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user?.password) throw ApiError.unauthorized("Invalid email or password");
  const ok = await bcrypt.compare(input.password, user.password);
  if (!ok) throw ApiError.unauthorized("Invalid email or password");
  return user;
}

export async function listMembers(query: ListMembersQuery = {}): Promise<User[]> {
  const createdAt: Prisma.DateTimeFilter = {};
  if (query.start) createdAt.gte = query.start;
  if (query.end) {
    const end = new Date(query.end);
    end.setHours(23, 59, 59, 999);
    createdAt.lte = end;
  }
  const where: Prisma.UserWhereInput = Object.keys(createdAt).length ? { createdAt } : {};
  return prisma.user.findMany({ where, orderBy: { createdAt: "desc" } });
}

export async function getMemberById(id: number): Promise<User> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw ApiError.notFound("Member not found");
  return user;
}

export async function updateMemberStatus(id: number, uiStatus: string): Promise<User> {
  const status = memberStatusFromUi(uiStatus);
  if (!status) throw ApiError.badRequest("Invalid status");
  const user = await getMemberById(id);
  // Approval gives a PNS ID to members who don't have one (imported members keep theirs).
  const pnsId = status === "APPROVED" && !user.pnsId ? await nextFreePnsId(id) : undefined;
  return prisma.user.update({ where: { id }, data: { status, ...(pnsId ? { pnsId } : {}) } });
}

/** PNS-<id>, or the next free number if an imported member already uses it. */
async function nextFreePnsId(id: number): Promise<string> {
  for (let n = id; n < id + 1000; n++) {
    const candidate = formatPnsId(n);
    if (!(await prisma.user.findUnique({ where: { pnsId: candidate }, select: { id: true } }))) return candidate;
  }
  throw ApiError.conflict("Could not assign a PNS ID; please set one manually.");
}

export async function updateMemberPhoto(id: number, ownerPhoto: string): Promise<User> {
  return prisma.user.update({ where: { id }, data: { ownerPhoto } });
}

export async function deleteMember(id: number): Promise<void> {
  await prisma.user.delete({ where: { id } });
}

export async function getMembershipStats(): Promise<MembershipStats> {
  const groups = await prisma.user.groupBy({ by: ["status"], _count: { _all: true } });
  const count = (status: User["status"]) => groups.find(g => g.status === status)?._count._all ?? 0;
  const active = count("APPROVED");
  const pending = count("PENDING");
  const inactive = count("REJECTED");
  const total = active + pending + inactive;
  return { total, active, pending, inactive, byType: { standard: total } };
}

export type ImportResult = { created: number; skipped: Array<{ row: number; reason: string }> };

/** Excel stores dates as day counts since 1899-12-30; accept those and normal date strings. */
function parseJoined(value: string | number | undefined): Date | undefined {
  if (value === undefined || value === "") return undefined;
  const d = typeof value === "number" || /^\d+(\.\d+)?$/.test(String(value))
    ? new Date(Math.round((Number(value) - 25569) * 86400 * 1000))
    : new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/**
 * Bulk-import the existing member list from a spreadsheet (template on the
 * Members page). Rows are skipped, not failed, when the name is missing or
 * the PNS ID / email already exists, so the same file can be re-imported.
 * Missing columns are stored as "NA"; imported members get a random password
 * (they can't log in until a password is set for them).
 */
export async function importMembers(rows: ImportMemberRow[]): Promise<ImportResult> {
  const result: ImportResult = { created: 0, skipped: [] };
  for (const [i, row] of rows.entries()) {
    const line = i + 2; // spreadsheet row number (row 1 is the header)
    const name = row.name?.trim();
    if (!name) {
      result.skipped.push({ row: line, reason: "Name is empty" });
      continue;
    }
    const pnsId = row.pnsId?.trim() || null;
    if (pnsId && (await prisma.user.findUnique({ where: { pnsId }, select: { id: true } }))) {
      result.skipped.push({ row: line, reason: `PNS ID ${pnsId} already exists` });
      continue;
    }
    const email = row.email?.trim() || null;
    if (email && (await prisma.user.findUnique({ where: { email }, select: { id: true } }))) {
      result.skipped.push({ row: line, reason: `Email ${email} already exists` });
      continue;
    }
    const joinedAt = parseJoined(row.joinedAt);
    const user = await prisma.user.create({
      data: {
        pnsId,
        membershipType: /assoc/i.test(row.membershipType || "") ? "ASSOCIATE" : "GENERAL",
        sectorNumber: row.sector || "NA",
        roadNumber: row.road || "NA",
        plotNumber: row.plot || "NA",
        plotSize: row.plotSize || "NA",
        ownershipProofType: "LD_TAX_RECEIPT",
        ownerNameEnglish: name,
        ownerNameBangla: row.nameBangla || name,
        contactNumber: row.phone || "",
        nidNumber: row.nid || "NA",
        presentAddress: row.address || "NA",
        permanentAddress: row.address || "NA",
        email: email || `imported+${randomUUID()}@example.com`,
        password: await bcrypt.hash(randomUUID(), BCRYPT_ROUNDS),
        paymentMethod: "BKASH",
        paymentStatus: "PAID",
        membershipFee: MEMBERSHIP_FEE_DEFAULT,
        agreeDataUse: false,
        status: memberStatusFromUi(row.status || "active") ?? "APPROVED",
        createdAt: joinedAt,
      },
    });
    await prisma.user.update({ where: { id: user.id }, data: { applicationRef: formatApplicationRef(user.id, user.createdAt) } });
    result.created += 1;
  }
  return result;
}

const lastTenDigits = (v: string) => v.replace(/\D/g, "").slice(-10);

/**
 * Public "track my application": the reference number and the phone number on
 * the form must both match. The same answer is given for a wrong reference
 * and a wrong phone, so neither can be guessed on its own.
 */
export async function trackApplication(input: TrackApplicationInput): Promise<User> {
  const user = await prisma.user.findUnique({ where: { applicationRef: input.ref } });
  const phone = lastTenDigits(input.phone);
  if (!user || phone.length < 10 || lastTenDigits(user.contactNumber) !== phone) {
    throw ApiError.notFound("No application matches this reference and phone number.");
  }
  return user;
}
