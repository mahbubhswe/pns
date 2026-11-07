import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@/lib/generated/prisma";
import { ApiError } from "./errors";
import { applyCors, corsPreflight } from "./cors";
import { logger } from "@/lib/server/logger";

/** Shape of every error response produced by the API. */
export type ApiErrorBody = {
  ok: false;
  error: string;
  code: string;
  details?: unknown;
};

/** Translate any thrown value into an HTTP status + JSON body. */
export function toErrorResponse(err: unknown): { status: number; body: ApiErrorBody } {
  if (err instanceof ApiError) {
    return {
      status: err.status,
      body: { ok: false, error: err.message, code: err.code, details: err.details },
    };
  }

  if (err instanceof ZodError) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: err.issues.map(i => ({ path: i.path.join("."), message: i.message })),
      },
    };
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = Array.isArray(err.meta?.target) ? err.meta?.target.join(", ") : "value";
      return {
        status: 409,
        body: { ok: false, error: `A record with this ${target} already exists`, code: "CONFLICT" },
      };
    }
    if (err.code === "P2025") {
      return { status: 404, body: { ok: false, error: "Not found", code: "NOT_FOUND" } };
    }
  }

  const exposeDetail = process.env.NODE_ENV !== "production";
  return {
    status: 500,
    body: {
      ok: false,
      error: "Server error",
      code: "INTERNAL_ERROR",
      ...(exposeDetail ? { details: (err as Error)?.message ?? String(err) } : {}),
    },
  };
}

// ---------------------------------------------------------------------------
// Route handler wrapper

export type RouteParams = Record<string, string | string[] | undefined>;

/** What Next.js passes as the second argument to a Route Handler. */
export type RouteContext<P extends RouteParams = RouteParams> = { params: Promise<P> };

export type RouteHandler<P extends RouteParams = RouteParams> = (
  req: NextRequest,
  ctx: { params: P }
) => Promise<Response> | Response;

export type RouteOptions = {
  /** Add CORS headers (and handle errors with them too) for these methods. */
  cors?: string[];
};

/**
 * Wrap a Route Handler with centralised error mapping and optional CORS.
 *
 *   export const GET = route<{ id: string }>(async (req, { params }) => {
 *     requireAdmin(req);
 *     const post = await getPostById(parseIdParam(params.id));
 *     return json({ post: toPostDto(post) });
 *   });
 */
export function route<P extends RouteParams = RouteParams>(handler: RouteHandler<P>, options: RouteOptions = {}) {
  return async (req: NextRequest, ctx?: RouteContext<P>): Promise<Response> => {
    let res: Response;
    try {
      const params = ((await ctx?.params) ?? {}) as P;
      res = await handler(req, { params });
    } catch (err) {
      const { status, body } = toErrorResponse(err);
      if (status >= 500) logger.error("Unhandled API error", err);
      res = NextResponse.json(body, { status });
    }
    if (options.cors) applyCors(req, res, options.cors);
    return res;
  };
}

/** `OPTIONS` export for CORS-enabled routes. */
export function preflight(methods: string[]) {
  return (req: NextRequest) => corsPreflight(req, methods);
}

/** JSON response helper: `json(body)` or `json(body, 201)`. */
export function json<T>(data: T, init?: number | ResponseInit): NextResponse {
  return NextResponse.json(data, typeof init === "number" ? { status: init } : init);
}

/**
 * Read a request body as a plain object. Accepts JSON, URL-encoded forms and
 * multipart text fields (files are ignored here; use `parseMultipart`).
 */
export async function readBody(req: NextRequest): Promise<unknown> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await req.json();
    } catch {
      throw ApiError.badRequest("Invalid JSON body");
    }
  }

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const out: Record<string, string> = {};
    form.forEach((value, key) => {
      if (typeof value === "string" && !(key in out)) out[key] = value;
    });
    return out;
  }

  const text = await req.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw ApiError.badRequest("Unsupported request body");
  }
}
