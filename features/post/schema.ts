import { z } from "zod";

const nullableUrl = z
  .string()
  .trim()
  .transform(v => (v === "" ? null : v))
  .nullish();

export const createPostSchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  content: z.string().min(1, "content is required"),
  coverUrl: nullableUrl,
  published: z.coerce.boolean().default(false),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;

export const updatePostSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    content: z.string().optional(),
    coverUrl: nullableUrl,
    published: z.coerce.boolean().optional(),
  })
  .refine(v => Object.keys(v).length > 0, { message: "Nothing to update" });
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
