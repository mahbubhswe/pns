import type { NextApiRequest, NextApiResponse } from "next";
import type { NextHandler } from "next-connect";
import { prisma } from "@/lib/prisma";
import { ensureAdmin } from "@/lib/server/auth";
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
};

const handler = createApiHandler(["GET"]);

handler.use((req: NextApiRequest, res: NextApiResponse, next: NextHandler) => {
  if (!ensureAdmin(req, res)) {
    return;
  }
  next();
});

handler.get(async (_req: NextApiRequest, res: NextApiResponse<Resp>) => {
  const users = await prisma.user.findMany({ select: { status: true } });
  const total = users.length;
  const active = users.filter(u => (u as any).status === "active").length;
  const pending = users.filter(u => (u as any).status === "pending").length;
  const inactive = users.filter(u => (u as any).status === "inactive").length;
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
  });
});

export default handler;
