import { json, parseBody, readBody, route } from "@/lib/server/http";
import { requirePermission } from "@/features/access";
import {
  createManagementUser,
  createManagementUserSchema,
  listManagementUsers,
  toManagementUserDto,
} from "@/features/management-user";
import type { ManagementUserCreatedResponse, ManagementUsersListResponse } from "@/types/api";

export const GET = route(async req => {
  await requirePermission(req, ["users.view", "users.manage"]);
  const users = await listManagementUsers();
  const body: ManagementUsersListResponse = { users: users.map(toManagementUserDto) };
  return json(body);
});

export const POST = route(async req => {
  await requirePermission(req, "users.manage");
  const input = parseBody(createManagementUserSchema, await readBody(req));
  const created = await createManagementUser(input);
  const body: ManagementUserCreatedResponse = { ok: true, admin: toManagementUserDto(created) };
  return json(body, 201);
});
