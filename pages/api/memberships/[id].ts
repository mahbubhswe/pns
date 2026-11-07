import { createApiHandler, parseBody, parseIdParam } from "@/lib/server/http";
import { requireAdmin, requireRole, type AdminRequest } from "@/lib/server/auth";
import {
  deleteMember,
  getMemberById,
  toMemberDto,
  updateMemberStatus,
  updateMemberStatusSchema,
} from "@/features/membership";
import type { MemberMutationResponse, MemberResponse } from "@/types/api";

const handler = createApiHandler<AdminRequest>(["GET", "PATCH", "DELETE"]);

handler.use(requireAdmin);

handler.get(async (req, res) => {
  const id = parseIdParam(req.query.id);
  const member = await getMemberById(id);
  const body: MemberResponse = { member: toMemberDto(member) };
  res.status(200).json(body);
});

handler.patch(async (req, res) => {
  const id = parseIdParam(req.query.id);
  const { status } = parseBody(updateMemberStatusSchema, req.body);
  const member = await updateMemberStatus(id, status);
  const body: MemberMutationResponse = { ok: true, member: toMemberDto(member) };
  res.status(200).json(body);
});

/** Deleting a member is destructive: ADMIN only. */
handler.delete(requireRole("ADMIN"), async (req, res) => {
  const id = parseIdParam(req.query.id);
  await deleteMember(id);
  res.status(200).json({ ok: true });
});

export default handler;
