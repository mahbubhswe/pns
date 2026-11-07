import { createApiHandler } from "@/lib/server/http";
import { requireAdmin, type AdminRequest } from "@/lib/server/auth";
import { getMembershipStats } from "@/features/membership";

const handler = createApiHandler<AdminRequest>(["GET"]);

handler.use(requireAdmin);

handler.get(async (_req, res) => {
  res.status(200).json(await getMembershipStats());
});

export default handler;
