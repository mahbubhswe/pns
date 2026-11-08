import type { NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { createApiHandler } from "@/lib/server/handler";
import { requirePermissions, AdminRequest } from "@/lib/server/rbac";
import { dayString, nextVoucherNo } from "@/lib/server/accounting";

const handler = createApiHandler(["GET", "POST"]);

handler.use(requirePermissions("accounting.entry"));

async function pendingMembers() {
  return prisma.user.findMany({
    where: { status: "APPROVED", vouchers: { none: {} } },
    select: {
      id: true,
      ownerNameEnglish: true,
      sectorNumber: true,
      roadNumber: true,
      plotNumber: true,
      paymentMethod: true,
      membershipFee: true,
      bkashTransactionId: true,
      bankAccountNumberFrom: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

// Preview: approved members whose fee hasn't been entered in the books yet.
handler.get(async (_req: AdminRequest, res: NextApiResponse) => {
  const members = await pendingMembers();
  const total = members.reduce((s, m) => s + (m.membershipFee || 0), 0);
  return res.status(200).json({
    count: members.length,
    total,
    byMethod: {
      BKASH: members.filter(m => m.paymentMethod === "BKASH").length,
      BANK: members.filter(m => m.paymentMethod === "BANK").length,
    },
  });
});

// Creates one receipt voucher per approved member under the "Membership Fee" head.
handler.post(async (req: AdminRequest, res: NextApiResponse) => {
  const { bkashAccountId, bankAccountId, headId } = req.body || {};
  const head = headId
    ? await prisma.ledgerHead.findUnique({ where: { id: Number(headId) } })
    : await prisma.ledgerHead.findFirst({ where: { type: "INCOME", name: "Membership Fee" } });
  if (!head || head.type !== "INCOME") return res.status(400).json({ error: "Choose the income head for membership fees." });
  const bkash = await prisma.fundAccount.findUnique({ where: { id: Number(bkashAccountId) || 0 } });
  const bank = await prisma.fundAccount.findUnique({ where: { id: Number(bankAccountId) || 0 } });

  const members = await pendingMembers();
  let created = 0;
  const skipped: string[] = [];
  for (const m of members) {
    const account = m.paymentMethod === "BANK" ? bank : bkash;
    if (!account) {
      skipped.push(m.ownerNameEnglish);
      continue;
    }
    const date = new Date(`${dayString(m.createdAt)}T00:00:00.000Z`);
    await prisma.$transaction(async tx => {
      const voucherNo = await nextVoucherNo(tx, "INCOME", date);
      await tx.voucher.create({
        data: {
          voucherNo,
          type: "INCOME",
          date,
          amount: m.membershipFee || 0,
          headId: head.id,
          accountId: account.id,
          partyName: m.ownerNameEnglish,
          reference: m.bkashTransactionId || m.bankAccountNumberFrom || null,
          description: `Membership fee — Sector ${m.sectorNumber}, Road ${m.roadNumber}, Plot ${m.plotNumber}`,
          memberId: m.id,
          createdById: req.admin!.id,
        },
      });
    });
    created++;
  }
  return res.status(200).json({ ok: true, created, skipped: skipped.length });
});

export default handler;
