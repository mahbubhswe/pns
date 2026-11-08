import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { createApiHandler } from "@/lib/server/handler";
import { requirePermissions } from "@/lib/server/rbac";
import { voucherInclude, voucherToJson, VoucherKind } from "@/lib/server/accounting";
import { validateVoucher } from "@/lib/server/voucher-input";

const handler = createApiHandler(["GET", "PATCH"]);

handler.use(requirePermissions({ GET: ["accounting.view", "accounting.entry"], PATCH: "accounting.entry" }));

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const v = await prisma.voucher.findUnique({ where: { id: Number(req.query.id) }, include: voucherInclude });
  if (!v) return res.status(404).json({ error: "Voucher not found" });
  return res.status(200).json({ voucher: voucherToJson(v) });
});

handler.patch(async (req: NextApiRequest, res: NextApiResponse) => {
  const id = Number(req.query.id);
  const existing = await prisma.voucher.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Voucher not found" });
  if (existing.status === "VOID") return res.status(400).json({ error: "A voided voucher can't be edited." });

  // The voucher number carries the type (RV/PV/CV) so the type stays fixed.
  const parsed = await validateVoucher(req.body, existing.type as VoucherKind);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });
  if (parsed.data.date.getUTCFullYear() !== existing.date.getUTCFullYear())
    return res.status(400).json({ error: "Moving a voucher to another year isn't allowed — void it and record a new one." });

  const updated = await prisma.voucher.update({ where: { id }, data: parsed.data, include: voucherInclude });
  return res.status(200).json({ ok: true, voucher: voucherToJson(updated) });
});

export default handler;
