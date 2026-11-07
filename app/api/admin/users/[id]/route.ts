import { json, parseBody, parseIdParam, readBody, route } from "@/lib/server/http";
import { requireAdmin, requireRole } from "@/lib/server/auth";
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
  requireAdmin(req);
  const user = await getManagementUserById(parseIdParam(params.id));
  const body: ManagementUserResponse = { user: toManagementUserDto(user) };
  return json(body);
});

/** Only ADMINs may edit or delete staff accounts. */
export const PATCH = route<Params>(async (req, { params }) => {
  requireRole(req, "ADMIN");
  const input = parseBody(updateManagementUserSchema, await readBody(req));
  const user = await updateManagementUser(parseIdParam(params.id), input);
  const body: ManagementUserUpdatedResponse = { ok: true, user: toManagementUserDto(user) };
  return json(body);
});

export const DELETE = route<Params>(async (req, { params }) => {
  const admin = requireRole(req, "ADMIN");
  await deleteManagementUser(parseIdParam(params.id), admin.sub);
  return json({ ok: true });
});
