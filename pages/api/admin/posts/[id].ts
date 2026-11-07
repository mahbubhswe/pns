import type { NextApiRequest, NextApiResponse } from "next";
import type { NextHandler } from "next-connect";
import { ensureAdmin } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";
import { createApiHandler } from "@/lib/server/handler";

type PostRequest = NextApiRequest & { postId?: number };

function mapToUi(p: any) {
  return {
    id: p.id,
    title: p.title,
    content: p.content,
    coverUrl: p.coverImage,
    published: p.published,
    created: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
  };
}

const handler = createApiHandler(["GET", "PATCH", "DELETE"]);

handler.use((req: PostRequest, res: NextApiResponse, next: NextHandler) => {
  if (!ensureAdmin(req, res)) {
    return;
  }
  next();
});

handler.use((req: PostRequest, res: NextApiResponse, next: NextHandler) => {
  const { id } = req.query;
  if (typeof id !== "string") {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const pid = Number(id);
  if (Number.isNaN(pid)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  req.postId = pid;
  next();
});

handler.get(async (req: PostRequest, res: NextApiResponse) => {
  const pid = req.postId!;
  const p = await prisma.post.findUnique({ where: { id: pid } });
  if (!p) return res.status(404).json({ error: "Not found" });
  return res.status(200).json({ post: mapToUi(p) });
});

handler.patch(async (req: PostRequest, res: NextApiResponse) => {
  try {
    const pid = req.postId!;
    const { title, content, coverUrl, published } = req.body || {};
    const updated = await prisma.post.update({
      where: { id: pid },
      data: {
        ...(title !== undefined ? { title: String(title) } : {}),
        ...(content !== undefined ? { content: String(content) } : {}),
        ...(coverUrl !== undefined ? { coverImage: coverUrl || null } : {}),
        ...(published !== undefined ? { published: Boolean(published) } : {}),
      },
    });
    return res.status(200).json({ ok: true, post: mapToUi(updated) });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Failed to update" });
  }
});

handler.delete(async (req: PostRequest, res: NextApiResponse) => {
  try {
    const pid = req.postId!;
    await prisma.post.delete({ where: { id: pid } });
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Failed to delete" });
  }
});

export default handler;
