import { prisma } from "@/lib/prisma";
import type { Post, PostAudience, Prisma } from "@/lib/generated/prisma";
import { ApiError } from "@/lib/server/http/errors";
import type { CreatePostInput, UpdatePostInput } from "./schema";
import { cleanPostHtml } from "./sanitize";

// ---------------------------------------------------------------------------
// Dashboard (staff)

export async function listPosts(): Promise<Post[]> {
  return prisma.post.findMany({ orderBy: { createdAt: "desc" } });
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
      content: cleanPostHtml(input.content),
      coverImage: input.coverUrl ?? null,
      published: input.published,
      audience: input.audience,
      authorId,
    },
  });
}

export async function updatePost(id: number, input: UpdatePostInput): Promise<Post> {
  const data: Prisma.PostUpdateInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.content !== undefined) data.content = cleanPostHtml(input.content);
  if (input.coverUrl !== undefined) data.coverImage = input.coverUrl;
  if (input.published !== undefined) data.published = input.published;
  if (input.audience !== undefined) data.audience = input.audience;
  return prisma.post.update({ where: { id }, data });
}

export async function deletePost(id: number): Promise<void> {
  await prisma.post.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// Website. Staff-only posts and drafts never leave these functions.

/** Who is reading: a visitor, or a logged-in member (who also sees members-only posts). */
export type PostViewer = { member: boolean };

function audiencesFor(viewer: PostViewer): PostAudience[] {
  return viewer.member ? ["PUBLIC", "MEMBERS"] : ["PUBLIC"];
}

/** Published posts the viewer may read, newest first. */
export async function listReadablePosts(viewer: PostViewer, take?: number): Promise<Post[]> {
  return prisma.post.findMany({
    where: { published: true, audience: { in: audiencesFor(viewer) } },
    orderBy: { createdAt: "desc" },
    take,
  });
}

/** Published members-only posts (the "Member notices" list on the profile page). */
export async function listMemberNotices(take = 10): Promise<Post[]> {
  return prisma.post.findMany({
    where: { published: true, audience: "MEMBERS" },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export type ReadablePost = { status: "ok"; post: Post } | { status: "login-required" } | { status: "not-found" };

/**
 * One post for the website. Members-only posts ask a visitor to log in; drafts
 * and staff-only posts look exactly like a missing post (no existence leak).
 */
export async function getReadablePost(id: number, viewer: PostViewer): Promise<ReadablePost> {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post || !post.published || post.audience === "STAFF") return { status: "not-found" };
  if (post.audience === "MEMBERS" && !viewer.member) return { status: "login-required" };
  return { status: "ok", post };
}
