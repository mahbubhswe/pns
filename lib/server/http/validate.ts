import type { ZodTypeAny, z } from "zod";
import { ApiError } from "./errors";

/**
 * Validate a request body against a schema. Throws a ZodError (mapped to 400
 * by `route()`) when invalid, otherwise returns typed data.
 */
export function parseBody<S extends ZodTypeAny>(schema: S, body: unknown): z.infer<S> {
  return schema.parse(body ?? {});
}

/** Validate URL search params (`req.nextUrl.searchParams`). */
export function parseQuery<S extends ZodTypeAny>(schema: S, params: URLSearchParams): z.infer<S> {
  const obj: Record<string, string> = {};
  params.forEach((value, key) => {
    if (!(key in obj)) obj[key] = value;
  });
  return schema.parse(obj);
}

/** Read a positive integer route parameter such as `/api/things/[id]`. */
export function parseIdParam(value: string | string[] | undefined, name = "id"): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);
  if (!raw || !Number.isInteger(id) || id <= 0) {
    throw ApiError.badRequest(`Invalid ${name}`);
  }
  return id;
}

export function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  const s = String(value ?? "").trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "on";
}
