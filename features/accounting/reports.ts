/**
 * Standard reports for a non-profit society's books: Income & Expenditure,
 * Receipts & Payments, Cash/Bank book, Head ledger, Day book, Trial balance,
 * Balance sheet and a monthly summary. Voided vouchers are always excluded,
 * except in the day book where they're listed for the audit trail.
 */
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/server/http/errors";
import type {
  BalanceSheetReport,
  CashBookReport,
  DayBookReport,
  HeadLedgerReport,
  IncomeExpenditureReport,
  MonthlySummaryReport,
  ReceiptsPaymentsReport,
  ReportResponse,
  TrialBalanceReport,
  VoucherType,
} from "@/types/api";
import { dayString, num, particulars, round2, toVoucherDto, voucherInclude } from "./mapper";
import { accountBalances, endOfDay, headTotals, todayUtc } from "./service";
import type { ReportQuery } from "./schema";

export async function incomeExpenditure(from: Date | null, to: Date | null): Promise<IncomeExpenditureReport> {
  const t = await headTotals({ from, to });
  return { ...t, surplus: round2(t.totalIncome - t.totalExpense) };
}

export async function receiptsPayments(from: Date, to: Date): Promise<ReceiptsPaymentsReport> {
  const [opening, closing, t] = await Promise.all([
    accountBalances({ before: from }),
    accountBalances({ asOf: to }),
    headTotals({ from, to }),
  ]);
  const openingTotal = round2(opening.reduce((s, a) => s + a.balance, 0));
  const closingTotal = round2(closing.reduce((s, a) => s + a.balance, 0));
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
    debitTotal: round2(openingTotal + t.totalIncome),
    creditTotal: round2(t.totalExpense + closingTotal),
  };
}

export async function cashBook(accountId: number, from: Date, to: Date): Promise<CashBookReport> {
  const account = await prisma.fundAccount.findUnique({ where: { id: accountId } });
  if (!account) throw ApiError.notFound("Account not found");
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
    const v = toVoucherDto(raw);
    const inflow = v.type === "INCOME" || (v.type === "TRANSFER" && v.toAccountId === accountId);
    const receipt = inflow ? v.amount : 0;
    const payment = inflow ? 0 : v.amount;
    running = round2(running + receipt - payment);
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
    opening: round2(opening),
    rows,
    totalReceipts: round2(totalReceipts),
    totalPayments: round2(totalPayments),
    closing: round2(running),
  };
}

export async function headLedger(headId: number, from: Date | null, to: Date | null): Promise<HeadLedgerReport> {
  const head = await prisma.ledgerHead.findUnique({ where: { id: headId } });
  if (!head) throw ApiError.notFound("Ledger head not found");
  const date: { gte?: Date; lte?: Date } = {};
  if (from) date.gte = from;
  if (to) date.lte = endOfDay(to);
  const vouchers = await prisma.voucher.findMany({
    where: { status: "POSTED", headId, ...(Object.keys(date).length ? { date } : {}) },
    include: voucherInclude,
    orderBy: [{ date: "asc" }, { id: "asc" }],
  });
  let running = 0;
  const rows = vouchers.map(raw => {
    const v = toVoucherDto(raw);
    running = round2(running + v.amount);
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
  return { head: { id: head.id, name: head.name, code: head.code, type: head.type }, rows, total: round2(running) };
}

export async function dayBook(from: Date, to: Date): Promise<DayBookReport> {
  const vouchers = await prisma.voucher.findMany({
    where: { date: { gte: from, lte: endOfDay(to) } },
    include: voucherInclude,
    orderBy: [{ date: "asc" }, { id: "asc" }],
  });
  const rows = vouchers.map(raw => {
    const v = toVoucherDto(raw);
    return { ...v, particulars: particulars(v) };
  });
  const posted = rows.filter(r => r.status === "POSTED");
  const sum = (t: VoucherType) => round2(posted.filter(r => r.type === t).reduce((s, r) => s + r.amount, 0));
  return {
    rows,
    totals: { income: sum("INCOME"), expense: sum("EXPENSE"), transfer: sum("TRANSFER"), voided: rows.length - posted.length },
  };
}

async function openingFund(): Promise<number> {
  const accounts = await prisma.fundAccount.findMany({ select: { openingBalance: true } });
  return round2(accounts.reduce((s, a) => s + num(a.openingBalance), 0));
}

export async function trialBalance(asOf: Date): Promise<TrialBalanceReport> {
  const [balances, t, fund] = await Promise.all([accountBalances({ asOf }), headTotals({ to: asOf }), openingFund()]);
  const rows: TrialBalanceReport["rows"] = [];
  for (const a of balances) {
    rows.push({ group: "Assets (fund accounts)", code: null, name: a.name, debit: a.balance >= 0 ? a.balance : 0, credit: a.balance < 0 ? -a.balance : 0 });
  }
  rows.push({ group: "Capital", code: null, name: "Opening general fund", debit: 0, credit: fund });
  for (const h of t.income) rows.push({ group: "Income", code: h.code, name: h.name, debit: 0, credit: h.amount });
  for (const h of t.expense) rows.push({ group: "Expenditure", code: h.code, name: h.name, debit: h.amount, credit: 0 });
  const totalDebit = round2(rows.reduce((s, r) => s + r.debit, 0));
  const totalCredit = round2(rows.reduce((s, r) => s + r.credit, 0));
  return { rows, totalDebit, totalCredit, balanced: Math.abs(totalDebit - totalCredit) < 0.01 };
}

const ASSET_GROUP: Record<string, string> = { CASH: "Cash in hand", BANK: "Cash at bank", MOBILE_BANKING: "Mobile banking (bKash etc.)" };

export async function balanceSheet(asOf: Date): Promise<BalanceSheetReport> {
  const [balances, t, fund] = await Promise.all([accountBalances({ asOf }), headTotals({ to: asOf }), openingFund()]);
  const surplus = round2(t.totalIncome - t.totalExpense);
  const assets = balances.map(a => ({ name: a.name, group: ASSET_GROUP[a.type] ?? a.type, amount: a.balance }));
  const totalAssets = round2(assets.reduce((s, a) => s + a.amount, 0));
  return {
    assets,
    totalAssets,
    fund: { openingFund: fund, accumulatedSurplus: surplus, total: round2(fund + surplus) },
    balanced: Math.abs(totalAssets - (fund + surplus)) < 0.01,
  };
}

export async function monthlySummary(year: number): Promise<MonthlySummaryReport> {
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
    const m = months[v.date.getUTCMonth()];
    if (v.type === "INCOME") m.income += num(v.amount);
    else m.expense += num(v.amount);
  }
  for (const m of months) {
    m.income = round2(m.income);
    m.expense = round2(m.expense);
    m.net = round2(m.income - m.expense);
  }
  const income = round2(months.reduce((s, m) => s + m.income, 0));
  const expense = round2(months.reduce((s, m) => s + m.expense, 0));
  return { year, months, totals: { income, expense, net: round2(income - expense) } };
}

/** Build any report from the query string. Default period = this month so far. */
export async function buildReport(query: ReportQuery): Promise<ReportResponse> {
  const today = todayUtc();
  const from = query.from ?? new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const to = query.to ?? today;
  if (from > to) throw ApiError.badRequest("The start date must be before the end date.");
  const period = { from: dayString(from), to: dayString(to) };

  switch (query.type) {
    case "income-expenditure":
      return { type: query.type, period, data: await incomeExpenditure(from, to) };
    case "receipts-payments":
      return { type: query.type, period, data: await receiptsPayments(from, to) };
    case "cash-book":
      if (!query.accountId) throw ApiError.badRequest("Choose an account for the cash/bank book.");
      return { type: query.type, period, data: await cashBook(query.accountId, from, to) };
    case "head-ledger":
      if (!query.headId) throw ApiError.badRequest("Choose a ledger head.");
      return { type: query.type, period, data: await headLedger(query.headId, from, to) };
    case "day-book":
      return { type: query.type, period, data: await dayBook(from, to) };
    case "trial-balance":
      return { type: query.type, period: { from: null, to: period.to }, data: await trialBalance(to) };
    case "balance-sheet":
      return { type: query.type, period: { from: null, to: period.to }, data: await balanceSheet(to) };
    case "monthly-summary": {
      const year = query.year && query.year >= 2000 && query.year <= 2100 ? query.year : today.getUTCFullYear();
      return { type: query.type, period: { from: `${year}-01-01`, to: `${year}-12-31` }, data: await monthlySummary(year) };
    }
  }
}
