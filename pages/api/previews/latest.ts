import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const preview = await prisma.previewDocument.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!preview) {
    return res.status(404).json({ error: "No preview available" });
  }

  return res.status(200).json({ url: preview.fileUrl });
}
