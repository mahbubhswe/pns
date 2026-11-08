// lib/server/voucher-input.ts — validate a voucher payload coming from the admin UI.
import { prisma } from "@/lib/prisma";
import { num, parseDay, VoucherKind } from "@/lib/server/accounting";

export type VoucherInput = {
  type: VoucherKind;
  date: Date;
  amount: number;
  headId: number | null;
  accountId: number;
  toAccountId: number | null;
  partyName: string | null;
  reference: string | null;
  description: string | null;
  attachmentUrl: string | null;
  memberId: number | null;
};

const text = (v: unknown, max = 500) => {
  const s = v === undefined || v === null ? "" : String(v).trim();
  return s ? s.slice(0, max) : null;
};

export async function validateVoucher(body: any, fixedType?: VoucherKind): Promise<{ ok: true; data: VoucherInput } | { ok: false; error: string }> {
  const type = (fixedType || String(body?.type || "").toUpperCase()) as VoucherKind;
  if (!["INCOME", "EXPENSE", "TRANSFER"].includes(type)) return { ok: false, error: "Choose income, expense or transfer." };

  const date = parseDay(body?.date);
  if (!date) return { ok: false, error: "Pick a valid date." };
  const tomorrow = Date.now() + 36 * 60 * 60 * 1000;
  if (date.getTime() > tomorrow) return { ok: false, error: "Vouchers can't be dated in the future." };

  const amount = num(body?.amount);
  if (!(amount > 0)) return { ok: false, error: "Amount must be more than zero." };
  if (amount > 999_999_999_999) return { ok: false, error: "Amount is too large." };

  const accountId = Number(body?.accountId);
  const account = accountId ? await prisma.fundAccount.findUnique({ where: { id: accountId } }) : null;
  if (!account) return { ok: false, error: type === "TRANSFER" ? "Choose the account money leaves from." : "Choose the cash/bank account." };

  let headId: number | null = null;
  let toAccountId: number | null = null;

  if (type === "TRANSFER") {
    toAccountId = Number(body?.toAccountId) || null;
    if (!toAccountId) return { ok: false, error: "Choose the account money goes to." };
    if (toAccountId === accountId) return { ok: false, error: "From and To accounts must be different." };
    const to = await prisma.fundAccount.findUnique({ where: { id: toAccountId } });
    if (!to) return { ok: false, error: "Destination account not found." };
  } else {
    headId = Number(body?.headId) || null;
    const head = headId ? await prisma.ledgerHead.findUnique({ where: { id: headId } }) : null;
    if (!head) return { ok: false, error: "Choose a ledger head." };
    if (head.type !== type) return { ok: false, error: `"${head.name}" is an ${head.type.toLowerCase()} head.` };
  }

  const memberId = Number(body?.memberId) || null;
  if (memberId && !(await prisma.user.findUnique({ where: { id: memberId }, select: { id: true } })))
    return { ok: false, error: "Linked member not found." };

  return {
    ok: true,
    data: {
      type,
      date,
      amount,
      headId,
      accountId,
      toAccountId,
      partyName: text(body?.partyName, 160),
      reference: text(body?.reference, 120),
      description: text(body?.description, 1000),
      attachmentUrl: text(body?.attachmentUrl, 1000),
      memberId,
    },
  };
}
