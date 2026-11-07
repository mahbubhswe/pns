import { createApiHandler, parseBody } from "@/lib/server/http";
import { requireAdmin, requireRole, type AdminRequest } from "@/lib/server/auth";
import {
  createManagementUser,
  createManagementUserSchema,
  listManagementUsers,
  toManagementUserDto,
} from "@/features/management-user";
import type { ManagementUserCreatedResponse, ManagementUsersListResponse } from "@/types/api";

const handler = createApiHandler<AdminRequest>(["GET", "POST"]);

handler.use(requireAdmin);

handler.get(async (_req, res) => {
  const users = await listManagementUsers();
  const body: ManagementUsersListResponse = { users: users.map(toManagementUserDto) };
  res.status(200).json(body);
});

/** Only ADMINs may create staff accounts. */
handler.post(requireRole("ADMIN"), async (req, res) => {
  const input = parseBody(createManagementUserSchema, req.body);
  const created = await createManagementUser(input);
  const body: ManagementUserCreatedResponse = { ok: true, admin: toManagementUserDto(created) };
  res.status(201).json(body);
});

export default handler;
