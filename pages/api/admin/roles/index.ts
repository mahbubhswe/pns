import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { createApiHandler } from "@/lib/server/handler";
import { requirePermissions } from "@/lib/server/rbac";
import { sanitizePermissions } from "@/lib/permissions";

const handler = createApiHandler(["GET", "POST"]);

handler.use(requirePermissions({ GET: ["roles.manage", "users.view", "users.manage"], POST: "roles.manage" }));

handler.get(async (_req: NextApiRequest, res: NextApiResponse) => {
  const roles = await prisma.role.findMany({
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    include: { _count: { select: { users: true } } },
  });
  return res.status(200).json({
    roles: roles.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      permissions: r.permissions,
      isSystem: r.isSystem,
      userCount: r._count.users,
      updatedAt: r.updatedAt,
    })),
  });
});

handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
  const { name, description, permissions } = req.body || {};
  const cleanName = String(name || "").trim();
  if (cleanName.length < 2) return res.status(400).json({ error: "Give the role a name (at least 2 characters)." });
  const exists = await prisma.role.findUnique({ where: { name: cleanName } });
  if (exists) return res.status(409).json({ error: "A role with this name already exists." });
  const created = await prisma.role.create({
    data: {
      name: cleanName,
      description: description ? String(description).trim() : null,
      permissions: sanitizePermissions(permissions),
    },
  });
  return res.status(201).json({ ok: true, role: created });
});

export default handler;
