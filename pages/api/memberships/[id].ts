import type { NextApiRequest, NextApiResponse } from "next";
import type { NextHandler } from "next-connect";
import { prisma } from "@/lib/prisma";
import { ensureAdmin } from "@/lib/server/auth";
import { createApiHandler } from "@/lib/server/handler";

type MemberRequest = NextApiRequest & { memberId?: number };

function mapUserFull(m: any) {
  return {
    id: m.id,
    sectorNumber: m.sectorNumber,
    roadNumber: m.roadNumber,
    plotNumber: m.plotNumber,
    plotSize: m.plotSize,
    ownershipProofType: m.ownershipProofType,
    ownershipProofFile: m.ownershipProofFile,
    ownerNameEnglish: m.ownerNameEnglish,
    ownerNameBangla: m.ownerNameBangla,
    contactNumber: m.contactNumber,
    nidNumber: m.nidNumber,
    presentAddress: m.presentAddress,
    permanentAddress: m.permanentAddress,
    email: m.email,
    ownerPhoto: m.ownerPhoto,
    paymentMethod: m.paymentMethod,
    bkashTransactionId: m.bkashTransactionId,
    bkashAccountNumber: m.bkashAccountNumber,
    bankAccountNumberFrom: m.bankAccountNumberFrom,
    paymentReceipt: m.paymentReceipt,
    membershipFee: m.membershipFee,
    agreeDataUse: m.agreeDataUse,
    status: m.status,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}

const handler = createApiHandler(["GET", "PATCH", "DELETE"]);

handler.use((req: MemberRequest, res: NextApiResponse, next: NextHandler) => {
  if (!ensureAdmin(req, res)) {
    return;
  }
  next();
});

handler.use((req: MemberRequest, res: NextApiResponse, next: NextHandler) => {
  const { id } = req.query;
  if (typeof id !== "string") {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  req.memberId = numericId;
  next();
});

handler.get(async (req: MemberRequest, res: NextApiResponse) => {
  const user = await prisma.user.findUnique({ where: { id: req.memberId! } });
  if (!user) return res.status(404).json({ error: "Not found" });
  return res.status(200).json({ member: mapUserFull(user) });
});

handler.patch(async (req: MemberRequest, res: NextApiResponse) => {
  try {
    const { status } = req.body as { status?: string };
    const allowed = new Set(["active", "pending", "inactive"]);
    if (!status || !allowed.has(String(status))) {
      return res.status(400).json({ ok: false, error: "Invalid status" });
    }
    const mapFromUiToDb: Record<string, any> = {
      active: "APPROVED",
      pending: "PENDING",
      inactive: "REJECTED",
    };
    const updated = await prisma.user.update({
      where: { id: req.memberId! },
      data: { status: mapFromUiToDb[String(status)] },
    });
    return res.status(200).json({ ok: true, member: mapUserFull(updated) });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "Failed to update" });
  }
});

handler.delete(async (req: MemberRequest, res: NextApiResponse) => {
  try {
    await prisma.$transaction([
      prisma.post.deleteMany({ where: { authorId: req.memberId! } }),
      prisma.user.delete({ where: { id: req.memberId! } }),
    ]);
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "Failed to delete" });
  }
});

export default handler;
