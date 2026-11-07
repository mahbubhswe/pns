import { createApiHandler, parseBody, parseIdParam } from "@/lib/server/http";
import { requireAdmin, requireRole, type AdminRequest } from "@/lib/server/auth";
import {
  deleteManagementUser,
  getManagementUserById,
  toManagementUserDto,
  updateManagementUser,
  updateManagementUserSchema,
} from "@/features/management-user";
import type { ManagementUserResponse, ManagementUserUpdatedResponse } from "@/types/api";

const handler = createApiHandler<AdminRequest>(["GET", "PATCH", "DELETE"]);

handler.use(requireAdmin);

handler.get(async (req, res) => {
  const id = parseIdParam(req.query.id);
  const user = await getManagementUserById(id);
  const body: ManagementUserResponse = { user: toManagementUserDto(user) };
  res.status(200).json(body);
});

/** Only ADMINs may edit or delete staff accounts. */
handler.patch(requireRole("ADMIN"), async (req, res) => {
  const id = parseIdParam(req.query.id);
  const input = parseBody(updateManagementUserSchema, req.body);
  const user = await updateManagementUser(id, input);
  const body: ManagementUserUpdatedResponse = { ok: true, user: toManagementUserDto(user) };
  res.status(200).json(body);
});

handler.delete(requireRole("ADMIN"), async (req, res) => {
  const id = parseIdParam(req.query.id);
  await deleteManagementUser(id, req.admin.sub);
  res.status(200).json({ ok: true });
});

export default handler;
