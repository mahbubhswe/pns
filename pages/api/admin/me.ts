import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/server/handler";
import { authorize } from "@/lib/server/rbac";

const handler = createApiHandler(["GET"]);

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const admin = await authorize(req, res);
  if (!admin) return;
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ admin });
});

export default handler;
