import { z } from "zod";
import { MANAGEMENT_ROLES } from "@/lib/shared/membership";

const trimmed = z.string().trim();
const nullableText = trimmed.transform(v => (v === "" ? null : v)).nullish();
const role = z.preprocess(
  v => (typeof v === "string" ? v.trim().toUpperCase() : v),
  z.enum(MANAGEMENT_ROLES, { message: "Invalid role. Use ADMIN, EDITOR or VIEWER." })
);

export const createManagementUserSchema = z.object({
  name: trimmed.min(1, "name is required"),
  phone: trimmed.min(1, "phone is required"),
  email: trimmed.toLowerCase().email("A valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role,
  photoUrl: nullableText,
  address: nullableText,
  title: nullableText,
});
export type CreateManagementUserInput = z.infer<typeof createManagementUserSchema>;

export const updateManagementUserSchema = z
  .object({
    name: trimmed.min(1).optional(),
    phone: trimmed.min(1).optional(),
    email: trimmed.toLowerCase().email().optional(),
    /** Empty string means "keep current password". */
    password: z
      .string()
      .transform(v => (v === "" ? undefined : v))
      .pipe(z.string().min(6, "Password must be at least 6 characters").optional())
      .optional(),
    role: role.optional(),
    photoUrl: nullableText,
    address: nullableText,
    title: nullableText,
  })
  .refine(v => Object.keys(v).length > 0, { message: "Nothing to update" });
export type UpdateManagementUserInput = z.infer<typeof updateManagementUserSchema>;

export const adminLoginSchema = z.object({
  email: trimmed.toLowerCase().min(1, "Email is required"),
  password: z.string().trim().min(1, "Password is required"),
});
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

/** First-run setup: creates the initial ADMIN when the table is empty. */
export const setupAdminSchema = z.object({
  name: trimmed.min(1, "Name is required"),
  email: trimmed.toLowerCase().email("A valid email is required"),
  phone: trimmed.min(1, "Phone is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type SetupAdminInput = z.infer<typeof setupAdminSchema>;
