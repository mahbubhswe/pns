import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
const nullable = (max: number) =>
  text(max)
    .transform(v => (v === "" ? null : v))
    .nullish();
const photoUrl = z
  .string()
  .trim()
  .max(1000)
  .refine(v => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v), "Must be an uploaded image URL")
  .transform(v => (v === "" ? null : v))
  .nullish();

export const createCommitteeMemberSchema = z.object({
  name: text(120).min(1, "Name is required"),
  position: text(120).min(1, "Position is required"),
  bio: nullable(1000),
  photoUrl,
  phone: nullable(40),
  email: z
    .union([z.literal(""), z.string().trim().email("Invalid email")])
    .transform(v => (v === "" ? null : v))
    .nullish(),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isActive: z.boolean().default(true),
});
export type CreateCommitteeMemberInput = z.infer<typeof createCommitteeMemberSchema>;

export const updateCommitteeMemberSchema = createCommitteeMemberSchema
  .partial()
  .refine(v => Object.keys(v).length > 0, { message: "Nothing to update" });
export type UpdateCommitteeMemberInput = z.infer<typeof updateCommitteeMemberSchema>;
