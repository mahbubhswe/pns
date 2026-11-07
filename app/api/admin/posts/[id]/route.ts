import { json, parseBody, parseIdParam, readBody, route } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/auth";
import { deletePost, getPostById, toPostDto, updatePost, updatePostSchema } from "@/features/post";
import type { PostMutationResponse, PostResponse } from "@/types/api";

type Params = { id: string };

export const GET = route<Params>(async (req, { params }) => {
  requireAdmin(req);
  const post = await getPostById(parseIdParam(params.id));
  const body: PostResponse = { post: toPostDto(post) };
  return json(body);
});

export const PATCH = route<Params>(async (req, { params }) => {
  requireAdmin(req);
  const input = parseBody(updatePostSchema, await readBody(req));
  const post = await updatePost(parseIdParam(params.id), input);
  const body: PostMutationResponse = { ok: true, post: toPostDto(post) };
  return json(body);
});

export const DELETE = route<Params>(async (req, { params }) => {
  requireAdmin(req);
  await deletePost(parseIdParam(params.id));
  return json({ ok: true });
});
