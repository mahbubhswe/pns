import type { NextApiRequest, NextApiResponse } from "next";
import type { NextHandler } from "next-connect";
import { prisma } from "@/lib/prisma";
import { ensureAdmin } from "@/lib/server/auth";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { createApiHandler } from "@/lib/server/handler";

type UiMember = {
  id: string;
  sectorNumber: string;
  roadNumber: string;
  plotNumber: string;
  plotSize: string;
  ownershipProofType: string;
  ownershipProofFile?: string | null;
  ownerNameEnglish: string;
  ownerNameBangla: string;
  contactNumber: string;
  nidNumber: string;
  presentAddress: string;
  permanentAddress: string;
  email: string;
  ownerPhoto?: string | null;
  paymentMethod: string;
  bkashTransactionId?: string | null;
  bkashAccountNumber?: string | null;
  bankAccountNumberFrom?: string | null;
  paymentReceipt?: string | null;
  membershipFee: number;
  agreeDataUse: boolean;
  status: "active" | "pending" | "inactive";
  joinedAt: string;
  updatedAt: string;
};

function mapUserToUi(m: any): UiMember {
  const toUiStatus: Record<string, UiMember["status"]> = {
    APPROVED: "active",
    PENDING: "pending",
    REJECTED: "inactive",
  };
  const createdAt =
    m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt;
  const updatedAt =
    m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt;
  return {
    id: String(m.id),
    sectorNumber: m.sectorNumber,
    roadNumber: m.roadNumber,
    plotNumber: m.plotNumber,
    plotSize: m.plotSize,
    ownershipProofType: m.ownershipProofType,
    ownershipProofFile: m.ownershipProofFile ?? null,
    ownerNameEnglish: m.ownerNameEnglish,
    ownerNameBangla: m.ownerNameBangla,
    contactNumber: m.contactNumber,
    nidNumber: m.nidNumber,
    presentAddress: m.presentAddress,
    permanentAddress: m.permanentAddress,
    email: m.email,
    ownerPhoto: m.ownerPhoto ?? null,
    paymentMethod: m.paymentMethod,
    bkashTransactionId: m.bkashTransactionId ?? null,
    bkashAccountNumber: m.bkashAccountNumber ?? null,
    bankAccountNumberFrom: m.bankAccountNumberFrom ?? null,
    paymentReceipt: m.paymentReceipt ?? null,
    membershipFee: m.membershipFee,
    agreeDataUse: Boolean(m.agreeDataUse),
    status: toUiStatus[String(m.status)] || "pending",
    joinedAt: createdAt || new Date().toISOString(),
    updatedAt: updatedAt || new Date().toISOString(),
  };
}

function parseDateParam(value: string | string[] | undefined): Date | null {
  if (!value) return null;
  const str = Array.isArray(value) ? value[0] : value;
  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const handler = createApiHandler(["GET", "POST"]);

handler.use((req: NextApiRequest, res: NextApiResponse, next: NextHandler) => {
  if (!ensureAdmin(req, res)) {
    return;
  }
  next();
});

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const startDate = parseDateParam(req.query.start);
  const endDateRaw = parseDateParam(req.query.end);
  const createdAtFilter: { gte?: Date; lte?: Date } = {};
  if (startDate) {
    createdAtFilter.gte = startDate;
  }
  if (endDateRaw) {
    const endDate = new Date(endDateRaw);
    endDate.setHours(23, 59, 59, 999);
    createdAtFilter.lte = endDate;
  }

  const where =
    Object.keys(createdAtFilter).length > 0
      ? { createdAt: createdAtFilter }
      : undefined;

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  const members: UiMember[] = users.map(mapUserToUi);
  return res.status(200).json({ members });
});

handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const body = req.body;
    const rows: Array<any> = Array.isArray(body) ? body : [body];
    const created = [] as any[];
    const fromUiStatus: Record<string, any> = {
      active: "APPROVED",
      pending: "PENDING",
      inactive: "REJECTED",
    };
    for (const r of rows) {
      const email = (r.email && String(r.email).trim()) || `imported+${randomUUID()}@example.com`;
      const password = await bcrypt.hash(randomUUID(), 8);
      const user = await prisma.user.create({
        data: {
          sectorNumber: "NA",
          roadNumber: "NA",
          plotNumber: "NA",
          plotSize: "NA",
          ownershipProofType: "LD_TAX_RECEIPT",
          ownerNameEnglish: String(r.name || "Unnamed"),
          ownerNameBangla: String(r.name || "Unnamed"),
          contactNumber: String(r.phone || ""),
          nidNumber: "NA",
          presentAddress: "NA",
          permanentAddress: "NA",
          email,
          password,
          paymentMethod: "BKASH",
          membershipFee: 1020,
          agreeDataUse: false,
          status: fromUiStatus[String(r.status || "active")] || "APPROVED",
          createdAt: r.joinedAt ? new Date(r.joinedAt) : undefined,
        },
      });
      created.push(user);
    }
    return res.status(200).json({ ok: true, count: created.length });
  } catch (e: any) {
    return res.status(400).json({ ok: false, error: e?.message || "Invalid payload" });
  }
});

export default handler;
