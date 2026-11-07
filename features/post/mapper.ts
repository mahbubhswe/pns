import type { Post } from "@/lib/generated/prisma";
import type { PostDto } from "@/types/api";

export function toPostDto(post: Post): PostDto {
  return {
    id: post.id,
    title: post.title,
    content: post.content ?? null,
    coverUrl: post.coverImage ?? null,
    published: post.published,
    created: post.createdAt instanceof Date ? post.createdAt.toISOString() : String(post.createdAt),
  };
}
