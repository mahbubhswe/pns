import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { createApiHandler } from "@/lib/server/handler";
import { requirePermissions, AdminRequest, countActiveSuperAdmins } from "@/lib/server/rbac";
import { ALL_ACCESS, sanitizePermissions } from "@/lib/permissions";

const handler = createApiHandler(["GET", "PATCH", "DELETE"]);

handler.use(requirePermissions({ GET: ["roles.manage", "users.view"], PATCH: "roles.manage", DELETE: "roles.manage" }));

function roleId(req: NextApiRequest) {
  const id = Number(req.query.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const id = roleId(req);
  if (!id) return res.status(400).json({ error: "Invalid id" });
  const role = await prisma.role.findUnique({
    where: { id },
    include: { users: { select: { id: true, name: true, email: true, isActive: true } } },
  });
  if (!role) return res.status(404).json({ error: "Role not found" });
  return res.status(200).json({ role });
});

handler.patch(async (req: AdminRequest, res: NextApiResponse) => {
  const id = roleId(req);
  if (!id) return res.status(400).json({ error: "Invalid id" });
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) return res.status(404).json({ error: "Role not found" });

  const { name, description, permissions } = req.body || {};
  const data: { name?: string; description?: string | null; permissions?: string[] } = {};

  if (name !== undefined) {
    const clean = String(name).trim();
    if (clean.length < 2) return res.status(400).json({ error: "Role name is too short." });
    if (role.isSystem && clean !== role.name) return res.status(400).json({ error: "Built-in roles can't be renamed." });
    if (clean !== role.name && (await prisma.role.findUnique({ where: { name: clean } })))
      return res.status(409).json({ error: "Another role already uses this name." });
    data.name = clean;
  }
  if (description !== undefined) data.description = description ? String(description).trim() : null;
  if (permissions !== undefined) {
    const next = sanitizePermissions(permissions);
    const hadAll = role.permissions.includes(ALL_ACCESS);
    if (hadAll && !next.includes(ALL_ACCESS)) {
      if (role.name === "Super Admin") return res.status(400).json({ error: "Super Admin always keeps full access." });
      // Make sure someone else still holds full access before downgrading this role.
      const holders = await prisma.managementUser.count({ where: { roleId: id, isActive: true } });
      const totalSupers = await countActiveSuperAdmins();
      if (totalSupers - holders < 1)
        return res.status(400).json({ error: "At least one active user must keep full access." });
    }
    data.permissions = next;
  }

  const updated = await prisma.role.update({ where: { id }, data });
  return res.status(200).json({ ok: true, role: updated });
});

handler.delete(async (req: NextApiRequest, res: NextApiResponse) => {
  const id = roleId(req);
  if (!id) return res.status(400).json({ error: "Invalid id" });
  const role = await prisma.role.findUnique({ where: { id }, include: { _count: { select: { users: true } } } });
  if (!role) return res.status(404).json({ error: "Role not found" });
  if (role.isSystem) return res.status(400).json({ error: "Built-in roles can't be deleted." });
  if (role._count.users > 0)
    return res.status(409).json({ error: `Move the ${role._count.users} user(s) on this role to another role first.` });
  await prisma.role.delete({ where: { id } });
  return res.status(200).json({ ok: true });
});

export default handler;
