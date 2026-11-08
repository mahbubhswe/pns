import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma";
import { BCRYPT_ROUNDS } from "@/lib/config/constants";
import { ApiError } from "@/lib/server/http/errors";
import { ALL_ACCESS, legacyRoleFor } from "@/lib/shared/permissions";
import { countActiveSuperAdmins, permissionsFor } from "@/features/access/service";
import type { ManagementUserWithRole } from "./mapper";
import type {
  AdminLoginInput,
  CreateManagementUserInput,
  SetupAdminInput,
  UpdateManagementUserInput,
} from "./schema";

// ---------------------------------------------------------------------------
// First-run setup

export async function countManagementUsers(): Promise<number> {
  return prisma.managementUser.count();
}

/** True until the very first management user has been created. */
export async function needsInitialSetup(): Promise<boolean> {
  return (await countManagementUsers()) === 0;
}

/**
 * Create the first ADMIN. Runs inside a transaction so two concurrent setup
 * requests cannot both succeed; once any management user exists, setup is
 * permanently closed.
 */
export async function createFirstAdmin(input: SetupAdminInput): Promise<ManagementUserWithRole> {
  const password = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  return prisma.$transaction(async tx => {
    const existing = await tx.managementUser.count();
    if (existing > 0) throw ApiError.forbidden("Setup has already been completed");
    const superAdmin = await tx.role.upsert({
      where: { name: "Super Admin" },
      update: {},
      create: { name: "Super Admin", description: "Full access to every part of the portal.", permissions: [ALL_ACCESS], isSystem: true },
    });
    return tx.managementUser.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        password,
        role: "ADMIN",
        roleId: superAdmin.id,
        title: "Administrator",
        lastLoginAt: new Date(),
      },
      include: { roleRef: true },
    });
  });
}

// ---------------------------------------------------------------------------
// CRUD

const withRole = { roleRef: true } as const;

export async function listManagementUsers(): Promise<ManagementUserWithRole[]> {
  return prisma.managementUser.findMany({ orderBy: { id: "desc" }, include: withRole });
}

export async function getManagementUserById(id: number): Promise<ManagementUserWithRole> {
  const user = await prisma.managementUser.findUnique({ where: { id }, include: withRole });
  if (!user) throw ApiError.notFound("User not found");
  return user;
}

async function getRoleOrThrow(roleId: number) {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw ApiError.badRequest("Selected role no longer exists");
  return role;
}

export async function createManagementUser(input: CreateManagementUserInput): Promise<ManagementUserWithRole> {
  const exists = await prisma.managementUser.findUnique({ where: { email: input.email } });
  if (exists) throw ApiError.conflict("This email is already used by another staff account");

  const role = await getRoleOrThrow(input.roleId);
  const password = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  return prisma.managementUser.create({
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email,
      roleId: role.id,
      role: legacyRoleFor(role.permissions),
      isActive: input.isActive ?? true,
      password,
      photoUrl: input.photoUrl ?? null,
      address: input.address ?? null,
      title: input.title ?? null,
    },
    include: withRole,
  });
}

/**
 * Update a staff account. Guards: you can't deactivate yourself, and the
 * portal never loses its last active full-access user.
 */
export async function updateManagementUser(
  id: number,
  input: UpdateManagementUserInput,
  actingAdminId: number
): Promise<ManagementUserWithRole> {
  const current = await getManagementUserById(id);
  const data: Prisma.ManagementUserUncheckedUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.email !== undefined && input.email !== current.email) {
    const taken = await prisma.managementUser.findUnique({ where: { email: input.email } });
    if (taken) throw ApiError.conflict("This email is already used by another staff account");
    data.email = input.email;
  }
  if (input.photoUrl !== undefined) data.photoUrl = input.photoUrl;
  if (input.address !== undefined) data.address = input.address;
  if (input.title !== undefined) data.title = input.title;
  if (input.password) data.password = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const currentPerms = permissionsFor(current);
  let nextPerms = currentPerms;
  if (input.roleId !== undefined && input.roleId !== current.roleId) {
    const role = await getRoleOrThrow(input.roleId);
    data.roleId = role.id;
    data.role = legacyRoleFor(role.permissions);
    nextPerms = role.permissions;
  }
  if (input.isActive !== undefined) {
    if (id === actingAdminId && !input.isActive) throw ApiError.badRequest("You can't deactivate your own account.");
    data.isActive = input.isActive;
  }

  const losingFullAccess =
    currentPerms.includes(ALL_ACCESS) && current.isActive && (!nextPerms.includes(ALL_ACCESS) || data.isActive === false);
  if (losingFullAccess && (await countActiveSuperAdmins(id)) < 1) {
    throw ApiError.badRequest("At least one active user must keep full access.");
  }

  return prisma.managementUser.update({ where: { id }, data, include: withRole });
}

export async function deleteManagementUser(id: number, actingAdminId: number): Promise<void> {
  if (id === actingAdminId) throw ApiError.badRequest("You can't delete your own account.");
  const target = await getManagementUserById(id);
  if (permissionsFor(target).includes(ALL_ACCESS) && target.isActive && (await countActiveSuperAdmins(id)) < 1) {
    throw ApiError.badRequest("At least one active user must keep full access.");
  }
  const posts = await prisma.post.count({ where: { authorId: id } });
  if (posts > 0) {
    throw ApiError.conflict(`${target.name} has written ${posts} post(s). Deactivate the account instead so the posts keep their author.`);
  }
  await prisma.managementUser.delete({ where: { id } });
}

/** Returns the staff user when credentials are valid and the account is active; records the sign-in. */
export async function authenticateManagementUser(input: AdminLoginInput): Promise<ManagementUserWithRole> {
  const user = await prisma.managementUser.findUnique({ where: { email: input.email }, include: withRole });
  if (!user) throw ApiError.unauthorized("Invalid email or password");
  const ok = await bcrypt.compare(input.password, user.password);
  if (!ok) throw ApiError.unauthorized("Invalid email or password");
  if (!user.isActive) throw ApiError.forbidden("This account has been deactivated. Please contact a Super Admin.");
  return prisma.managementUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() }, include: withRole });
}
