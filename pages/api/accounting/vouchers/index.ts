import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma";
import { createApiHandler } from "@/lib/server/handler";
import { requirePermissions, AdminRequest } from "@/lib/server/rbac";
import { endOfDay, nextVoucherNo, parseDay, voucherInclude, voucherToJson } from "@/lib/server/accounting";
import { validateVoucher } from "@/lib/server/voucher-input";

const handler = createApiHandler(["GET", "POST"]);

handler.use(requirePermissions({ GET: ["accounting.view", "accounting.entry"], POST: "accounting.entry" }));

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const q = req.query;
  const where: Prisma.VoucherWhereInput = {};
  const from = parseDay(q.from);
  const to = parseDay(q.to);
  if (from || to) where.date = { ...(from ? { gte: from } : {}), ...(to ? { lte: endOfDay(to) } : {}) };
  const type = String(q.type || "").toUpperCase();
  if (["INCOME", "EXPENSE", "TRANSFER"].includes(type)) where.type = type as any;
  const status = String(q.status || "").toUpperCase();
  if (status === "POSTED" || status === "VOID") where.status = status;
  if (q.headId) where.headId = Number(q.headId);
  if (q.accountId) {
    const id = Number(q.accountId);
    where.OR = [{ accountId: id }, { toAccountId: id }];
  }
  if (q.memberId) where.memberId = Number(q.memberId);
  const search = String(q.q || "").trim();
  if (search) {
    where.AND = [
      {
        OR: [
          { voucherNo: { contains: search, mode: "insensitive" } },
          { partyName: { contains: search, mode: "insensitive" } },
          { reference: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      },
    ];
  }
  const take = Math.min(Math.max(Number(q.limit) || 1000, 1), 5000);
  const vouchers = await prisma.voucher.findMany({
    where,
    include: voucherInclude,
    orderBy: [{ date: "desc" }, { id: "desc" }],
    take,
  });
  const rows = vouchers.map(voucherToJson);
  const posted = rows.filter(r => r.status === "POSTED");
  const sum = (t: string) => Math.round(posted.filter(r => r.type === t).reduce((s, r) => s + r.amount, 0) * 100) / 100;
  return res.status(200).json({
    vouchers: rows,
    totals: { income: sum("INCOME"), expense: sum("EXPENSE"), transfer: sum("TRANSFER"), count: rows.length },
  });
});

handler.post(async (req: AdminRequest, res: NextApiResponse) => {
  const parsed = await validateVoucher(req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });
  const data = parsed.data;

  // Voucher numbers are sequential per type & year; retry if two people save at the same moment.
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const created = await prisma.$transaction(async tx => {
        const voucherNo = await nextVoucherNo(tx, data.type, data.date);
        return tx.voucher.create({
          data: { ...data, voucherNo, createdById: req.admin!.id },
          include: voucherInclude,
        });
      });
      return res.status(201).json({ ok: true, voucher: voucherToJson(created) });
    } catch (e: any) {
      if (e?.code === "P2002" && attempt < 3) continue;
      throw e;
    }
  }
});

export default handler;
