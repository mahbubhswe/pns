/**
 * Centralised, validated access to environment variables.
 *
 * Server-only. Import `env` instead of touching `process.env` directly so that:
 *  - every variable is declared once, with its type and default, in one place;
 *  - production fails fast on a missing secret instead of silently using a
 *    development fallback (the old code fell back to "dev-secret" for JWTs).
 */
import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

const optionalString = z
  .string()
  .trim()
  .transform(v => (v === "" ? undefined : v))
  .optional();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  JWT_SECRET: isProduction
    ? z.string().min(16, "JWT_SECRET must be at least 16 characters in production")
    : z.string().min(1).default("dev-only-insecure-secret"),

  NEXT_PUBLIC_APP_URL: optionalString,
  NEXT_PUBLIC_SITE_URL: optionalString,
  CORS_ALLOW_ORIGIN: optionalString,
  CORS_ALLOW_HEADERS: optionalString,

  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform(v => v === "true"),
  SMTP_USER: optionalString,
  SMTP_PASS: optionalString,
  SMTP_FROM: optionalString,

  BLOB_READ_WRITE_TOKEN: optionalString,
  BLOB_URL: z.string().default("https://blob.vercel-storage.com"),
  BLOB_UPLOAD_PREFIX: z.string().default("pns-membership"),
  BLOB_PREVIEW_PREFIX: optionalString,
  BLOB_ACCESS_LEVEL: z.enum(["public", "private"]).default("public"),

  VERCEL: optionalString,
  VERCEL_URL: optionalString,
  NEXT_PUBLIC_VERCEL_URL: optionalString,
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

/**
 * Parse and cache the environment. Lazy so that importing a module that uses
 * `env` never throws at build time; it throws on first real use instead.
 */
export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const problems = parsed.error.issues
      .map(issue => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${problems}`);
  }
  cached = parsed.data;
  return cached;
}

/** Convenience proxy: `env.JWT_SECRET` instead of `getEnv().JWT_SECRET`. */
export const env: Env = new Proxy({} as Env, {
  get(_target, prop: string) {
    return getEnv()[prop as keyof Env];
  },
});

export const isProd = () => getEnv().NODE_ENV === "production";
export const isVercel = () => Boolean(getEnv().VERCEL);
