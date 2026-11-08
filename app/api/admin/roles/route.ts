import { json, parseBody, readBody, route } from "@/lib/server/http";
import { createRole, createRoleSchema, listRoles, requirePermission, toRoleDto } from "@/features/access";
import type { RoleMutationResponse, RolesListResponse } from "@/types/api";

/** Readable by anyone who manages roles or staff (the staff form needs the list). */
export const GET = route(async req => {
  await requirePermission(req, ["roles.manage", "users.view", "users.manage"]);
  const body: RolesListResponse = { roles: (await listRoles()).map(toRoleDto) };
  return json(body);
});

export const POST = route(async req => {
  await requirePermission(req, "roles.manage");
  const input = parseBody(createRoleSchema, await readBody(req));
  const body: RoleMutationResponse = { ok: true, role: toRoleDto(await createRole(input)) };
  return json(body, 201);
});
