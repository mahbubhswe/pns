import type { NextApiRequest, NextApiResponse } from "next";
import type { NextHandler } from "next-connect";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ensureAdmin } from "@/lib/server/auth";
import { createApiHandler } from "@/lib/server/handler";

function safeUser(u: any) {
  if (!u) return u;
  const { password: _omit, ...rest } = u;
  return rest;
}

const handler = createApiHandler(["GET", "POST"]);

handler.use((req: NextApiRequest, res: NextApiResponse, next: NextHandler) => {
  if (!ensureAdmin(req, res)) {
    return;
  }
  next();
});

handler.get(async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const users = await prisma.managementUser.findMany({
      orderBy: { id: "desc" },
    });
    return res.status(200).json({ users: users.map(safeUser) });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Failed to load users" });
  }
});

handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const anyPrisma = prisma as any;
    if (!anyPrisma.managementUser) {
      return res.status(500).json({
        ok: false,
        error:
          "ManagementUser model not found in Prisma Client. Run: npx prisma migrate dev && npx prisma generate",
      });
    }

    const { photoUrl, name, phone, address, role, email, title, password } =
      req.body || {};

    const errors: string[] = [];
    if (!name) errors.push("name is required");
    if (!phone) errors.push("phone is required");
    if (!email) errors.push("email is required");
    if (!password) errors.push("password is required");
    if (!role) errors.push("role is required (ADMIN|EDITOR|VIEWER)");
    if (errors.length) return res.status(400).json({ ok: false, errors });

    const normalizedEmail = String(email).trim().toLowerCase();
    const roleUpper = String(role).trim().toUpperCase();
    const allowed = new Set(["ADMIN", "EDITOR", "VIEWER"]);
    if (!allowed.has(roleUpper))
      return res.status(400).json({
        ok: false,
        error: "Invalid role. Use ADMIN, EDITOR or VIEWER.",
      });

    const exists = await prisma.managementUser.findUnique({
      where: { email: normalizedEmail },
    });
    if (exists)
      return res.status(409).json({ ok: false, error: "Email already exists" });

    const hash = await bcrypt.hash(String(password), 10);

    const created = await prisma.managementUser.create({
      data: {
        photoUrl: photoUrl || null,
        name: String(name),
        phone: String(phone),
        address: address || null,
        role: roleUpper as any,
        email: normalizedEmail,
        title: title || null,
        password: hash,
      },
    });

    return res.status(201).json({ ok: true, admin: safeUser(created) });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
});

export default handler;
