import type { User } from "@/lib/generated/prisma";
import { memberStatusToUi } from "@/lib/shared/membership";
import type { MemberDto, TrackApplicationDto } from "@/types/api";

const iso = (d: Date | string) => (d instanceof Date ? d.toISOString() : String(d));

export function toMemberDto(user: User): MemberDto {
  const createdAt = iso(user.createdAt);
  return {
    id: user.id,
    membershipType: user.membershipType,
    relationToOwner: user.relationToOwner ?? null,
    ownerPnsId: user.ownerPnsId ?? null,
    applicationRef: user.applicationRef ?? null,
    pnsId: user.pnsId ?? null,
    sectorNumber: user.sectorNumber,
    roadNumber: user.roadNumber,
    plotNumber: user.plotNumber,
    plotSize: user.plotSize,
    ownershipProofType: user.ownershipProofType,
    ownershipProofFile: user.ownershipProofFile ?? null,
    ownerNameEnglish: user.ownerNameEnglish,
    ownerNameBangla: user.ownerNameBangla,
    contactNumber: user.contactNumber,
    nidNumber: user.nidNumber,
    presentAddress: user.presentAddress,
    permanentAddress: user.permanentAddress,
    email: user.email,
    ownerPhoto: user.ownerPhoto ?? null,
    paymentMethod: user.paymentMethod,
    bkashTransactionId: user.bkashTransactionId ?? null,
    bkashAccountNumber: user.bkashAccountNumber ?? null,
    bankAccountNumberFrom: user.bankAccountNumberFrom ?? null,
    paymentReceipt: user.paymentReceipt ?? null,
    membershipFee: user.membershipFee,
    paymentStatus: user.paymentStatus,
    paymentTranId: user.paymentTranId ?? null,
    paymentChannel: user.paymentChannel ?? null,
    paidAt: user.paidAt ? iso(user.paidAt) : null,
    agreeDataUse: Boolean(user.agreeDataUse),
    status: memberStatusToUi(user.status),
    statusCode: user.status,
    createdAt,
    updatedAt: iso(user.updatedAt),
    joinedAt: createdAt,
  };
}

export function toTrackApplicationDto(user: User): TrackApplicationDto {
  return {
    ref: user.applicationRef ?? "",
    name: user.ownerNameEnglish,
    membershipType: user.membershipType,
    status: user.status,
    submittedAt: iso(user.createdAt),
    pnsId: user.status === "APPROVED" ? user.pnsId ?? null : null,
    paymentStatus: user.paymentStatus,
    membershipFee: user.membershipFee,
  };
}
