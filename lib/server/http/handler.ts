import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import type { NextHandler } from "next-connect";
import { ZodError } from "zod";
import { Prisma } from "@/lib/generated/prisma";
import { ApiError } from "./errors";
import { logger } from "@/lib/server/logger";

export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type AllowHeader = Array<Method | "OPTIONS">;

export type { NextHandler };

/**
 * A middleware or terminal handler. Middlewares call `next()` to continue;
 * handlers simply respond (or throw) and ignore `next`. One shape for both
 * keeps `(req, res) => ...` callbacks contextually typed.
 */
export type Handler<Req extends NextApiRequest = NextApiRequest> = (
  req: Req,
  res: NextApiResponse,
  next: NextHandler
) => unknown | Promise<unknown>;

export type Middleware<Req extends NextApiRequest = NextApiRequest> = Handler<Req>;
export type RouteHandler<Req extends NextApiRequest = NextApiRequest> = Handler<Req>;

export interface ApiHandler<Req extends NextApiRequest = NextApiRequest> {
  (req: NextApiRequest, res: NextApiResponse): Promise<void>;
  use(...fns: Handler<Req>[]): ApiHandler<Req>;
  get(...fns: Handler<Req>[]): ApiHandler<Req>;
  post(...fns: Handler<Req>[]): ApiHandler<Req>;
  put(...fns: Handler<Req>[]): ApiHandler<Req>;
  patch(...fns: Handler<Req>[]): ApiHandler<Req>;
  delete(...fns: Handler<Req>[]): ApiHandler<Req>;
}

export type CreateHandlerOptions = {
  /** Respond to OPTIONS automatically with an Allow header (default: true). */
  allowOptions?: boolean;
};

/** Shape of every error response produced by the API. */
export type ApiErrorBody = {
  ok: false;
  error: string;
  code: string;
  details?: unknown;
};

/**
 * Translate any thrown value into an HTTP status + JSON body.
 * Exported so multipart routes (which bypass next-connect's body parser) can
 * reuse the exact same mapping.
 */
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

  // Formidable size errors (httpCode 413) and similar.
  const maybeHttp = err as { httpCode?: number; message?: string };
  if (typeof maybeHttp?.httpCode === "number" && maybeHttp.httpCode >= 400 && maybeHttp.httpCode < 500) {
    return {
      status: maybeHttp.httpCode,
      body: {
        ok: false,
        error: maybeHttp.message || "Request rejected",
        code: ApiError.defaultCode(maybeHttp.httpCode),
      },
    };
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

export function sendError(res: NextApiResponse, err: unknown) {
  const { status, body } = toErrorResponse(err);
  if (status >= 500) logger.error("Unhandled API error", err);
  if (!res.headersSent) res.status(status).json(body);
}

/**
 * Create a method-aware API route with consistent 405 / OPTIONS handling and
 * centralised error mapping. Handlers may simply `throw ApiError.notFound()`.
 */
export function createApiHandler<Req extends NextApiRequest = NextApiRequest>(
  methods: Method[],
  options: CreateHandlerOptions = {}
): ApiHandler<Req> {
  const unique = Array.from(new Set(methods.map(m => m.toUpperCase()))) as Method[];
  const allowOptions = options.allowOptions !== false;
  const allowHeader: AllowHeader = allowOptions ? [...unique, "OPTIONS"] : [...unique];

  const router = createRouter<Req, NextApiResponse>();

  if (allowOptions) {
    router.use((req, res, next) => {
      if (req.method === "OPTIONS") {
        res.setHeader("Allow", allowHeader.join(", "));
        res.status(204).end();
        return;
      }
      return next();
    });
  }

  const handlerFn = router.handler({
    onError(err, _req, res) {
      sendError(res, err);
    },
    onNoMatch(_req, res) {
      res.setHeader("Allow", allowHeader.join(", "));
      res.status(405).json({ ok: false, error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" });
    },
  }) as unknown as ApiHandler<Req>;

  type RouterFn = (...fns: unknown[]) => unknown;
  const chain = (name: "use" | "get" | "post" | "put" | "patch" | "delete") => {
    const original = (router[name] as unknown as RouterFn).bind(router);
    return (...fns: unknown[]) => {
      original(...fns);
      return handlerFn;
    };
  };

  handlerFn.use = chain("use") as ApiHandler<Req>["use"];
  handlerFn.get = chain("get") as ApiHandler<Req>["get"];
  handlerFn.post = chain("post") as ApiHandler<Req>["post"];
  handlerFn.put = chain("put") as ApiHandler<Req>["put"];
  handlerFn.patch = chain("patch") as ApiHandler<Req>["patch"];
  handlerFn.delete = chain("delete") as ApiHandler<Req>["delete"];

  return handlerFn;
}
