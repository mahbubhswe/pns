import { json, parseBody, parseQuery, readBody, route } from "@/lib/server/http";
import { requirePermission } from "@/features/access";
import {
  importMembers,
  importMembersSchema,
  listMembers,
  listMembersQuerySchema,
  toMemberDto,
} from "@/features/membership";
import type { ImportMembersResponse, MembersListResponse } from "@/types/api";

export const GET = route(async req => {
  await requirePermission(req, "members.view");
  const query = parseQuery(listMembersQuerySchema, req.nextUrl.searchParams);
  const members = await listMembers(query);
  const body: MembersListResponse = { members: members.map(toMemberDto) };
  return json(body);
});

/** Bulk import from the XLSX upload on the membership page. */
export const POST = route(async req => {
  await requirePermission(req, "members.manage");
  const parsed = parseBody(importMembersSchema, await readBody(req));
  const rows = Array.isArray(parsed) ? parsed : [parsed];
  const count = await importMembers(rows);
  const body: ImportMembersResponse = { ok: true, count };
  return json(body);
});
