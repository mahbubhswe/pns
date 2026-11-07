import { createApiHandler } from "@/lib/server/http";
import { requireAdmin, type AdminRequest } from "@/lib/server/auth";
import { getDashboardStats } from "@/features/dashboard";

const handler = createApiHandler<AdminRequest>(["GET"]);

handler.use(requireAdmin);

handler.get(async (_req, res) => {
  res.status(200).json(await getDashboardStats());
});

export default handler;
