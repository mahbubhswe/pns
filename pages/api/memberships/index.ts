import { createApiHandler, parseBody, parseQuery } from "@/lib/server/http";
import { requireAdmin, type AdminRequest } from "@/lib/server/auth";
import {
  importMembers,
  importMembersSchema,
  listMembers,
  listMembersQuerySchema,
  toMemberDto,
} from "@/features/membership";
import type { ImportMembersResponse, MembersListResponse } from "@/types/api";

const handler = createApiHandler<AdminRequest>(["GET", "POST"]);

handler.use(requireAdmin);

handler.get(async (req, res) => {
  const query = parseQuery(listMembersQuerySchema, req.query);
  const members = await listMembers(query);
  const body: MembersListResponse = { members: members.map(toMemberDto) };
  res.status(200).json(body);
});

/** Bulk import from the XLSX upload on the membership page. */
handler.post(async (req, res) => {
  const parsed = parseBody(importMembersSchema, req.body);
  const rows = Array.isArray(parsed) ? parsed : [parsed];
  const count = await importMembers(rows);
  const body: ImportMembersResponse = { ok: true, count };
  res.status(200).json(body);
});

export default handler;
