import type { NextApiRequest, NextApiResponse } from "next";
import { requirePermissions, AdminRequest } from "@/lib/server/rbac";
import { prisma } from "@/lib/prisma";
import { createApiHandler } from "@/lib/server/handler";

type DbPost = {
  id: number;
  title: string;
  content: string | null;
  coverImage: string | null;
  published: boolean;
  createdAt: Date;
};

type UiPost = { id: number; title: string; content?: string | null; coverUrl?: string | null; published: boolean; created: string };

function mapToUi(p: DbPost): UiPost {
  return {
    id: p.id,
    title: p.title,
    content: p.content,
    coverUrl: p.coverImage,
    published: p.published,
    created: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
  };
}

const handler = createApiHandler(["GET", "POST"]);

handler.use(requirePermissions({ GET: ["posts.view", "posts.manage"], POST: "posts.manage" }));

handler.get(async (_req: NextApiRequest, res: NextApiResponse) => {
  const items = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  return res.status(200).json({ posts: items.map(mapToUi) });
});

handler.post(async (req: AdminRequest, res: NextApiResponse) => {
  try {
    const { title, content, coverUrl, published } = req.body || {};
    if (!title || !content) return res.status(400).json({ error: "title and content are required" });
    // Post.authorId references ManagementUser — use the signed-in staff member.
    const authorId = req.admin!.id;
    const created = await prisma.post.create({
      data: {
        title: String(title),
        content: String(content),
        coverImage: coverUrl || null,
        published: Boolean(published),
        authorId,
      },
    });
    return res.status(201).json({ ok: true, post: mapToUi(created as unknown as DbPost) });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Failed to create" });
  }
});

export default handler;
