import { z } from "zod";
import { POST_AUDIENCES } from "@/lib/shared/posts";

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform(v => (v === "" ? null : v))
    .nullish();

/** Text fields of the multipart upload (the file itself is validated in the route). */
export const createDocumentSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: nullableText(1000),
  audience: z.enum(POST_AUDIENCES).default("PUBLIC"),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

export const updateDocumentSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200).optional(),
    description: nullableText(1000),
    audience: z.enum(POST_AUDIENCES).optional(),
    sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
  })
  .refine(v => Object.keys(v).length > 0, { message: "Nothing to update" });
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
