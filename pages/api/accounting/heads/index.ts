import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { createApiHandler } from "@/lib/server/handler";
import { requirePermissions } from "@/lib/server/rbac";
import { num } from "@/lib/server/accounting";

const handler = createApiHandler(["GET", "POST"]);

handler.use(requirePermissions({ GET: ["accounting.view", "accounting.entry", "accounting.setup", "accounting.reports"], POST: "accounting.setup" }));

handler.get(async (_req: NextApiRequest, res: NextApiResponse) => {
  const [heads, sums] = await Promise.all([
    prisma.ledgerHead.findMany({ orderBy: [{ type: "asc" }, { code: "asc" }, { name: "asc" }] }),
    prisma.voucher.groupBy({ by: ["headId"], where: { status: "POSTED" }, _sum: { amount: true }, _count: { _all: true } }),
  ]);
  const byHead = new Map(sums.map(s => [s.headId, s]));
  return res.status(200).json({
    heads: heads.map(h => ({
      ...h,
      voucherCount: byHead.get(h.id)?._count._all || 0,
      total: num(byHead.get(h.id)?._sum.amount),
    })),
  });
});

handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
  const { name, code, type, description } = req.body || {};
  const clean = String(name || "").trim();
  if (clean.length < 2) return res.status(400).json({ error: "Give the head a name." });
  if (type !== "INCOME" && type !== "EXPENSE") return res.status(400).json({ error: "Choose Income or Expense." });
  const cleanCode = code ? String(code).trim().toUpperCase() : null;
  if (await prisma.ledgerHead.findFirst({ where: { type, name: clean } }))
    return res.status(409).json({ error: `An ${type.toLowerCase()} head with this name already exists.` });
  if (cleanCode && (await prisma.ledgerHead.findUnique({ where: { code: cleanCode } })))
    return res.status(409).json({ error: "This code is already used." });
  const created = await prisma.ledgerHead.create({
    data: { name: clean, code: cleanCode, type, description: description ? String(description).trim() : null },
  });
  return res.status(201).json({ ok: true, head: created });
});

export default handler;
