import { prisma } from "@/lib/prisma";
import { getMembershipStats } from "@/features/membership/service";
import type { DashboardStats } from "@/types/api";

export async function getDashboardStats(): Promise<DashboardStats> {
  const [membership, adminUsers, postsTotal, postsPublished] = await Promise.all([
    getMembershipStats(),
    prisma.managementUser.count(),
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
  ]);

  return {
    ...membership,
    adminUsers,
    postsTotal,
    postsPublished,
    postsDraft: postsTotal - postsPublished,
  };
}
