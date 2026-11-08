// lib/server/accounting.ts — books for the society: balances, voucher numbers and standard reports.
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma";

export type VoucherKind = "INCOME" | "EXPENSE" | "TRANSFER";

const PREFIX: Record<VoucherKind, string> = { INCOME: "RV", EXPENSE: "PV", TRANSFER: "CV" };

export const num = (v: unknown): number => {
  if (v === null || v === undefined) return 0;
  const n = typeof v === "object" && v !== null && "toNumber" in (v as any) ? (v as any).toNumber() : Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
};

/** "YYYY-MM-DD" -> Date at 00:00 UTC (vouchers are stored date-only, in UTC). */
export function parseDay(value: unknown): Date | null {
  if (!value) return null;
  const s = String(Array.isArray(value) ? value[0] : value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function endOfDay(d: Date): Date {
  return new Date(d.getTime() + 24 * 60 * 60 * 1000 - 1);
}

export const dayString = (d: Date | string) => new Date(d).toISOString().slice(0, 10);

export function todayUtc(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
}

/** Next voucher number like RV-2026-00012 (per type, per calendar year). */
export async function nextVoucherNo(tx: Prisma.TransactionClient, type: VoucherKind, date: Date): Promise<string> {
  const prefix = `${PREFIX[type]}-${date.getUTCFullYear()}-`;
  const last = await tx.voucher.findFirst({
    where: { voucherNo: { startsWith: prefix } },
    orderBy: { voucherNo: "desc" },
    select: { voucherNo: true },
  });
  const seq = last ? Number(last.voucherNo.slice(prefix.length)) + 1 : 1;
  return `${prefix}${String(seq).padStart(5, "0")}`;
}

type DateRange = { from?: Date | null; to?: Date | null };

function dateWhere(range: DateRange): Prisma.DateTimeFilter | undefined {
  const f: Prisma.DateTimeFilter = {};
  if (range.from) f.gte = range.from;
  if (range.to) f.lte = endOfDay(range.to);
  return Object.keys(f).length ? f : undefined;
}

/**
 * Balance of every fund account. `before` = balances at the start of that day (exclusive),
 * `asOf` = balances at the end of that day (inclusive). Neither = all time.
 */
export async function accountBalances(opts: { before?: Date | null; asOf?: Date | null } = {}) {
  const accounts = await prisma.fundAccount.findMany({ orderBy: [{ type: "asc" }, { name: "asc" }] });
  const date: Prisma.DateTimeFilter | undefined = opts.before
    ? { lt: opts.before }
    : opts.asOf
      ? { lte: endOfDay(opts.asOf) }
      : undefined;
  const base: Prisma.VoucherWhereInput = { status: "POSTED", ...(date ? { date } : {}) };

  const [outgoing, incoming] = await Promise.all([
    prisma.voucher.groupBy({ by: ["accountId", "type"], where: base, _sum: { amount: true } }),
    prisma.voucher.groupBy({ by: ["toAccountId"], where: { ...base, type: "TRANSFER" }, _sum: { amount: true } }),
  ]);

  const bal = new Map<number, number>(accounts.map(a => [a.id, num(a.openingBalance)]));
  for (const g of outgoing) {
    const v = num(g._sum.amount);
    const cur = bal.get(g.accountId) ?? 0;
    bal.set(g.accountId, g.type === "INCOME" ? cur + v : cur - v);
  }
  for (const g of incoming) {
    if (g.toAccountId == null) continue;
    bal.set(g.toAccountId, (bal.get(g.toAccountId) ?? 0) + num(g._sum.amount));
  }
  return accounts.map(a => ({
    id: a.id,
    name: a.name,
    type: a.type,
    accountNumber: a.accountNumber,
    institution: a.institution,
    isActive: a.isActive,
    openingBalance: num(a.openingBalance),
    balance: Math.round((bal.get(a.id) ?? 0) * 100) / 100,
  }));
}

/** Totals per ledger head for INCOME and EXPENSE vouchers within a period. */
export async function headTotals(range: DateRange) {
  const date = dateWhere(range);
  const [groups, heads] = await Promise.all([
    prisma.voucher.groupBy({
      by: ["headId", "type"],
      where: { status: "POSTED", type: { in: ["INCOME", "EXPENSE"] }, ...(date ? { date } : {}) },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.ledgerHead.findMany(),
  ]);
  const byId = new Map(heads.map(h => [h.id, h]));
  const rows = groups.map(g => {
    const h = g.headId ? byId.get(g.headId) : undefined;
    return {
      headId: g.headId,
      code: h?.code || null,
      name: h?.name || "Unclassified",
      type: g.type as "INCOME" | "EXPENSE",
      amount: num(g._sum.amount),
      count: g._count._all,
    };
  });
  const sortRows = (a: { code: string | null; name: string }, b: { code: string | null; name: string }) =>
    (a.code || "zz").localeCompare(b.code || "zz") || a.name.localeCompare(b.name);
  const income = rows.filter(r => r.type === "INCOME").sort(sortRows);
  const expense = rows.filter(r => r.type === "EXPENSE").sort(sortRows);
  const totalIncome = income.reduce((s, r) => s + r.amount, 0);
  const totalExpense = expense.reduce((s, r) => s + r.amount, 0);
  return { income, expense, totalIncome: round(totalIncome), totalExpense: round(totalExpense) };
}

const round = (n: number) => Math.round(n * 100) / 100;

const voucherInclude = {
  head: { select: { id: true, name: true, code: true } },
  account: { select: { id: true, name: true, type: true } },
  toAccount: { select: { id: true, name: true, type: true } },
  member: { select: { id: true, ownerNameEnglish: true } },
  createdBy: { select: { id: true, name: true } },
  voidedBy: { select: { id: true, name: true } },
} satisfies Prisma.VoucherInclude;

export type VoucherWithRefs = Prisma.VoucherGetPayload<{ include: typeof voucherInclude }>;

export function voucherToJson(v: VoucherWithRefs) {
  return {
    id: v.id,
    voucherNo: v.voucherNo,
    type: v.type,
    status: v.status,
    date: dayString(v.date),
    amount: num(v.amount),
    headId: v.headId,
    headName: v.head?.name || null,
    headCode: v.head?.code || null,
    accountId: v.accountId,
    accountName: v.account?.name || null,
    toAccountId: v.toAccountId,
    toAccountName: v.toAccount?.name || null,
    partyName: v.partyName,
    reference: v.reference,
    description: v.description,
    attachmentUrl: v.attachmentUrl,
    memberId: v.memberId,
    memberName: v.member?.ownerNameEnglish || null,
    createdBy: v.createdBy?.name || null,
    voidReason: v.voidReason,
    voidedAt: v.voidedAt,
    voidedBy: v.voidedBy?.name || null,
    createdAt: v.createdAt,
  };
}

export { voucherInclude };

/** Plain-language particulars for a voucher line in a book/ledger. */
function particulars(v: ReturnType<typeof voucherToJson>, perspectiveAccountId?: number) {
  if (v.type === "TRANSFER") {
    if (perspectiveAccountId && v.toAccountId === perspectiveAccountId) return `Transfer from ${v.accountName}`;
    return `Transfer to ${v.toAccountName}`;
  }
  return [v.headName, v.partyName].filter(Boolean).join(" — ") || v.description || "—";
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export const REPORT_TYPES = [
  "income-expenditure",
  "receipts-payments",
  "cash-book",
  "head-ledger",
  "day-book",
  "trial-balance",
  "balance-sheet",
  "monthly-summary",
] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export async function incomeExpenditure(from: Date | null, to: Date | null) {
  const t = await headTotals({ from, to });
  return { ...t, surplus: round(t.totalIncome - t.totalExpense) };
}

export async function receiptsPayments(from: Date, to: Date) {
  const [opening, closing, t] = await Promise.all([
    accountBalances({ before: from }),
    accountBalances({ asOf: to }),
    headTotals({ from, to }),
  ]);
  const openingTotal = round(opening.reduce((s, a) => s + a.balance, 0));
  const closingTotal = round(closing.reduce((s, a) => s + a.balance, 0));
  return {
    opening: opening.map(a => ({ accountId: a.id, name: a.name, type: a.type, amount: a.balance })),
    openingTotal,
    receipts: t.income,
    totalReceipts: t.totalIncome,
    payments: t.expense,
    totalPayments: t.totalExpense,
    closing: closing.map(a => ({ accountId: a.id, name: a.name, type: a.type, amount: a.balance })),
    closingTotal,
    // Debit side = opening + receipts; credit side = payments + closing. They must match.
    debitTotal: round(openingTotal + t.totalIncome),
    creditTotal: round(t.totalExpense + closingTotal),
  };
}

export async function cashBook(accountId: number, from: Date, to: Date) {
  const account = await prisma.fundAccount.findUnique({ where: { id: accountId } });
  if (!account) throw new Error("Account not found");
  const opening = (await accountBalances({ before: from })).find(a => a.id === accountId)?.balance ?? 0;
  const vouchers = await prisma.voucher.findMany({
    where: {
      status: "POSTED",
      date: { gte: from, lte: endOfDay(to) },
      OR: [{ accountId }, { toAccountId: accountId, type: "TRANSFER" }],
    },
    include: voucherInclude,
    orderBy: [{ date: "asc" }, { id: "asc" }],
  });
  let running = opening;
  let totalReceipts = 0;
  let totalPayments = 0;
  const rows = vouchers.map(raw => {
    const v = voucherToJson(raw);
    const inflow = v.type === "INCOME" || (v.type === "TRANSFER" && v.toAccountId === accountId);
    const receipt = inflow ? v.amount : 0;
    const payment = inflow ? 0 : v.amount;
    running = round(running + receipt - payment);
    totalReceipts += receipt;
    totalPayments += payment;
    return {
      id: v.id,
      date: v.date,
      voucherNo: v.voucherNo,
      type: v.type,
      particulars: particulars(v, accountId),
      reference: v.reference,
      receipt,
      payment,
      balance: running,
    };
  });
  return {
    account: { id: account.id, name: account.name, type: account.type, accountNumber: account.accountNumber },
    opening: round(opening),
    rows,
    totalReceipts: round(totalReceipts),
    totalPayments: round(totalPayments),
    closing: round(running),
  };
}

export async function headLedger(headId: number, from: Date | null, to: Date | null) {
  const head = await prisma.ledgerHead.findUnique({ where: { id: headId } });
  if (!head) throw new Error("Ledger head not found");
  const date = dateWhere({ from, to });
  const vouchers = await prisma.voucher.findMany({
    where: { status: "POSTED", headId, ...(date ? { date } : {}) },
    include: voucherInclude,
    orderBy: [{ date: "asc" }, { id: "asc" }],
  });
  let running = 0;
  const rows = vouchers.map(raw => {
    const v = voucherToJson(raw);
    running = round(running + v.amount);
    return {
      id: v.id,
      date: v.date,
      voucherNo: v.voucherNo,
      party: v.partyName || v.memberName || "—",
      account: v.accountName,
      description: v.description,
      reference: v.reference,
      amount: v.amount,
      cumulative: running,
    };
  });
  return { head: { id: head.id, name: head.name, code: head.code, type: head.type }, rows, total: round(running) };
}

export async function dayBook(from: Date, to: Date) {
  const vouchers = await prisma.voucher.findMany({
    where: { date: { gte: from, lte: endOfDay(to) } },
    include: voucherInclude,
    orderBy: [{ date: "asc" }, { id: "asc" }],
  });
  const rows = vouchers.map(raw => {
    const v = voucherToJson(raw);
    return { ...v, particulars: particulars(v) };
  });
  const posted = rows.filter(r => r.status === "POSTED");
  const sum = (t: VoucherKind) => round(posted.filter(r => r.type === t).reduce((s, r) => s + r.amount, 0));
  return {
    rows,
    totals: { income: sum("INCOME"), expense: sum("EXPENSE"), transfer: sum("TRANSFER"), voided: rows.length - posted.length },
  };
}

export async function trialBalance(asOf: Date) {
  const [balances, t, accounts] = await Promise.all([
    accountBalances({ asOf }),
    headTotals({ to: asOf }),
    prisma.fundAccount.findMany({ select: { openingBalance: true } }),
  ]);
  const openingFund = round(accounts.reduce((s, a) => s + num(a.openingBalance), 0));
  const rows: Array<{ group: string; code: string | null; name: string; debit: number; credit: number }> = [];
  for (const a of balances) {
    rows.push({ group: "Assets (fund accounts)", code: null, name: a.name, debit: a.balance >= 0 ? a.balance : 0, credit: a.balance < 0 ? -a.balance : 0 });
  }
  rows.push({ group: "Capital", code: null, name: "Opening general fund", debit: 0, credit: openingFund });
  for (const h of t.income) rows.push({ group: "Income", code: h.code, name: h.name, debit: 0, credit: h.amount });
  for (const h of t.expense) rows.push({ group: "Expenditure", code: h.code, name: h.name, debit: h.amount, credit: 0 });
  const totalDebit = round(rows.reduce((s, r) => s + r.debit, 0));
  const totalCredit = round(rows.reduce((s, r) => s + r.credit, 0));
  return { rows, totalDebit, totalCredit, balanced: Math.abs(totalDebit - totalCredit) < 0.01 };
}

export async function balanceSheet(asOf: Date) {
  const [balances, t, accounts] = await Promise.all([
    accountBalances({ asOf }),
    headTotals({ to: asOf }),
    prisma.fundAccount.findMany({ select: { openingBalance: true } }),
  ]);
  const openingFund = round(accounts.reduce((s, a) => s + num(a.openingBalance), 0));
  const surplus = round(t.totalIncome - t.totalExpense);
  const groups: Record<string, string> = { CASH: "Cash in hand", BANK: "Cash at bank", MOBILE_BANKING: "Mobile banking (bKash etc.)" };
  const assets = balances.map(a => ({ name: a.name, group: groups[a.type] || a.type, amount: a.balance }));
  const totalAssets = round(assets.reduce((s, a) => s + a.amount, 0));
  return {
    assets,
    totalAssets,
    fund: { openingFund, accumulatedSurplus: surplus, total: round(openingFund + surplus) },
    balanced: Math.abs(totalAssets - (openingFund + surplus)) < 0.01,
  };
}

export async function monthlySummary(year: number) {
  const from = new Date(Date.UTC(year, 0, 1));
  const to = new Date(Date.UTC(year, 11, 31));
  const vouchers = await prisma.voucher.findMany({
    where: { status: "POSTED", type: { in: ["INCOME", "EXPENSE"] }, date: { gte: from, lte: endOfDay(to) } },
    select: { type: true, amount: true, date: true },
  });
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    label: new Date(Date.UTC(year, i, 1)).toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
    income: 0,
    expense: 0,
    net: 0,
  }));
  for (const v of vouchers) {
    const m = months[new Date(v.date).getUTCMonth()];
    if (v.type === "INCOME") m.income += num(v.amount);
    else m.expense += num(v.amount);
  }
  for (const m of months) {
    m.income = round(m.income);
    m.expense = round(m.expense);
    m.net = round(m.income - m.expense);
  }
  const totals = {
    income: round(months.reduce((s, m) => s + m.income, 0)),
    expense: round(months.reduce((s, m) => s + m.expense, 0)),
  };
  return { year, months, totals: { ...totals, net: round(totals.income - totals.expense) } };
}
