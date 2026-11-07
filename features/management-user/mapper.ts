import type { ManagementUser } from "@/lib/generated/prisma";
import type { ManagementUserDto } from "@/types/api";

/** Strips the password hash; the only shape that may leave the server. */
export function toManagementUserDto(user: ManagementUser): ManagementUserDto {
  return {
    id: user.id,
    photoUrl: user.photoUrl ?? null,
    name: user.name,
    phone: user.phone,
    address: user.address ?? null,
    role: user.role,
    email: user.email,
    title: user.title ?? null,
    created: user.created instanceof Date ? user.created.toISOString() : String(user.created),
  };
}
