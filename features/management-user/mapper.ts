import type { ManagementUser, Role } from "@/lib/generated/prisma";
import { legacyPermissions } from "@/lib/shared/permissions";
import type { ManagementUserDto } from "@/types/api";

export type ManagementUserWithRole = ManagementUser & { roleRef: Role | null };

/** Strips the password hash; the only shape that may leave the server. */
export function toManagementUserDto(user: ManagementUserWithRole): ManagementUserDto {
  return {
    id: user.id,
    photoUrl: user.photoUrl ?? null,
    name: user.name,
    phone: user.phone,
    address: user.address ?? null,
    role: user.role,
    roleId: user.roleId ?? null,
    roleName: user.roleRef?.name ?? user.role,
    permissions: user.roleRef ? user.roleRef.permissions : legacyPermissions(user.role),
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    email: user.email,
    title: user.title ?? null,
    created: user.created instanceof Date ? user.created.toISOString() : String(user.created),
  };
}
