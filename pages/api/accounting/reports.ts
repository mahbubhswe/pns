import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/server/handler";
import { requirePermissions } from "@/lib/server/rbac";
import {
  balanceSheet,
  cashBook,
  dayBook,
  headLedger,
  incomeExpenditure,
  monthlySummary,
  parseDay,
  receiptsPayments,
  REPORT_TYPES,
  ReportType,
  todayUtc,
  trialBalance,
} from "@/lib/server/accounting";

const handler = createApiHandler(["GET"]);

handler.use(requirePermissions("accounting.reports"));

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const type = String(req.query.type || "") as ReportType;
  if (!REPORT_TYPES.includes(type)) return res.status(400).json({ error: "Unknown report type" });

  const today = todayUtc();
  const from = parseDay(req.query.from) || new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const to = parseDay(req.query.to) || today;
  if (from > to) return res.status(400).json({ error: "The start date must be before the end date." });
  const period = { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };

  try {
    switch (type) {
      case "income-expenditure":
        return res.status(200).json({ type, period, data: await incomeExpenditure(from, to) });
      case "receipts-payments":
        return res.status(200).json({ type, period, data: await receiptsPayments(from, to) });
      case "cash-book": {
        const accountId = Number(req.query.accountId);
        if (!accountId) return res.status(400).json({ error: "Choose an account for the cash/bank book." });
        return res.status(200).json({ type, period, data: await cashBook(accountId, from, to) });
      }
      case "head-ledger": {
        const headId = Number(req.query.headId);
        if (!headId) return res.status(400).json({ error: "Choose a ledger head." });
        return res.status(200).json({ type, period, data: await headLedger(headId, from, to) });
      }
      case "day-book":
        return res.status(200).json({ type, period, data: await dayBook(from, to) });
      case "trial-balance":
        return res.status(200).json({ type, period: { from: null, to: period.to }, data: await trialBalance(to) });
      case "balance-sheet":
        return res.status(200).json({ type, period: { from: null, to: period.to }, data: await balanceSheet(to) });
      case "monthly-summary": {
        const year = Number(req.query.year) || today.getUTCFullYear();
        return res.status(200).json({ type, period: { from: `${year}-01-01`, to: `${year}-12-31` }, data: await monthlySummary(year) });
      }
    }
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || "Could not build the report" });
  }
});

export default handler;
