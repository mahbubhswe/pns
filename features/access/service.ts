import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/generated/prisma";
import { ApiError } from "@/lib/server/http/errors";
import { requireAdmin } from "@/lib/server/auth/guards";
import {
  ALL_ACCESS,
  hasPermission,
  legacyPermissions,
  sanitizePermissions,
  type Permission,
} from "@/lib/shared/permissions";
import type { AdminMeDto } from "@/types/api";
import type { CreateRoleInput, UpdateRoleInput } from "./schema";

export type AdminContext = Omit<AdminMeDto, "impersonatedBy">;

/** Permissions a staff user holds: from their Role, or from the legacy enum for unmigrated accounts. */
export function permissionsFor(user: { role: string; roleRef: Pick<Role, "permissions"> | null }): string[] {
  return user.roleRef ? user.roleRef.permissions : legacyPermissions(user.role);
}

/** Load an active staff user with their role. Returns null for unknown or deactivated accounts. */
export async function loadAdminContext(id: number): Promise<AdminContext | null> {
  const user = await prisma.managementUser.findUnique({ where: { id }, include: { roleRef: true } });
  if (!user || !user.isActive) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    title: user.title ?? null,
    photoUrl: user.photoUrl ?? null,
    roleId: user.roleId ?? null,
    roleName: user.roleRef?.name ?? user.role,
    permissions: permissionsFor(user),
  };
}

/**
 * Route guard: verifies the admin cookie, reloads the user and role from the
 * database (so role changes and deactivation apply immediately) and checks
 * the permission. Throws 401 / 403 as ApiError.
 *
 *   const admin = await requirePermission(req, "members.view");
 */
export async function requirePermission(req: NextRequest, permission?: Permission | Permission[]): Promise<AdminContext> {
  const claims = requireAdmin(req);
  const admin = await loadAdminContext(claims.sub);
  if (!admin) throw ApiError.unauthorized("Your session has ended. Please sign in again.");
  if (claims.imp) {
    // A "log in as" session only lives while the real staff user may still impersonate.
    const actor = await loadAdminContext(claims.imp);
    if (!actor || !hasPermission(actor.permissions, "users.impersonate")) {
      throw ApiError.unauthorized("This 'log in as' session has ended. Please sign in again.");
    }
  }
  if (permission && !hasPermission(admin.permissions, permission)) {
    throw ApiError.forbidden("You don't have permission to do this.");
  }
  return admin;
}

/** Number of active staff users holding full access ("*"), optionally ignoring one user. */
export async function countActiveSuperAdmins(excludeUserId?: number): Promise<number> {
  const users = await prisma.managementUser.findMany({
    where: { isActive: true, ...(excludeUserId ? { NOT: { id: excludeUserId } } : {}) },
    select: { role: true, roleRef: { select: { permissions: true } } },
  });
  return users.filter(u => permissionsFor(u).includes(ALL_ACCESS)).length;
}

// ---------------------------------------------------------------------------
// Roles

export type RoleWithCount = Role & { _count: { users: number } };

export async function listRoles(): Promise<RoleWithCount[]> {
  return prisma.role.findMany({
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    include: { _count: { select: { users: true } } },
  });
}

export async function getRoleById(id: number): Promise<RoleWithCount> {
  const role = await prisma.role.findUnique({ where: { id }, include: { _count: { select: { users: true } } } });
  if (!role) throw ApiError.notFound("Role not found");
  return role;
}

export async function createRole(input: CreateRoleInput): Promise<RoleWithCount> {
  if (await prisma.role.findUnique({ where: { name: input.name } })) {
    throw ApiError.conflict("A role with this name already exists.");
  }
  return prisma.role.create({
    data: { name: input.name, description: input.description ?? null, permissions: sanitizePermissions(input.permissions) },
    include: { _count: { select: { users: true } } },
  });
}

export async function updateRole(id: number, input: UpdateRoleInput): Promise<RoleWithCount> {
  const role = await getRoleById(id);
  const data: { name?: string; description?: string | null; permissions?: string[] } = {};

  if (input.name !== undefined && input.name !== role.name) {
    if (role.isSystem) throw ApiError.badRequest("Built-in roles can't be renamed.");
    if (await prisma.role.findUnique({ where: { name: input.name } })) {
      throw ApiError.conflict("Another role already uses this name.");
    }
    data.name = input.name;
  }
  if (input.description !== undefined) data.description = input.description ?? null;

  if (input.permissions !== undefined) {
    const next = sanitizePermissions(input.permissions);
    const hadAll = role.permissions.includes(ALL_ACCESS);
    if (hadAll && !next.includes(ALL_ACCESS)) {
      if (role.name === "Super Admin") throw ApiError.badRequest("Super Admin always keeps full access.");
      const holders = await prisma.managementUser.count({ where: { roleId: id, isActive: true } });
      if ((await countActiveSuperAdmins()) - holders < 1) {
        throw ApiError.badRequest("At least one active user must keep full access.");
      }
    }
    data.permissions = next;
  }

  return prisma.role.update({ where: { id }, data, include: { _count: { select: { users: true } } } });
}

export async function deleteRole(id: number): Promise<void> {
  const role = await getRoleById(id);
  if (role.isSystem) throw ApiError.badRequest("Built-in roles can't be deleted.");
  if (role._count.users > 0) {
    throw ApiError.conflict(`Move the ${role._count.users} user(s) on this role to another role first.`);
  }
  await prisma.role.delete({ where: { id } });
}

/** The built-in full-access role, created if it was removed. Used by first-run setup and the seed script. */
export async function ensureSuperAdminRole(): Promise<Role> {
  return prisma.role.upsert({
    where: { name: "Super Admin" },
    update: {},
    create: { name: "Super Admin", description: "Full access to every part of the portal.", permissions: [ALL_ACCESS], isSystem: true },
  });
}
