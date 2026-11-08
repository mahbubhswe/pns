import type { NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { createApiHandler } from "@/lib/server/handler";
import { requirePermissions, AdminRequest } from "@/lib/server/rbac";
import { voucherInclude, voucherToJson } from "@/lib/server/accounting";

const handler = createApiHandler(["POST"]);

handler.use(requirePermissions("accounting.void"));

// Vouchers are never deleted: voiding keeps the number in sequence and leaves an audit trail.
handler.post(async (req: AdminRequest, res: NextApiResponse) => {
  const id = Number(req.query.id);
  const reason = String(req.body?.reason || "").trim();
  if (reason.length < 3) return res.status(400).json({ error: "Please write why this voucher is being voided." });
  const v = await prisma.voucher.findUnique({ where: { id } });
  if (!v) return res.status(404).json({ error: "Voucher not found" });
  if (v.status === "VOID") return res.status(400).json({ error: "This voucher is already void." });
  const updated = await prisma.voucher.update({
    where: { id },
    data: { status: "VOID", voidReason: reason.slice(0, 500), voidedAt: new Date(), voidedById: req.admin!.id },
    include: voucherInclude,
  });
  return res.status(200).json({ ok: true, voucher: voucherToJson(updated) });
});

export default handler;
