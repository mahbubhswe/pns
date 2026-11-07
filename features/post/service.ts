import { prisma } from "@/lib/prisma";
import type { Post, Prisma } from "@/lib/generated/prisma";
import { ApiError } from "@/lib/server/http/errors";
import type { CreatePostInput, UpdatePostInput } from "./schema";

export async function listPosts(): Promise<Post[]> {
  return prisma.post.findMany({ orderBy: { createdAt: "desc" } });
}

export async function listPublishedPosts(): Promise<Post[]> {
  return prisma.post.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } });
}

export async function getPostById(id: number): Promise<Post> {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw ApiError.notFound("Post not found");
  return post;
}

/** `authorId` is the id of the management user creating the post. */
export async function createPost(input: CreatePostInput, authorId: number): Promise<Post> {
  return prisma.post.create({
    data: {
      title: input.title,
      content: input.content,
      coverImage: input.coverUrl ?? null,
      published: input.published,
      authorId,
    },
  });
}

export async function updatePost(id: number, input: UpdatePostInput): Promise<Post> {
  const data: Prisma.PostUpdateInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.content !== undefined) data.content = input.content;
  if (input.coverUrl !== undefined) data.coverImage = input.coverUrl;
  if (input.published !== undefined) data.published = input.published;
  return prisma.post.update({ where: { id }, data });
}

export async function deletePost(id: number): Promise<void> {
  await prisma.post.delete({ where: { id } });
}
