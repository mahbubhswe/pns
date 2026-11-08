/**
 * Society books: fund accounts (cash / bank / bKash), ledger heads and
 * vouchers. Vouchers are never deleted — a mistake is voided with a reason,
 * and voided vouchers are excluded from every balance and report.
 */
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma";
import { ApiError } from "@/lib/server/http/errors";
import type {
  AccountingSummary,
  FundAccountDto,
  FundAccountType,
  HeadTotalDto,
  LedgerHeadDto,
  MemberFeeSyncPreview,
  VoucherDto,
  VoucherType,
  VouchersResponse,
} from "@/types/api";
import { dayString, num, round2, toVoucherDto, voucherInclude } from "./mapper";
import type {
  CreateFundAccountInput,
  CreateLedgerHeadInput,
  ListVouchersQuery,
  MemberFeeSyncInput,
  UpdateFundAccountInput,
  UpdateLedgerHeadInput,
  UpdateVoucherInput,
  VoucherInput,
} from "./schema";

const PREFIX: Record<VoucherType, string> = { INCOME: "RV", EXPENSE: "PV", TRANSFER: "CV" };

export function endOfDay(d: Date): Date {
  return new Date(d.getTime() + 24 * 60 * 60 * 1000 - 1);
}

export function todayUtc(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
}

type DateRange = { from?: Date | null; to?: Date | null };

function dateWhere(range: DateRange): Prisma.DateTimeFilter | undefined {
  const f: Prisma.DateTimeFilter = {};
  if (range.from) f.gte = range.from;
  if (range.to) f.lte = endOfDay(range.to);
  return Object.keys(f).length ? f : undefined;
}

/** Next voucher number like RV-2026-00012 (per type, per calendar year). */
async function nextVoucherNo(tx: Prisma.TransactionClient, type: VoucherType, date: Date): Promise<string> {
  const prefix = `${PREFIX[type]}-${date.getUTCFullYear()}-`;
  const last = await tx.voucher.findFirst({
    where: { voucherNo: { startsWith: prefix } },
    orderBy: { voucherNo: "desc" },
    select: { voucherNo: true },
  });
  const seq = last ? Number(last.voucherNo.slice(prefix.length)) + 1 : 1;
  return `${prefix}${String(seq).padStart(5, "0")}`;
}

// ---------------------------------------------------------------------------
// Balances & totals

export type AccountBalance = {
  id: number;
  name: string;
  type: FundAccountType;
  accountNumber: string | null;
  institution: string | null;
  isActive: boolean;
  openingBalance: number;
  balance: number;
};

/**
 * Balance of every fund account. `before` = balances at the start of that day,
 * `asOf` = at the end of that day. Neither = all time.
 */
export async function accountBalances(opts: { before?: Date | null; asOf?: Date | null } = {}): Promise<AccountBalance[]> {
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
    balance: round2(bal.get(a.id) ?? 0),
  }));
}

/** Totals per ledger head for INCOME and EXPENSE vouchers within a period. */
export async function headTotals(range: DateRange): Promise<{ income: HeadTotalDto[]; expense: HeadTotalDto[]; totalIncome: number; totalExpense: number }> {
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
  const rows: HeadTotalDto[] = groups.map(g => {
    const h = g.headId ? byId.get(g.headId) : undefined;
    return {
      headId: g.headId,
      code: h?.code ?? null,
      name: h?.name ?? "Unclassified",
      type: g.type === "INCOME" ? "INCOME" : "EXPENSE",
      amount: num(g._sum.amount),
      count: g._count._all,
    };
  });
  const sortRows = (a: HeadTotalDto, b: HeadTotalDto) => (a.code || "zz").localeCompare(b.code || "zz") || a.name.localeCompare(b.name);
  const income = rows.filter(r => r.type === "INCOME").sort(sortRows);
  const expense = rows.filter(r => r.type === "EXPENSE").sort(sortRows);
  return {
    income,
    expense,
    totalIncome: round2(income.reduce((s, r) => s + r.amount, 0)),
    totalExpense: round2(expense.reduce((s, r) => s + r.amount, 0)),
  };
}

// ---------------------------------------------------------------------------
// Fund accounts

export async function listFundAccounts(): Promise<FundAccountDto[]> {
  const [balances, counts, meta] = await Promise.all([
    accountBalances(),
    prisma.voucher.groupBy({ by: ["accountId"], _count: { _all: true } }),
    prisma.fundAccount.findMany({ select: { id: true, branch: true, notes: true } }),
  ]);
  const used = new Map(counts.map(c => [c.accountId, c._count._all]));
  const metaById = new Map(meta.map(m => [m.id, m]));
  return balances.map(b => ({
    ...b,
    branch: metaById.get(b.id)?.branch ?? null,
    notes: metaById.get(b.id)?.notes ?? null,
    voucherCount: used.get(b.id) ?? 0,
  }));
}

async function fundAccountDto(id: number): Promise<FundAccountDto> {
  const all = await listFundAccounts();
  const found = all.find(a => a.id === id);
  if (!found) throw ApiError.notFound("Account not found");
  return found;
}

export async function createFundAccount(input: CreateFundAccountInput): Promise<FundAccountDto> {
  if (await prisma.fundAccount.findUnique({ where: { name: input.name } })) {
    throw ApiError.conflict("An account with this name already exists.");
  }
  const created = await prisma.fundAccount.create({
    data: {
      name: input.name,
      type: input.type,
      accountNumber: input.accountNumber ?? null,
      institution: input.institution ?? null,
      branch: input.branch ?? null,
      openingBalance: input.openingBalance,
      notes: input.notes ?? null,
    },
  });
  return fundAccountDto(created.id);
}

export async function updateFundAccount(id: number, input: UpdateFundAccountInput): Promise<FundAccountDto> {
  const account = await prisma.fundAccount.findUnique({ where: { id } });
  if (!account) throw ApiError.notFound("Account not found");
  const data: Prisma.FundAccountUpdateInput = {};
  if (input.name !== undefined && input.name !== account.name) {
    if (await prisma.fundAccount.findUnique({ where: { name: input.name } })) {
      throw ApiError.conflict("Another account already uses this name.");
    }
    data.name = input.name;
  }
  if (input.type !== undefined) data.type = input.type;
  if (input.accountNumber !== undefined) data.accountNumber = input.accountNumber;
  if (input.institution !== undefined) data.institution = input.institution;
  if (input.branch !== undefined) data.branch = input.branch;
  if (input.notes !== undefined) data.notes = input.notes;
  if (input.openingBalance !== undefined) data.openingBalance = input.openingBalance;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  await prisma.fundAccount.update({ where: { id }, data });
  return fundAccountDto(id);
}

export async function deleteFundAccount(id: number): Promise<void> {
  const used = await prisma.voucher.count({ where: { OR: [{ accountId: id }, { toAccountId: id }] } });
  if (used > 0) throw ApiError.conflict(`This account appears on ${used} voucher(s). Mark it inactive instead of deleting.`);
  await prisma.fundAccount.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// Ledger heads

export async function listLedgerHeads(): Promise<LedgerHeadDto[]> {
  const [heads, sums] = await Promise.all([
    prisma.ledgerHead.findMany({ orderBy: [{ type: "asc" }, { code: "asc" }, { name: "asc" }] }),
    prisma.voucher.groupBy({ by: ["headId"], where: { status: "POSTED" }, _sum: { amount: true }, _count: { _all: true } }),
  ]);
  const byHead = new Map(sums.map(s => [s.headId, s]));
  return heads.map(h => ({
    id: h.id,
    name: h.name,
    code: h.code,
    type: h.type,
    description: h.description,
    isActive: h.isActive,
    isSystem: h.isSystem,
    voucherCount: byHead.get(h.id)?._count._all ?? 0,
    total: num(byHead.get(h.id)?._sum.amount),
  }));
}

async function headDto(id: number): Promise<LedgerHeadDto> {
  const found = (await listLedgerHeads()).find(h => h.id === id);
  if (!found) throw ApiError.notFound("Head not found");
  return found;
}

export async function createLedgerHead(input: CreateLedgerHeadInput): Promise<LedgerHeadDto> {
  if (await prisma.ledgerHead.findFirst({ where: { type: input.type, name: input.name } })) {
    throw ApiError.conflict(`An ${input.type.toLowerCase()} head with this name already exists.`);
  }
  if (input.code && (await prisma.ledgerHead.findUnique({ where: { code: input.code } }))) {
    throw ApiError.conflict("This code is already used.");
  }
  const created = await prisma.ledgerHead.create({
    data: { name: input.name, code: input.code ?? null, type: input.type, description: input.description ?? null },
  });
  return headDto(created.id);
}

export async function updateLedgerHead(id: number, input: UpdateLedgerHeadInput): Promise<LedgerHeadDto> {
  const head = await prisma.ledgerHead.findUnique({ where: { id } });
  if (!head) throw ApiError.notFound("Head not found");
  const data: Prisma.LedgerHeadUpdateInput = {};
  if (input.name !== undefined && input.name !== head.name) {
    if (await prisma.ledgerHead.findFirst({ where: { type: head.type, name: input.name } })) {
      throw ApiError.conflict("Another head already uses this name.");
    }
    data.name = input.name;
  }
  if (input.code !== undefined && input.code !== head.code) {
    if (input.code && (await prisma.ledgerHead.findUnique({ where: { code: input.code } }))) {
      throw ApiError.conflict("This code is already used.");
    }
    data.code = input.code;
  }
  if (input.description !== undefined) data.description = input.description;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  await prisma.ledgerHead.update({ where: { id }, data });
  return headDto(id);
}

export async function deleteLedgerHead(id: number): Promise<void> {
  const head = await prisma.ledgerHead.findUnique({ where: { id } });
  if (!head) throw ApiError.notFound("Head not found");
  if (head.isSystem) throw ApiError.badRequest("This built-in head can't be deleted.");
  const used = await prisma.voucher.count({ where: { headId: id } });
  if (used > 0) throw ApiError.conflict(`This head is used on ${used} voucher(s). Mark it inactive instead.`);
  await prisma.ledgerHead.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// Vouchers

type CheckedVoucher = Omit<VoucherInput, "type"> & { type: VoucherType };

async function checkVoucher(input: CheckedVoucher): Promise<CheckedVoucher> {
  if (input.date.getTime() > Date.now() + 36 * 60 * 60 * 1000) throw ApiError.badRequest("Vouchers can't be dated in the future.");
  const account = await prisma.fundAccount.findUnique({ where: { id: input.accountId } });
  if (!account) {
    throw ApiError.badRequest(input.type === "TRANSFER" ? "Choose the account money leaves from." : "Choose the cash/bank account.");
  }
  if (input.type === "TRANSFER") {
    if (!input.toAccountId) throw ApiError.badRequest("Choose the account money goes to.");
    if (input.toAccountId === input.accountId) throw ApiError.badRequest("From and To accounts must be different.");
    if (!(await prisma.fundAccount.findUnique({ where: { id: input.toAccountId } }))) throw ApiError.badRequest("Destination account not found.");
    return { ...input, headId: null };
  }
  if (!input.headId) throw ApiError.badRequest("Choose a ledger head.");
  const head = await prisma.ledgerHead.findUnique({ where: { id: input.headId } });
  if (!head) throw ApiError.badRequest("Choose a ledger head.");
  if (head.type !== input.type) throw ApiError.badRequest(`"${head.name}" is an ${head.type.toLowerCase()} head.`);
  if (input.memberId && !(await prisma.user.findUnique({ where: { id: input.memberId }, select: { id: true } }))) {
    throw ApiError.badRequest("Linked member not found.");
  }
  return { ...input, toAccountId: null };
}

function voucherData(v: CheckedVoucher) {
  return {
    date: v.date,
    amount: v.amount,
    headId: v.headId ?? null,
    accountId: v.accountId,
    toAccountId: v.toAccountId ?? null,
    partyName: v.partyName ?? null,
    reference: v.reference ?? null,
    description: v.description ?? null,
    attachmentUrl: v.attachmentUrl ?? null,
    memberId: v.memberId ?? null,
  };
}

export async function listVouchers(query: ListVouchersQuery): Promise<VouchersResponse> {
  const where: Prisma.VoucherWhereInput = {};
  const date = dateWhere({ from: query.from, to: query.to });
  if (date) where.date = date;
  if (query.type) where.type = query.type;
  if (query.status) where.status = query.status;
  if (query.headId) where.headId = query.headId;
  if (query.memberId) where.memberId = query.memberId;
  if (query.accountId) where.OR = [{ accountId: query.accountId }, { toAccountId: query.accountId }];
  if (query.q) {
    where.AND = [
      {
        OR: [
          { voucherNo: { contains: query.q, mode: "insensitive" } },
          { partyName: { contains: query.q, mode: "insensitive" } },
          { reference: { contains: query.q, mode: "insensitive" } },
          { description: { contains: query.q, mode: "insensitive" } },
        ],
      },
    ];
  }
  const vouchers = await prisma.voucher.findMany({ where, include: voucherInclude, orderBy: [{ date: "desc" }, { id: "desc" }], take: query.limit });
  const rows = vouchers.map(toVoucherDto);
  const posted = rows.filter(r => r.status === "POSTED");
  const sum = (t: VoucherType) => round2(posted.filter(r => r.type === t).reduce((s, r) => s + r.amount, 0));
  return { vouchers: rows, totals: { income: sum("INCOME"), expense: sum("EXPENSE"), transfer: sum("TRANSFER"), count: rows.length } };
}

export async function getVoucher(id: number): Promise<VoucherDto> {
  const v = await prisma.voucher.findUnique({ where: { id }, include: voucherInclude });
  if (!v) throw ApiError.notFound("Voucher not found");
  return toVoucherDto(v);
}

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: unknown }).code === "P2002";
}

export async function createVoucher(input: VoucherInput, createdById: number): Promise<VoucherDto> {
  const v = await checkVoucher(input);
  // Numbers are sequential per type & year; retry if two people save at the same moment.
  for (let attempt = 0; ; attempt++) {
    try {
      const created = await prisma.$transaction(async tx => {
        const voucherNo = await nextVoucherNo(tx, v.type, v.date);
        return tx.voucher.create({ data: { ...voucherData(v), type: v.type, voucherNo, createdById }, include: voucherInclude });
      });
      return toVoucherDto(created);
    } catch (err) {
      if (isUniqueViolation(err) && attempt < 3) continue;
      throw err;
    }
  }
}

export async function updateVoucher(id: number, input: UpdateVoucherInput): Promise<VoucherDto> {
  const existing = await prisma.voucher.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound("Voucher not found");
  if (existing.status === "VOID") throw ApiError.badRequest("A voided voucher can't be edited.");
  const v = await checkVoucher({ ...input, type: existing.type });
  if (v.date.getUTCFullYear() !== existing.date.getUTCFullYear()) {
    throw ApiError.badRequest("Moving a voucher to another year isn't allowed — void it and record a new one.");
  }
  const updated = await prisma.voucher.update({ where: { id }, data: voucherData(v), include: voucherInclude });
  return toVoucherDto(updated);
}

export async function voidVoucher(id: number, reason: string, voidedById: number): Promise<VoucherDto> {
  const v = await prisma.voucher.findUnique({ where: { id } });
  if (!v) throw ApiError.notFound("Voucher not found");
  if (v.status === "VOID") throw ApiError.badRequest("This voucher is already void.");
  const updated = await prisma.voucher.update({
    where: { id },
    data: { status: "VOID", voidReason: reason, voidedAt: new Date(), voidedById },
    include: voucherInclude,
  });
  return toVoucherDto(updated);
}

// ---------------------------------------------------------------------------
// Membership fees → receipts

const pendingFeeMembers = () =>
  prisma.user.findMany({
    where: { status: "APPROVED", vouchers: { none: {} } },
    select: {
      id: true,
      ownerNameEnglish: true,
      sectorNumber: true,
      roadNumber: true,
      plotNumber: true,
      paymentMethod: true,
      membershipFee: true,
      bkashTransactionId: true,
      bankAccountNumberFrom: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

export async function previewMemberFeeSync(): Promise<MemberFeeSyncPreview> {
  const members = await pendingFeeMembers();
  return {
    count: members.length,
    total: members.reduce((s, m) => s + (m.membershipFee || 0), 0),
    byMethod: {
      BKASH: members.filter(m => m.paymentMethod === "BKASH").length,
      BANK: members.filter(m => m.paymentMethod === "BANK").length,
    },
  };
}

/** One receipt voucher per approved member without one, dated on their application day. */
export async function syncMemberFees(input: MemberFeeSyncInput, createdById: number): Promise<{ created: number; skipped: number }> {
  const head = input.headId
    ? await prisma.ledgerHead.findUnique({ where: { id: input.headId } })
    : await prisma.ledgerHead.findFirst({ where: { type: "INCOME", name: "Membership Fee" } });
  if (!head || head.type !== "INCOME") throw ApiError.badRequest("Choose the income head for membership fees.");
  const bkash = input.bkashAccountId ? await prisma.fundAccount.findUnique({ where: { id: input.bkashAccountId } }) : null;
  const bank = input.bankAccountId ? await prisma.fundAccount.findUnique({ where: { id: input.bankAccountId } }) : null;

  let created = 0;
  let skipped = 0;
  for (const m of await pendingFeeMembers()) {
    const account = m.paymentMethod === "BANK" ? bank : bkash;
    if (!account) {
      skipped++;
      continue;
    }
    const date = new Date(`${dayString(m.createdAt)}T00:00:00.000Z`);
    await prisma.$transaction(async tx => {
      const voucherNo = await nextVoucherNo(tx, "INCOME", date);
      await tx.voucher.create({
        data: {
          voucherNo,
          type: "INCOME",
          date,
          amount: m.membershipFee || 0,
          headId: head.id,
          accountId: account.id,
          partyName: m.ownerNameEnglish,
          reference: m.bkashTransactionId || m.bankAccountNumberFrom || null,
          description: `Membership fee — Sector ${m.sectorNumber}, Road ${m.roadNumber}, Plot ${m.plotNumber}`,
          memberId: m.id,
          createdById,
        },
      });
    });
    created++;
  }
  return { created, skipped };
}

// ---------------------------------------------------------------------------
// Overview

export async function getAccountingSummary(): Promise<AccountingSummary> {
  const today = todayUtc();
  const y = today.getUTCFullYear();
  const m = today.getUTCMonth();
  const monthStart = new Date(Date.UTC(y, m, 1));
  const yearStart = new Date(Date.UTC(y, 0, 1));
  const trendStart = new Date(Date.UTC(y, m - 11, 1));

  const [balances, month, year, recent, trendRows, pending] = await Promise.all([
    accountBalances(),
    headTotals({ from: monthStart, to: today }),
    headTotals({ from: yearStart, to: today }),
    prisma.voucher.findMany({ include: voucherInclude, orderBy: [{ date: "desc" }, { id: "desc" }], take: 8 }),
    prisma.voucher.findMany({
      where: { status: "POSTED", type: { in: ["INCOME", "EXPENSE"] }, date: { gte: trendStart, lte: endOfDay(today) } },
      select: { type: true, amount: true, date: true },
    }),
    prisma.user.count({ where: { status: "APPROVED", vouchers: { none: {} } } }),
  ]);

  const key = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  const trend = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 11 + i, 1));
    return { key: key(d), label: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }), income: 0, expense: 0 };
  });
  const idx = new Map(trend.map((t, i) => [t.key, i]));
  for (const r of trendRows) {
    const i = idx.get(key(r.date));
    if (i === undefined) continue;
    if (r.type === "INCOME") trend[i].income += num(r.amount);
    else trend[i].expense += num(r.amount);
  }

  return {
    asOf: dayString(today),
    totalBalance: round2(balances.reduce((s, a) => s + a.balance, 0)),
    balances: balances.map(b => ({ id: b.id, name: b.name, type: b.type, balance: b.balance, accountNumber: b.accountNumber })),
    month: { income: month.totalIncome, expense: month.totalExpense, net: round2(month.totalIncome - month.totalExpense) },
    year: {
      income: year.totalIncome,
      expense: year.totalExpense,
      net: round2(year.totalIncome - year.totalExpense),
      topExpenses: [...year.expense].sort((a, b) => b.amount - a.amount).slice(0, 5),
      topIncome: [...year.income].sort((a, b) => b.amount - a.amount).slice(0, 5),
    },
    trend: trend.map(t => ({ ...t, income: Math.round(t.income), expense: Math.round(t.expense) })),
    recent: recent.map(toVoucherDto),
    approvedMembersWithoutFeeEntry: pending,
  };
}
