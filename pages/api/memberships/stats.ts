import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requirePermissions } from "@/lib/server/rbac";
import { createApiHandler } from "@/lib/server/handler";

const handler = createApiHandler(["GET"]);

handler.use(requirePermissions("members.view"));

handler.get(async (_req: NextApiRequest, res: NextApiResponse) => {
  const users = await prisma.user.findMany({ select: { status: true } });
  const total = users.length;
  const active = users.filter(u => (u as any).status === "APPROVED").length;
  const pending = users.filter(u => (u as any).status === "PENDING").length;
  const inactive = users.filter(u => (u as any).status === "REJECTED").length;
  const byType: Record<string, number> = { standard: total };
  res.status(200).json({ total, active, pending, inactive, byType });
});

export default handler;
