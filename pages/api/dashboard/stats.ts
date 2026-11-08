import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requirePermissions } from "@/lib/server/rbac";
import { createApiHandler } from "@/lib/server/handler";

type Resp = {
  total: number;
  active: number;
  pending: number;
  inactive: number;
  byType: Record<string, number>;
  adminUsers: number;
  postsTotal: number;
  postsPublished: number;
  postsDraft: number;
  monthly: Array<{ key: string; count: number }>;
  recent: Array<any>;
};

const handler = createApiHandler(["GET"]);

handler.use(requirePermissions("dashboard.view"));

handler.get(async (_req: NextApiRequest, res: NextApiResponse<Resp>) => {
  const users = await prisma.user.findMany({ select: { status: true, createdAt: true } });
  const total = users.length;
  // DB stores the enum (APPROVED/PENDING/REJECTED); the UI calls them active/pending/inactive.
  const active = users.filter(u => u.status === "APPROVED").length;
  const pending = users.filter(u => u.status === "PENDING").length;
  const inactive = users.filter(u => u.status === "REJECTED").length;

  // Registrations per month for the last 12 months
  const now = new Date();
  const monthly = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (11 - i), 1));
    return { key: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`, count: 0 };
  });
  const index = new Map(monthly.map((m, i) => [m.key, i]));
  for (const u of users) {
    const d = new Date(u.createdAt);
    const k = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const i = index.get(k);
    if (i !== undefined) monthly[i].count += 1;
  }
  const recentRows = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { id: true, ownerNameEnglish: true, email: true, sectorNumber: true, plotNumber: true, status: true, createdAt: true, ownerPhoto: true },
  });
  const recent = recentRows.map(r => ({
    ...r,
    status: r.status === "APPROVED" ? "active" : r.status === "REJECTED" ? "inactive" : "pending",
  }));
  const byType: Record<string, number> = { standard: total };

  const adminUsers = await prisma.managementUser.count();

  const postsTotal = await prisma.post.count();
  const postsPublished = await prisma.post.count({ where: { published: true } });
  const postsDraft = postsTotal - postsPublished;

  res.status(200).json({
    total,
    active,
    pending,
    inactive,
    byType,
    adminUsers,
    postsTotal,
    postsPublished,
    postsDraft,
    monthly,
    recent,
  });
});

export default handler;
