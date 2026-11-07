import { createApiHandler, parseBody } from "@/lib/server/http";
import { requireAdmin, type AdminRequest } from "@/lib/server/auth";
import { createPost, createPostSchema, listPosts, toPostDto } from "@/features/post";
import type { PostMutationResponse, PostsListResponse } from "@/types/api";

const handler = createApiHandler<AdminRequest>(["GET", "POST"]);

handler.use(requireAdmin);

handler.get(async (_req, res) => {
  const posts = await listPosts();
  const body: PostsListResponse = { posts: posts.map(toPostDto) };
  res.status(200).json(body);
});

handler.post(async (req, res) => {
  const input = parseBody(createPostSchema, req.body);
  const post = await createPost(input, req.admin.sub);
  const body: PostMutationResponse = { ok: true, post: toPostDto(post) };
  res.status(201).json(body);
});

export default handler;
