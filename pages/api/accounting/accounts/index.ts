import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { createApiHandler } from "@/lib/server/handler";
import { requirePermissions } from "@/lib/server/rbac";
import { accountBalances, num } from "@/lib/server/accounting";

const TYPES = new Set(["CASH", "BANK", "MOBILE_BANKING"]);

const handler = createApiHandler(["GET", "POST"]);

handler.use(requirePermissions({ GET: ["accounting.view", "accounting.entry", "accounting.setup", "accounting.reports"], POST: "accounting.setup" }));

handler.get(async (_req: NextApiRequest, res: NextApiResponse) => {
  const [balances, counts] = await Promise.all([
    accountBalances(),
    prisma.voucher.groupBy({ by: ["accountId"], _count: { _all: true } }),
  ]);
  const used = new Map(counts.map(c => [c.accountId, c._count._all]));
  const meta = await prisma.fundAccount.findMany({ select: { id: true, branch: true, notes: true } });
  const metaById = new Map(meta.map(m => [m.id, m]));
  return res.status(200).json({
    accounts: balances.map(b => ({ ...b, ...metaById.get(b.id), voucherCount: used.get(b.id) || 0 })),
  });
});

handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
  const { name, type, accountNumber, institution, branch, openingBalance, notes } = req.body || {};
  const clean = String(name || "").trim();
  if (clean.length < 2) return res.status(400).json({ error: "Give the account a name." });
  if (!TYPES.has(String(type))) return res.status(400).json({ error: "Choose an account type." });
  if (await prisma.fundAccount.findUnique({ where: { name: clean } }))
    return res.status(409).json({ error: "An account with this name already exists." });
  const created = await prisma.fundAccount.create({
    data: {
      name: clean,
      type: type as any,
      accountNumber: accountNumber ? String(accountNumber).trim() : null,
      institution: institution ? String(institution).trim() : null,
      branch: branch ? String(branch).trim() : null,
      openingBalance: num(openingBalance),
      notes: notes ? String(notes).trim() : null,
    },
  });
  return res.status(201).json({ ok: true, account: { ...created, openingBalance: num(created.openingBalance) } });
});

export default handler;
