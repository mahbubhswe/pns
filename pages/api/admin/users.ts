import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createApiHandler } from "@/lib/server/handler";
import { requirePermissions, AdminRequest } from "@/lib/server/rbac";
import { legacyRoleFor } from "@/lib/permissions";
import { safeUser } from "@/lib/server/staff";

const handler = createApiHandler(["GET", "POST"]);

handler.use(requirePermissions({ GET: ["users.view", "users.manage"], POST: "users.manage" }));

handler.get(async (_req: NextApiRequest, res: NextApiResponse) => {
  const users = await prisma.managementUser.findMany({
    orderBy: { id: "desc" },
    include: { roleRef: true },
  });
  return res.status(200).json({ users: users.map(safeUser) });
});

handler.post(async (req: AdminRequest, res: NextApiResponse) => {
  const { photoUrl, name, phone, address, roleId, email, title, password, isActive } = req.body || {};

  const errors: string[] = [];
  if (!name || String(name).trim().length < 2) errors.push("Name is required");
  if (!phone) errors.push("Phone is required");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) errors.push("A valid email is required");
  if (!password || String(password).length < 6) errors.push("Password must be at least 6 characters");
  if (!roleId) errors.push("Choose a role");
  if (errors.length) return res.status(400).json({ ok: false, error: errors.join(". "), errors });

  const role = await prisma.role.findUnique({ where: { id: Number(roleId) } });
  if (!role) return res.status(400).json({ ok: false, error: "Selected role no longer exists" });

  const normalizedEmail = String(email).trim().toLowerCase();
  if (await prisma.managementUser.findUnique({ where: { email: normalizedEmail } }))
    return res.status(409).json({ ok: false, error: "This email is already used by another staff account" });

  const created = await prisma.managementUser.create({
    data: {
      photoUrl: photoUrl || null,
      name: String(name).trim(),
      phone: String(phone).trim(),
      address: address || null,
      email: normalizedEmail,
      title: title || null,
      password: await bcrypt.hash(String(password), 10),
      roleId: role.id,
      role: legacyRoleFor(role.permissions),
      isActive: isActive === undefined ? true : Boolean(isActive),
    },
    include: { roleRef: true },
  });

  return res.status(201).json({ ok: true, user: safeUser(created) });
});

export default handler;
