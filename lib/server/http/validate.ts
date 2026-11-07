import type { NextApiRequest } from "next";
import type { ZodTypeAny, z } from "zod";
import { ApiError } from "./errors";

/**
 * Validate a JSON body against a schema. Throws a ZodError (mapped to 400 by
 * the shared handler) when invalid, otherwise returns typed data.
 */
export function parseBody<S extends ZodTypeAny>(schema: S, body: unknown): z.infer<S> {
  return schema.parse(body ?? {});
}

/** Validate `req.query` (all values are strings or string arrays). */
export function parseQuery<S extends ZodTypeAny>(schema: S, query: NextApiRequest["query"]): z.infer<S> {
  return schema.parse(query ?? {});
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

/** First value of a possibly-multi-valued field (query string or multipart). */
export function firstValue<T>(value: T | T[] | undefined | null): T | undefined {
  if (value === undefined || value === null) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export function firstString(value: string | string[] | undefined | null): string {
  return String(firstValue(value) ?? "").trim();
}

export function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  const s = String(value ?? "").trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "on";
}
