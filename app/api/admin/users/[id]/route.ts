import { json, parseBody, parseIdParam, readBody, route } from "@/lib/server/http";
import { requirePermission } from "@/features/access";
import {
  deleteManagementUser,
  getManagementUserById,
  toManagementUserDto,
  updateManagementUser,
  updateManagementUserSchema,
} from "@/features/management-user";
import type { ManagementUserResponse, ManagementUserUpdatedResponse } from "@/types/api";

type Params = { id: string };

export const GET = route<Params>(async (req, { params }) => {
  await requirePermission(req, ["users.view", "users.manage"]);
  const user = await getManagementUserById(parseIdParam(params.id));
  const body: ManagementUserResponse = { user: toManagementUserDto(user) };
  return json(body);
});

export const PATCH = route<Params>(async (req, { params }) => {
  const admin = await requirePermission(req, "users.manage");
  const input = parseBody(updateManagementUserSchema, await readBody(req));
  const user = await updateManagementUser(parseIdParam(params.id), input, admin.id);
  const body: ManagementUserUpdatedResponse = { ok: true, user: toManagementUserDto(user) };
  return json(body);
});

export const DELETE = route<Params>(async (req, { params }) => {
  const admin = await requirePermission(req, "users.manage");
  await deleteManagementUser(parseIdParam(params.id), admin.id);
  return json({ ok: true });
});
