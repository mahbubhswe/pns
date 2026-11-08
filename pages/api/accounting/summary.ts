import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { createApiHandler } from "@/lib/server/handler";
import { requirePermissions } from "@/lib/server/rbac";
import { accountBalances, endOfDay, headTotals, num, todayUtc, voucherInclude, voucherToJson } from "@/lib/server/accounting";

const handler = createApiHandler(["GET"]);

handler.use(requirePermissions(["accounting.view", "accounting.reports"]));

handler.get(async (_req: NextApiRequest, res: NextApiResponse) => {
  const today = todayUtc();
  const y = today.getUTCFullYear();
  const m = today.getUTCMonth();
  const monthStart = new Date(Date.UTC(y, m, 1));
  const yearStart = new Date(Date.UTC(y, 0, 1));
  const trendStart = new Date(Date.UTC(y, m - 11, 1));

  const [balances, month, year, recent, trendRows, pendingFees] = await Promise.all([
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

  const trend = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 11 + i, 1));
    return {
      key: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
      income: 0,
      expense: 0,
    };
  });
  const idx = new Map(trend.map((t, i) => [t.key, i]));
  for (const r of trendRows) {
    const d = new Date(r.date);
    const i = idx.get(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
    if (i === undefined) continue;
    if (r.type === "INCOME") trend[i].income += num(r.amount);
    else trend[i].expense += num(r.amount);
  }

  const totalBalance = Math.round(balances.reduce((s, a) => s + a.balance, 0) * 100) / 100;

  return res.status(200).json({
    asOf: today.toISOString().slice(0, 10),
    totalBalance,
    balances,
    month: { income: month.totalIncome, expense: month.totalExpense, net: Math.round((month.totalIncome - month.totalExpense) * 100) / 100 },
    year: {
      income: year.totalIncome,
      expense: year.totalExpense,
      net: Math.round((year.totalIncome - year.totalExpense) * 100) / 100,
      topExpenses: [...year.expense].sort((a, b) => b.amount - a.amount).slice(0, 5),
      topIncome: [...year.income].sort((a, b) => b.amount - a.amount).slice(0, 5),
    },
    trend: trend.map(t => ({ ...t, income: Math.round(t.income), expense: Math.round(t.expense) })),
    recent: recent.map(voucherToJson),
    approvedMembersWithoutFeeEntry: pendingFees,
  });
});

export default handler;
