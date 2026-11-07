import { createApiHandler, parseBody, parseIdParam } from "@/lib/server/http";
import { requireAdmin, type AdminRequest } from "@/lib/server/auth";
import { deletePost, getPostById, toPostDto, updatePost, updatePostSchema } from "@/features/post";
import type { PostMutationResponse, PostResponse } from "@/types/api";

const handler = createApiHandler<AdminRequest>(["GET", "PATCH", "DELETE"]);

handler.use(requireAdmin);

handler.get(async (req, res) => {
  const id = parseIdParam(req.query.id);
  const post = await getPostById(id);
  const body: PostResponse = { post: toPostDto(post) };
  res.status(200).json(body);
});

handler.patch(async (req, res) => {
  const id = parseIdParam(req.query.id);
  const input = parseBody(updatePostSchema, req.body);
  const post = await updatePost(id, input);
  const body: PostMutationResponse = { ok: true, post: toPostDto(post) };
  res.status(200).json(body);
});

handler.delete(async (req, res) => {
  const id = parseIdParam(req.query.id);
  await deletePost(id);
  res.status(200).json({ ok: true });
});

export default handler;
