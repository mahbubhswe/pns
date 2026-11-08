import type { Role } from "@/lib/generated/prisma";
import type { RoleDto } from "@/types/api";

export function toRoleDto(role: Role & { _count?: { users: number } }): RoleDto {
  return {
    id: role.id,
    name: role.name,
    description: role.description ?? null,
    permissions: role.permissions,
    isSystem: role.isSystem,
    userCount: role._count?.users ?? 0,
    updatedAt: role.updatedAt.toISOString(),
  };
}
