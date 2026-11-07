import { json, parseBody, readBody, route } from "@/lib/server/http";
import { requireAdmin } from "@/lib/server/auth";
import { createPost, createPostSchema, listPosts, toPostDto } from "@/features/post";
import type { PostMutationResponse, PostsListResponse } from "@/types/api";

export const GET = route(async req => {
  requireAdmin(req);
  const posts = await listPosts();
  const body: PostsListResponse = { posts: posts.map(toPostDto) };
  return json(body);
});

export const POST = route(async req => {
  const admin = requireAdmin(req);
  const input = parseBody(createPostSchema, await readBody(req));
  const post = await createPost(input, admin.sub);
  const body: PostMutationResponse = { ok: true, post: toPostDto(post) };
  return json(body, 201);
});
