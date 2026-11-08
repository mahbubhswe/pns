import { json, parseBody, parseIdParam, readBody, route } from "@/lib/server/http";
import { requirePermission } from "@/features/access";
import {
  deleteMember,
  getMemberById,
  toMemberDto,
  updateMemberStatus,
  updateMemberStatusSchema,
} from "@/features/membership";
import type { MemberMutationResponse, MemberResponse } from "@/types/api";

type Params = { id: string };

export const GET = route<Params>(async (req, { params }) => {
  await requirePermission(req, "members.view");
  const member = await getMemberById(parseIdParam(params.id));
  const body: MemberResponse = { member: toMemberDto(member) };
  return json(body);
});

export const PATCH = route<Params>(async (req, { params }) => {
  await requirePermission(req, "members.manage");
  const { status } = parseBody(updateMemberStatusSchema, await readBody(req));
  const member = await updateMemberStatus(parseIdParam(params.id), status);
  const body: MemberMutationResponse = { ok: true, member: toMemberDto(member) };
  return json(body);
});

/** Deleting a member is destructive: members.delete (Super Admin by default). */
export const DELETE = route<Params>(async (req, { params }) => {
  await requirePermission(req, "members.delete");
  await deleteMember(parseIdParam(params.id));
  return json({ ok: true });
});
