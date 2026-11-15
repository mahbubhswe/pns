import { json, parseBody, readBody, route } from "@/lib/server/http";
import { requirePermission } from "@/features/access";
import {
  createCommitteeMember,
  createCommitteeMemberSchema,
  listCommitteeMembers,
  toCommitteeMemberDto,
} from "@/features/committee";
import type { CommitteeListResponse, CommitteeMutationResponse } from "@/types/api";

export const dynamic = "force-dynamic";

export const GET = route(async req => {
  await requirePermission(req, "committee.manage");
  const body: CommitteeListResponse = { members: (await listCommitteeMembers()).map(toCommitteeMemberDto) };
  return json(body);
});

export const POST = route(async req => {
  await requirePermission(req, "committee.manage");
  const input = parseBody(createCommitteeMemberSchema, await readBody(req));
  const body: CommitteeMutationResponse = { ok: true, member: toCommitteeMemberDto(await createCommitteeMember(input)) };
  return json(body, 201);
});
