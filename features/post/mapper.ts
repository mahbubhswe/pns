import type { Post } from "@/lib/generated/prisma";
import type { PostDto, PublicPostDto } from "@/types/api";
import { cleanPostHtml, postExcerpt } from "./sanitize";

const iso = (d: Date | string) => (d instanceof Date ? d.toISOString() : String(d));

export function toPostDto(post: Post): PostDto {
  return {
    id: post.id,
    title: post.title,
    content: post.content ?? null,
    coverUrl: post.coverImage ?? null,
    published: post.published,
    audience: post.audience,
    created: iso(post.createdAt),
  };
}

/** What the website shows. `withContent` adds the cleaned HTML body (detail page). */
export function toPublicPostDto(post: Post, withContent = false): PublicPostDto {
  return {
    id: post.id,
    title: post.title,
    excerpt: postExcerpt(post.content),
    contentHtml: withContent ? cleanPostHtml(post.content) : null,
    coverUrl: post.coverImage ?? null,
    membersOnly: post.audience === "MEMBERS",
    created: iso(post.createdAt),
  };
}
