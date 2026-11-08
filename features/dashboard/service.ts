import { prisma } from "@/lib/prisma";
import { getMembershipStats } from "@/features/membership/service";
import { memberStatusToUi } from "@/lib/shared/membership";
import type { DashboardStats } from "@/types/api";

const monthKey = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const since = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));

  const [membership, adminUsers, postsTotal, postsPublished, joined, recentRows] = await Promise.all([
    getMembershipStats(),
    prisma.managementUser.count(),
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, ownerNameEnglish: true, email: true, sectorNumber: true, plotNumber: true, ownerPhoto: true, status: true, createdAt: true },
    }),
  ]);

  // Registrations per month, last 12 months (oldest first).
  const monthly = Array.from({ length: 12 }, (_, i) => ({
    key: monthKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (11 - i), 1))),
    count: 0,
  }));
  const index = new Map(monthly.map((m, i) => [m.key, i]));
  for (const u of joined) {
    const i = index.get(monthKey(u.createdAt));
    if (i !== undefined) monthly[i].count += 1;
  }

  return {
    ...membership,
    adminUsers,
    postsTotal,
    postsPublished,
    postsDraft: postsTotal - postsPublished,
    monthly,
    recent: recentRows.map(r => ({
      id: r.id,
      ownerNameEnglish: r.ownerNameEnglish,
      email: r.email,
      sectorNumber: r.sectorNumber,
      plotNumber: r.plotNumber,
      ownerPhoto: r.ownerPhoto ?? null,
      status: memberStatusToUi(r.status),
      createdAt: r.createdAt.toISOString(),
    })),
  };
}
