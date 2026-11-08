import { json, parseBody, parseIdParam, readBody, route } from "@/lib/server/http";
import { deleteRole, getRoleById, requirePermission, toRoleDto, updateRole, updateRoleSchema } from "@/features/access";
import type { RoleMutationResponse } from "@/types/api";

type Params = { id: string };

export const GET = route<Params>(async (req, { params }) => {
  await requirePermission(req, ["roles.manage", "users.view"]);
  return json({ role: toRoleDto(await getRoleById(parseIdParam(params.id))) });
});

export const PATCH = route<Params>(async (req, { params }) => {
  await requirePermission(req, "roles.manage");
  const input = parseBody(updateRoleSchema, await readBody(req));
  const body: RoleMutationResponse = { ok: true, role: toRoleDto(await updateRole(parseIdParam(params.id), input)) };
  return json(body);
});

export const DELETE = route<Params>(async (req, { params }) => {
  await requirePermission(req, "roles.manage");
  await deleteRole(parseIdParam(params.id));
  return json({ ok: true });
});
