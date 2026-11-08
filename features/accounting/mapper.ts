import type { Prisma } from "@/lib/generated/prisma";
import type { VoucherDto } from "@/types/api";

type Decimalish = Prisma.Decimal | number | string | null | undefined;

/** Decimal → number rounded to paisa. */
export function num(v: Decimalish): number {
  if (v === null || v === undefined) return 0;
  const n = typeof v === "object" ? v.toNumber() : Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

export const round2 = (n: number) => Math.round(n * 100) / 100;

export const dayString = (d: Date) => d.toISOString().slice(0, 10);

export const voucherInclude = {
  head: { select: { id: true, name: true, code: true } },
  account: { select: { id: true, name: true, type: true } },
  toAccount: { select: { id: true, name: true, type: true } },
  member: { select: { id: true, ownerNameEnglish: true } },
  createdBy: { select: { id: true, name: true } },
  voidedBy: { select: { id: true, name: true } },
} satisfies Prisma.VoucherInclude;

export type VoucherWithRefs = Prisma.VoucherGetPayload<{ include: typeof voucherInclude }>;

export function toVoucherDto(v: VoucherWithRefs): VoucherDto {
  return {
    id: v.id,
    voucherNo: v.voucherNo,
    type: v.type,
    status: v.status,
    date: dayString(v.date),
    amount: num(v.amount),
    headId: v.headId,
    headName: v.head?.name ?? null,
    headCode: v.head?.code ?? null,
    accountId: v.accountId,
    accountName: v.account?.name ?? null,
    toAccountId: v.toAccountId,
    toAccountName: v.toAccount?.name ?? null,
    partyName: v.partyName,
    reference: v.reference,
    description: v.description,
    attachmentUrl: v.attachmentUrl,
    memberId: v.memberId,
    memberName: v.member?.ownerNameEnglish ?? null,
    createdBy: v.createdBy?.name ?? null,
    voidReason: v.voidReason,
    voidedAt: v.voidedAt ? v.voidedAt.toISOString() : null,
    voidedBy: v.voidedBy?.name ?? null,
    createdAt: v.createdAt.toISOString(),
  };
}

/** Plain-language particulars for a voucher line in a book/ledger. */
export function particulars(v: VoucherDto, perspectiveAccountId?: number): string {
  if (v.type === "TRANSFER") {
    if (perspectiveAccountId && v.toAccountId === perspectiveAccountId) return `Transfer from ${v.accountName}`;
    return `Transfer to ${v.toAccountName}`;
  }
  return [v.headName, v.partyName].filter(Boolean).join(" — ") || v.description || "—";
}
