import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Prisma, type ManagementUser } from "@/lib/generated/prisma";
import { BCRYPT_ROUNDS } from "@/lib/config/constants";
import { ApiError } from "@/lib/server/http/errors";
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
export async function createFirstAdmin(input: SetupAdminInput): Promise<ManagementUser> {
  const password = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  return prisma.$transaction(async tx => {
    const existing = await tx.managementUser.count();
    if (existing > 0) throw ApiError.forbidden("Setup has already been completed");
    return tx.managementUser.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        password,
        role: "ADMIN",
        title: "Administrator",
      },
    });
  });
}

// ---------------------------------------------------------------------------
// CRUD

export async function listManagementUsers(): Promise<ManagementUser[]> {
  return prisma.managementUser.findMany({ orderBy: { id: "desc" } });
}

export async function getManagementUserById(id: number): Promise<ManagementUser> {
  const user = await prisma.managementUser.findUnique({ where: { id } });
  if (!user) throw ApiError.notFound("User not found");
  return user;
}

export async function createManagementUser(input: CreateManagementUserInput): Promise<ManagementUser> {
  const exists = await prisma.managementUser.findUnique({ where: { email: input.email } });
  if (exists) throw ApiError.conflict("Email already exists");

  const password = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  return prisma.managementUser.create({
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email,
      role: input.role,
      password,
      photoUrl: input.photoUrl ?? null,
      address: input.address ?? null,
      title: input.title ?? null,
    },
  });
}

export async function updateManagementUser(id: number, input: UpdateManagementUserInput): Promise<ManagementUser> {
  const data: Prisma.ManagementUserUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.email !== undefined) data.email = input.email;
  if (input.role !== undefined) data.role = input.role;
  if (input.photoUrl !== undefined) data.photoUrl = input.photoUrl;
  if (input.address !== undefined) data.address = input.address;
  if (input.title !== undefined) data.title = input.title;
  if (input.password) data.password = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  return prisma.managementUser.update({ where: { id }, data });
}

export async function deleteManagementUser(id: number, actingAdminId: number): Promise<void> {
  if (id === actingAdminId) throw ApiError.badRequest("You cannot delete your own account");

  const admins = await prisma.managementUser.count({ where: { role: "ADMIN" } });
  const target = await getManagementUserById(id);
  if (target.role === "ADMIN" && admins <= 1) {
    throw ApiError.badRequest("Cannot delete the last ADMIN account");
  }

  try {
    await prisma.managementUser.delete({ where: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      throw ApiError.conflict("This user has authored posts. Reassign or delete those posts first.");
    }
    throw err;
  }
}

/** Returns the management user when credentials are valid, otherwise throws 401. */
export async function authenticateManagementUser(input: AdminLoginInput): Promise<ManagementUser> {
  const user = await prisma.managementUser.findUnique({ where: { email: input.email } });
  if (!user) throw ApiError.unauthorized("Invalid email or password");
  const ok = await bcrypt.compare(input.password, user.password);
  if (!ok) throw ApiError.unauthorized("Invalid email or password");
  return user;
}
