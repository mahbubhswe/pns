import { prisma } from "@/lib/prisma";
import { refreshPublicPages } from "@/lib/server/cache";
import type { CommitteeMember, Prisma } from "@/lib/generated/prisma";
import { ApiError } from "@/lib/server/http/errors";
import type { CommitteeMemberDto } from "@/types/api";
import type { CreateCommitteeMemberInput, UpdateCommitteeMemberInput } from "./schema";

const ORDER = [{ sortOrder: "asc" as const }, { id: "asc" as const }];

export function toCommitteeMemberDto(m: CommitteeMember): CommitteeMemberDto {
  return {
    id: m.id,
    name: m.name,
    position: m.position,
    bio: m.bio ?? null,
    photoUrl: m.photoUrl ?? null,
    phone: m.phone ?? null,
    email: m.email ?? null,
    sortOrder: m.sortOrder,
    isActive: m.isActive,
  };
}

/** Dashboard: everyone, including hidden entries. */
export async function listCommitteeMembers(): Promise<CommitteeMember[]> {
  return prisma.committeeMember.findMany({ orderBy: ORDER });
}

/** Public /committee page: visible entries only, in display order. */
export async function listPublicCommittee(): Promise<CommitteeMember[]> {
  return prisma.committeeMember.findMany({ where: { isActive: true }, orderBy: ORDER });
}

export async function createCommitteeMember(input: CreateCommitteeMemberInput): Promise<CommitteeMember> {
  const member = await prisma.committeeMember.create({
    data: {
      name: input.name,
      position: input.position,
      bio: input.bio ?? null,
      photoUrl: input.photoUrl ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
    },
  });
  refreshPublicPages();
  return member;
}

export async function updateCommitteeMember(id: number, input: UpdateCommitteeMemberInput): Promise<CommitteeMember> {
  if (!(await prisma.committeeMember.findUnique({ where: { id }, select: { id: true } }))) {
    throw ApiError.notFound("Committee member not found");
  }
  const data: Prisma.CommitteeMemberUpdateInput = {};
  for (const key of ["name", "position", "bio", "photoUrl", "phone", "email", "sortOrder", "isActive"] as const) {
    if (input[key] !== undefined) (data as Record<string, unknown>)[key] = input[key];
  }
  const member = await prisma.committeeMember.update({ where: { id }, data });
  refreshPublicPages();
  return member;
}

export async function deleteCommitteeMember(id: number): Promise<void> {
  await prisma.committeeMember.delete({ where: { id } });
  refreshPublicPages();
}
