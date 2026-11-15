import { json, parseBody, parseIdParam, readBody, route } from "@/lib/server/http";
import { requirePermission } from "@/features/access";
import {
  deleteCommitteeMember,
  toCommitteeMemberDto,
  updateCommitteeMember,
  updateCommitteeMemberSchema,
} from "@/features/committee";
import type { CommitteeMutationResponse } from "@/types/api";

type Params = { id: string };

export const PATCH = route<Params>(async (req, { params }) => {
  await requirePermission(req, "committee.manage");
  const input = parseBody(updateCommitteeMemberSchema, await readBody(req));
  const member = await updateCommitteeMember(parseIdParam(params.id), input);
  const body: CommitteeMutationResponse = { ok: true, member: toCommitteeMemberDto(member) };
  return json(body);
});

export const DELETE = route<Params>(async (req, { params }) => {
  await requirePermission(req, "committee.manage");
  await deleteCommitteeMember(parseIdParam(params.id));
  return json({ ok: true });
});
