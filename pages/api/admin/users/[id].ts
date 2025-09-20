import type { NextApiRequest, NextApiResponse } from "next";
import type { NextHandler } from "next-connect";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ensureAdmin } from "@/lib/server/auth";
import { createApiHandler } from "@/lib/server/handler";

type AdminUserRequest = NextApiRequest & { adminUserId?: number };

function safeUser(u: any) {
  if (!u) return u;
  const { password: _omit, ...rest } = u;
  return rest;
}

const handler = createApiHandler(["GET", "PATCH", "DELETE"]);

handler.use((req: AdminUserRequest, res: NextApiResponse, next: NextHandler) => {
  if (!ensureAdmin(req, res)) {
    return;
  }
  next();
});

handler.use((req: AdminUserRequest, res: NextApiResponse, next: NextHandler) => {
  const { id } = req.query;
  if (typeof id !== "string") {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  req.adminUserId = numericId;
  next();
});

handler.get(async (req: AdminUserRequest, res: NextApiResponse) => {
  try {
    const user = await prisma.managementUser.findUnique({ where: { id: req.adminUserId! } });
    if (!user) return res.status(404).json({ error: "Not found" });
    return res.status(200).json({ user: safeUser(user) });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Failed to load" });
  }
});

handler.patch(async (req: AdminUserRequest, res: NextApiResponse) => {
  try {
    const { photoUrl, name, phone, address, role, email, title, password } = req.body || {};
    const data: any = {};
    if (photoUrl !== undefined) data.photoUrl = photoUrl || null;
    if (name !== undefined) data.name = String(name);
    if (phone !== undefined) data.phone = String(phone);
    if (address !== undefined) data.address = address || null;
    if (title !== undefined) data.title = title || null;
    if (email !== undefined) data.email = String(email).trim().toLowerCase();
    if (role !== undefined) {
      const allowed = new Set(["ADMIN", "EDITOR", "VIEWER"]);
      const roleUpper = String(role).trim().toUpperCase();
      if (!allowed.has(roleUpper))
        return res.status(400).json({ ok: false, error: "Invalid role" });
      data.role = roleUpper as any;
    }
    if (password) data.password = await bcrypt.hash(String(password), 10);

    const updated = await prisma.managementUser.update({ where: { id: req.adminUserId! }, data });
    return res.status(200).json({ ok: true, user: safeUser(updated) });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "Failed to update" });
  }
});

handler.delete(async (req: AdminUserRequest, res: NextApiResponse) => {
  try {
    await prisma.managementUser.delete({ where: { id: req.adminUserId! } });
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "Failed to delete" });
  }
});

export default handler;
