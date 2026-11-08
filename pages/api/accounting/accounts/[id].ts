import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { createApiHandler } from "@/lib/server/handler";
import { requirePermissions } from "@/lib/server/rbac";
import { num } from "@/lib/server/accounting";

const TYPES = new Set(["CASH", "BANK", "MOBILE_BANKING"]);

const handler = createApiHandler(["PATCH", "DELETE"]);

handler.use(requirePermissions("accounting.setup"));

handler.patch(async (req: NextApiRequest, res: NextApiResponse) => {
  const id = Number(req.query.id);
  const account = await prisma.fundAccount.findUnique({ where: { id } });
  if (!account) return res.status(404).json({ error: "Account not found" });
  const { name, type, accountNumber, institution, branch, openingBalance, notes, isActive } = req.body || {};
  const data: any = {};
  if (name !== undefined) {
    const clean = String(name).trim();
    if (clean.length < 2) return res.status(400).json({ error: "Account name is too short." });
    if (clean !== account.name && (await prisma.fundAccount.findUnique({ where: { name: clean } })))
      return res.status(409).json({ error: "Another account already uses this name." });
    data.name = clean;
  }
  if (type !== undefined) {
    if (!TYPES.has(String(type))) return res.status(400).json({ error: "Invalid account type." });
    data.type = type;
  }
  if (accountNumber !== undefined) data.accountNumber = accountNumber ? String(accountNumber).trim() : null;
  if (institution !== undefined) data.institution = institution ? String(institution).trim() : null;
  if (branch !== undefined) data.branch = branch ? String(branch).trim() : null;
  if (notes !== undefined) data.notes = notes ? String(notes).trim() : null;
  if (openingBalance !== undefined) data.openingBalance = num(openingBalance);
  if (isActive !== undefined) data.isActive = Boolean(isActive);
  const updated = await prisma.fundAccount.update({ where: { id }, data });
  return res.status(200).json({ ok: true, account: { ...updated, openingBalance: num(updated.openingBalance) } });
});

handler.delete(async (req: NextApiRequest, res: NextApiResponse) => {
  const id = Number(req.query.id);
  const used = await prisma.voucher.count({ where: { OR: [{ accountId: id }, { toAccountId: id }] } });
  if (used > 0)
    return res.status(409).json({ error: `This account appears on ${used} voucher(s). Mark it inactive instead of deleting.` });
  await prisma.fundAccount.delete({ where: { id } });
  return res.status(200).json({ ok: true });
});

export default handler;
