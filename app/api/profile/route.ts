import { json, route } from "@/lib/server/http";
import { requireMember } from "@/lib/server/auth";
import { getMemberById, toMemberDto } from "@/features/membership";
import type { ProfileResponse } from "@/types/api";

export const GET = route(async req => {
  const member = requireMember(req);
  const user = await getMemberById(member.sub);
  const body: ProfileResponse = { ok: true, profile: toMemberDto(user) };
  return json(body);
});
