import { createApiHandler } from "@/lib/server/http";
import { requireMember, type MemberRequest } from "@/lib/server/auth";
import { getMemberById, toMemberDto } from "@/features/membership";
import type { ProfileResponse } from "@/types/api";

const handler = createApiHandler<MemberRequest>(["GET"]);

handler.use(requireMember);

handler.get(async (req, res) => {
  const user = await getMemberById(req.member.sub);
  const body: ProfileResponse = { ok: true, profile: toMemberDto(user) };
  res.status(200).json(body);
});

export default handler;
