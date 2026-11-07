import type { NextApiRequest, NextApiResponse } from "next";
import type { NextHandler } from "next-connect";
import { env } from "@/lib/config/env";

function allowedOrigins(): string[] {
  const candidates = [
    env.CORS_ALLOW_ORIGIN,
    env.NEXT_PUBLIC_APP_URL,
    env.NEXT_PUBLIC_SITE_URL,
    env.VERCEL_URL ? `https://${env.VERCEL_URL}` : undefined,
    env.NEXT_PUBLIC_VERCEL_URL ? `https://${env.NEXT_PUBLIC_VERCEL_URL}` : undefined,
  ].filter((v): v is string => Boolean(v));

  return candidates
    .flatMap(v => v.split(","))
    .map(v => v.trim())
    .filter(Boolean);
}

function resolveOrigin(requestOrigin: string | undefined): string {
  const allowed = allowedOrigins();
  const allowAny = allowed.length === 0 || allowed.includes("*");
  if (allowAny) return requestOrigin ?? "*";
  if (requestOrigin && allowed.includes(requestOrigin)) return requestOrigin;
  return allowed[0] ?? requestOrigin ?? "*";
}

/**
 * CORS middleware for the few public endpoints that may be called from other
 * origins (e.g. the registration form embedded elsewhere).
 */
export function cors(methods: string[] = ["POST", "OPTIONS"]) {
  return (req: NextApiRequest, res: NextApiResponse, next: NextHandler) => {
    res.setHeader("Access-Control-Allow-Origin", resolveOrigin(req.headers.origin));
    res.setHeader("Access-Control-Allow-Methods", methods.join(","));
    res.setHeader("Access-Control-Allow-Headers", env.CORS_ALLOW_HEADERS || "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "86400");
    res.setHeader("Vary", "Origin");
    return next();
  };
}
