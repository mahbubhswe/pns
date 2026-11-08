import type { NextApiResponse } from "next";
import type { NextHandler } from "next-connect";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createApiHandler } from "@/lib/server/handler";
import { requirePermissions, AdminRequest, countActiveSuperAdmins } from "@/lib/server/rbac";
import { ALL_ACCESS, legacyPermissions, legacyRoleFor } from "@/lib/permissions";
import { safeUser } from "@/lib/server/staff";

type AdminUserRequest = AdminRequest & { adminUserId?: number };

const handler = createApiHandler(["GET", "PATCH", "DELETE"]);

handler.use(requirePermissions({ GET: ["users.view", "users.manage"], PATCH: "users.manage", DELETE: "users.manage" }));

handler.use((req: AdminUserRequest, res: NextApiResponse, next: NextHandler) => {
  const numericId = Number(req.query.id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  req.adminUserId = numericId;
  return next();
});

handler.get(async (req: AdminUserRequest, res: NextApiResponse) => {
  const user = await prisma.managementUser.findUnique({ where: { id: req.adminUserId! }, include: { roleRef: true } });
  if (!user) return res.status(404).json({ error: "Not found" });
  return res.status(200).json({ user: safeUser(user) });
});

handler.patch(async (req: AdminUserRequest, res: NextApiResponse) => {
  const id = req.adminUserId!;
  const current = await prisma.managementUser.findUnique({ where: { id }, include: { roleRef: true } });
  if (!current) return res.status(404).json({ ok: false, error: "Not found" });

  const { photoUrl, name, phone, address, roleId, email, title, password, isActive } = req.body || {};
  const data: any = {};
  if (photoUrl !== undefined) data.photoUrl = photoUrl || null;
  if (name !== undefined) data.name = String(name).trim();
  if (phone !== undefined) data.phone = String(phone).trim();
  if (address !== undefined) data.address = address || null;
  if (title !== undefined) data.title = title || null;
  if (email !== undefined) {
    const normalized = String(email).trim().toLowerCase();
    if (normalized !== current.email) {
      const taken = await prisma.managementUser.findUnique({ where: { email: normalized } });
      if (taken) return res.status(409).json({ ok: false, error: "This email is already used by another staff account" });
    }
    data.email = normalized;
  }
  if (password) {
    if (String(password).length < 6) return res.status(400).json({ ok: false, error: "Password must be at least 6 characters" });
    data.password = await bcrypt.hash(String(password), 10);
  }

  const isSelf = req.admin?.id === id;
  const currentPerms = current.roleRef ? current.roleRef.permissions : legacyPermissions(current.role);
  let nextPerms = currentPerms;

  if (roleId !== undefined && Number(roleId) !== current.roleId) {
    const role = await prisma.role.findUnique({ where: { id: Number(roleId) } });
    if (!role) return res.status(400).json({ ok: false, error: "Selected role no longer exists" });
    data.roleId = role.id;
    data.role = legacyRoleFor(role.permissions);
    nextPerms = role.permissions;
  }
  if (isActive !== undefined) {
    if (isSelf && !isActive) return res.status(400).json({ ok: false, error: "You can't deactivate your own account." });
    data.isActive = Boolean(isActive);
  }

  // Never leave the portal without an active full-access user.
  const losingFullAccess =
    currentPerms.includes(ALL_ACCESS) && current.isActive && (!nextPerms.includes(ALL_ACCESS) || data.isActive === false);
  if (losingFullAccess && (await countActiveSuperAdmins(id)) < 1) {
    return res.status(400).json({ ok: false, error: "At least one active user must keep full access." });
  }

  const updated = await prisma.managementUser.update({ where: { id }, data, include: { roleRef: true } });
  return res.status(200).json({ ok: true, user: safeUser(updated) });
});

handler.delete(async (req: AdminUserRequest, res: NextApiResponse) => {
  const id = req.adminUserId!;
  if (req.admin?.id === id) return res.status(400).json({ ok: false, error: "You can't delete your own account." });
  const user = await prisma.managementUser.findUnique({
    where: { id },
    include: { roleRef: true, _count: { select: { posts: true } } },
  });
  if (!user) return res.status(404).json({ ok: false, error: "Not found" });
  const perms = user.roleRef ? user.roleRef.permissions : legacyPermissions(user.role);
  if (perms.includes(ALL_ACCESS) && user.isActive && (await countActiveSuperAdmins(id)) < 1)
    return res.status(400).json({ ok: false, error: "At least one active user must keep full access." });
  if (user._count.posts > 0)
    return res.status(409).json({
      ok: false,
      error: `${user.name} has written ${user._count.posts} post(s). Deactivate the account instead so the posts keep their author.`,
    });
  await prisma.managementUser.delete({ where: { id } });
  return res.status(200).json({ ok: true });
});

export default handler;
