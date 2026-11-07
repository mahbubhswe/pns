import { json, parseBody, readBody, route } from "@/lib/server/http";
import { requireAdmin, requireRole } from "@/lib/server/auth";
import {
  createManagementUser,
  createManagementUserSchema,
  listManagementUsers,
  toManagementUserDto,
} from "@/features/management-user";
import type { ManagementUserCreatedResponse, ManagementUsersListResponse } from "@/types/api";

export const GET = route(async req => {
  requireAdmin(req);
  const users = await listManagementUsers();
  const body: ManagementUsersListResponse = { users: users.map(toManagementUserDto) };
  return json(body);
});

/** Only ADMINs may create staff accounts. */
export const POST = route(async req => {
  requireRole(req, "ADMIN");
  const input = parseBody(createManagementUserSchema, await readBody(req));
  const created = await createManagementUser(input);
  const body: ManagementUserCreatedResponse = { ok: true, admin: toManagementUserDto(created) };
  return json(body, 201);
});
