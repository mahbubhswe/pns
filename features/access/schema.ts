import { z } from "zod";

const trimmed = z.string().trim();
const nullableText = trimmed.max(300).transform(v => (v === "" ? null : v)).nullish();

export const createRoleSchema = z.object({
  name: trimmed.min(2, "Give the role a name (at least 2 characters)").max(60),
  description: nullableText,
  permissions: z.array(z.string()).max(100).default([]),
});
export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = z
  .object({
    name: trimmed.min(2, "Role name is too short").max(60).optional(),
    description: nullableText,
    permissions: z.array(z.string()).max(100).optional(),
  })
  .refine(v => Object.keys(v).length > 0, { message: "Nothing to update" });
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
