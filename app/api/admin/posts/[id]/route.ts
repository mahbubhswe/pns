import { json, parseBody, parseIdParam, readBody, route } from "@/lib/server/http";
import { deletePost, getPostById, toPostDto, updatePost, updatePostSchema } from "@/features/post";
import type { PostMutationResponse, PostResponse } from "@/types/api";
import { requirePermission } from "@/features/access";

type Params = { id: string };

export const GET = route<Params>(async (req, { params }) => {
  await requirePermission(req, ["posts.view", "posts.manage"]);
  const post = await getPostById(parseIdParam(params.id));
  const body: PostResponse = { post: toPostDto(post) };
  return json(body);
});

export const PATCH = route<Params>(async (req, { params }) => {
  await requirePermission(req, "posts.manage");
  const input = parseBody(updatePostSchema, await readBody(req));
  const post = await updatePost(parseIdParam(params.id), input);
  const body: PostMutationResponse = { ok: true, post: toPostDto(post) };
  return json(body);
});

export const DELETE = route<Params>(async (req, { params }) => {
  await requirePermission(req, "posts.manage");
  await deletePost(parseIdParam(params.id));
  return json({ ok: true });
});
