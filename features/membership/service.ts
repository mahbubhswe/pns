import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import type { Prisma, User } from "@/lib/generated/prisma";
import { BCRYPT_ROUNDS } from "@/lib/config/constants";
import { ApiError } from "@/lib/server/http/errors";
import { MEMBERSHIP_FEE_DEFAULT, memberStatusFromUi } from "@/lib/shared/membership";
import type { MembershipStats } from "@/types/api";
import type {
  ImportMemberRow,
  ListMembersQuery,
  MemberLoginInput,
  RegisterMemberInput,
} from "./schema";

/** URLs of the documents uploaded alongside a registration. */
export type RegistrationFiles = {
  ownershipProofFile: string | null;
  ownerPhoto: string | null;
  paymentReceipt: string | null;
};

/** `membershipFee` is decided by the caller from site settings, never by the client. */
export async function registerMember(
  input: RegisterMemberInput,
  files: RegistrationFiles,
  membershipFee: number
): Promise<User> {
  const password = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  return prisma.user.create({
    data: {
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
      paymentMethod: input.paymentMethod,
      bkashTransactionId: input.bkashTransactionId ?? null,
      bkashAccountNumber: input.bkashAccountNumber ?? null,
      bankAccountNumberFrom: input.bankAccountNumberFrom ?? null,
      paymentReceipt: files.paymentReceipt,
      membershipFee,
      agreeDataUse: input.agreeDataUse,
    },
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
  return prisma.user.update({ where: { id }, data: { status } });
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

/**
 * Bulk-import legacy members from a spreadsheet. Rows carry only basic
 * contact data; the remaining required columns are filled with placeholders
 * and a random password so the owner must reset it before logging in.
 */
export async function importMembers(rows: ImportMemberRow[]): Promise<number> {
  let created = 0;
  for (const row of rows) {
    const email = row.email || `imported+${randomUUID()}@example.com`;
    const password = await bcrypt.hash(randomUUID(), BCRYPT_ROUNDS);
    const name = row.name || "Unnamed";
    const joinedAt = row.joinedAt ? new Date(row.joinedAt) : undefined;
    await prisma.user.create({
      data: {
        sectorNumber: "NA",
        roadNumber: "NA",
        plotNumber: "NA",
        plotSize: "NA",
        ownershipProofType: "LD_TAX_RECEIPT",
        ownerNameEnglish: name,
        ownerNameBangla: name,
        contactNumber: row.phone || "",
        nidNumber: "NA",
        presentAddress: "NA",
        permanentAddress: "NA",
        email,
        password,
        paymentMethod: "BKASH",
        membershipFee: MEMBERSHIP_FEE_DEFAULT,
        agreeDataUse: false,
        status: memberStatusFromUi(row.status ?? "active") ?? "APPROVED",
        createdAt: joinedAt && !Number.isNaN(joinedAt.getTime()) ? joinedAt : undefined,
      },
    });
    created += 1;
  }
  return created;
}
