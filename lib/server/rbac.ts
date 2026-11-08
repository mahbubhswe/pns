// lib/server/rbac.ts — load the signed-in staff user and enforce role permissions.
import type { NextApiRequest, NextApiResponse } from "next";
import type { NextHandler } from "next-connect";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { getCookie, AdminJwt } from "@/lib/server/auth";
import { hasPermission, legacyPermissions, Permission, ALL_ACCESS } from "@/lib/permissions";

export type AdminContext = {
  id: number;
  name: string;
  email: string;
  title: string | null;
  photoUrl: string | null;
  roleId: number | null;
  roleName: string;
  permissions: string[];
};

export type AdminRequest = NextApiRequest & { admin?: AdminContext };

export async function loadAdmin(req: NextApiRequest): Promise<AdminContext | null> {
  const token = getCookie(req, "admin_token");
  if (!token) return null;
  let payload: AdminJwt;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as unknown as AdminJwt;
  } catch {
    return null;
  }
  const id = Number(payload?.sub);
  if (!id) return null;
  const user = await prisma.managementUser.findUnique({ where: { id }, include: { roleRef: true } });
  if (!user || user.isActive === false) return null;
  const permissions = user.roleRef ? user.roleRef.permissions : legacyPermissions(user.role);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    title: user.title,
    photoUrl: user.photoUrl,
    roleId: user.roleId,
    roleName: user.roleRef?.name || String(user.role),
    permissions,
  };
}

/**
 * Verifies the admin session and (optionally) a permission.
 * Sends 401/403 itself and returns null when access is denied.
 */
export async function authorize(
  req: NextApiRequest,
  res: NextApiResponse,
  permission?: Permission | Permission[]
): Promise<AdminContext | null> {
  const admin = await loadAdmin(req);
  if (!admin) {
    res.status(401).json({ error: "Your session has ended. Please sign in again." });
    return null;
  }
  if (permission && !hasPermission(admin.permissions, permission)) {
    res.status(403).json({ error: "You don't have permission to do this.", required: permission });
    return null;
  }
  (req as AdminRequest).admin = admin;
  return admin;
}

type MethodPermissions = Partial<Record<"GET" | "POST" | "PUT" | "PATCH" | "DELETE", Permission | Permission[] | null>>;

/** next-connect middleware: `handler.use(requirePermissions({ GET: "members.view", PATCH: "members.manage" }))` */
export function requirePermissions(map: MethodPermissions | Permission | Permission[]) {
  return async (req: NextApiRequest, res: NextApiResponse, next: NextHandler) => {
    if (req.method === "OPTIONS") return next();
    let perm: Permission | Permission[] | undefined;
    if (typeof map === "string" || Array.isArray(map)) perm = map;
    else {
      const m = (map as MethodPermissions)[(req.method || "GET").toUpperCase() as keyof MethodPermissions];
      perm = m === null ? undefined : m;
    }
    const admin = await authorize(req, res, perm);
    if (!admin) return;
    return next();
  };
}

/** Number of active staff users who hold full access ("*"). */
export async function countActiveSuperAdmins(excludeUserId?: number): Promise<number> {
  const users = await prisma.managementUser.findMany({
    where: { isActive: true, ...(excludeUserId ? { NOT: { id: excludeUserId } } : {}) },
    select: { role: true, roleRef: { select: { permissions: true } } },
  });
  return users.filter(u => (u.roleRef ? u.roleRef.permissions : legacyPermissions(u.role)).includes(ALL_ACCESS)).length;
}
