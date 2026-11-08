/**
 * Browser-side API client.
 *
 * One place that knows how to talk to `/api/*`: JSON encoding, multipart,
 * error envelope parsing. Components should import these helpers (or pass
 * `apiGet` to SWR) instead of calling `fetch`/`axios` directly.
 */
import type { ApiErrorResponse } from "@/types/api";

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, message: string, code = "UNKNOWN", details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function isApiClientError(err: unknown): err is ApiClientError {
  return err instanceof ApiClientError;
}

/** Human-readable message from any thrown value (ApiClientError, Error, string). */
export function errorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (isApiClientError(err)) {
    // Zod failures come back as "Validation failed" + per-field issues; show the first one.
    if (err.code === "VALIDATION_ERROR" && Array.isArray(err.details)) {
      const first = err.details[0] as { message?: unknown } | undefined;
      if (first && typeof first.message === "string" && first.message) return first.message;
    }
    return err.message;
  }
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err) return err;
  return fallback;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const body = (data ?? {}) as Partial<ApiErrorResponse> & { message?: string };
    const message =
      body.error || body.message || (typeof data === "string" && data) || `Request failed (${res.status})`;
    throw new ApiClientError(res.status, message, body.code, body.details);
  }

  return data as T;
}

type RequestOptions = { signal?: AbortSignal };

export async function apiGet<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const res = await fetch(url, { credentials: "same-origin", signal: options.signal });
  return parseResponse<T>(res);
}

async function sendJson<T>(method: "POST" | "PATCH" | "PUT" | "DELETE", url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    credentials: "same-origin",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return parseResponse<T>(res);
}

export const apiPost = <T>(url: string, body?: unknown) => sendJson<T>("POST", url, body);
export const apiPatch = <T>(url: string, body?: unknown) => sendJson<T>("PATCH", url, body);
export const apiPut = <T>(url: string, body?: unknown) => sendJson<T>("PUT", url, body);
export const apiDelete = <T>(url: string) => sendJson<T>("DELETE", url);

/** Multipart upload. Pass a FormData; the browser sets the boundary header. */
export async function apiPostForm<T>(url: string, form: FormData): Promise<T> {
  const res = await fetch(url, { method: "POST", credentials: "same-origin", body: form });
  return parseResponse<T>(res);
}

// Backwards-compatible aliases used by existing pages / SWR fetchers.
export const getJSON = apiGet;
export const postJSON = apiPost;
