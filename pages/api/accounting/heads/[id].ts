import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { createApiHandler } from "@/lib/server/handler";
import { requirePermissions } from "@/lib/server/rbac";

const handler = createApiHandler(["PATCH", "DELETE"]);

handler.use(requirePermissions("accounting.setup"));

handler.patch(async (req: NextApiRequest, res: NextApiResponse) => {
  const id = Number(req.query.id);
  const head = await prisma.ledgerHead.findUnique({ where: { id } });
  if (!head) return res.status(404).json({ error: "Head not found" });
  const { name, code, description, isActive } = req.body || {};
  const data: any = {};
  if (name !== undefined) {
    const clean = String(name).trim();
    if (clean.length < 2) return res.status(400).json({ error: "Name is too short." });
    if (clean !== head.name && (await prisma.ledgerHead.findFirst({ where: { type: head.type, name: clean } })))
      return res.status(409).json({ error: "Another head already uses this name." });
    data.name = clean;
  }
  if (code !== undefined) {
    const clean = code ? String(code).trim().toUpperCase() : null;
    if (clean && clean !== head.code && (await prisma.ledgerHead.findUnique({ where: { code: clean } })))
      return res.status(409).json({ error: "This code is already used." });
    data.code = clean;
  }
  if (description !== undefined) data.description = description ? String(description).trim() : null;
  if (isActive !== undefined) data.isActive = Boolean(isActive);
  const updated = await prisma.ledgerHead.update({ where: { id }, data });
  return res.status(200).json({ ok: true, head: updated });
});

handler.delete(async (req: NextApiRequest, res: NextApiResponse) => {
  const id = Number(req.query.id);
  const head = await prisma.ledgerHead.findUnique({ where: { id } });
  if (!head) return res.status(404).json({ error: "Head not found" });
  if (head.isSystem) return res.status(400).json({ error: "This built-in head can't be deleted." });
  const used = await prisma.voucher.count({ where: { headId: id } });
  if (used > 0)
    return res.status(409).json({ error: `This head is used on ${used} voucher(s). Mark it inactive instead.` });
  await prisma.ledgerHead.delete({ where: { id } });
  return res.status(200).json({ ok: true });
});

export default handler;
