import { json, parseBody, readBody, route } from "@/lib/server/http";
import { createPost, createPostSchema, listPosts, toPostDto } from "@/features/post";
import type { PostMutationResponse, PostsListResponse } from "@/types/api";
import { requirePermission } from "@/features/access";

export const GET = route(async req => {
  await requirePermission(req, ["posts.view", "posts.manage"]);
  const posts = await listPosts();
  const body: PostsListResponse = { posts: posts.map(toPostDto) };
  return json(body);
});

export const POST = route(async req => {
  const admin = await requirePermission(req, "posts.manage");
  const input = parseBody(createPostSchema, await readBody(req));
  const post = await createPost(input, admin.id);
  const body: PostMutationResponse = { ok: true, post: toPostDto(post) };
  return json(body, 201);
});
