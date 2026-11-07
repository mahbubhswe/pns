import { NextRequest, NextResponse } from "next/server";
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

function resolveOrigin(requestOrigin: string | null): string {
  const allowed = allowedOrigins();
  const allowAny = allowed.length === 0 || allowed.includes("*");
  if (allowAny) return requestOrigin ?? "*";
  if (requestOrigin && allowed.includes(requestOrigin)) return requestOrigin;
  return allowed[0] ?? requestOrigin ?? "*";
}

function corsHeaders(req: NextRequest, methods: string[]): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": resolveOrigin(req.headers.get("origin")),
    "Access-Control-Allow-Methods": methods.join(","),
    "Access-Control-Allow-Headers": env.CORS_ALLOW_HEADERS || "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

/** Add CORS headers to an existing response (public endpoints only). */
export function applyCors(req: NextRequest, res: Response, methods: string[]): void {
  for (const [key, value] of Object.entries(corsHeaders(req, methods))) res.headers.set(key, value);
}

/** Response for a CORS preflight (`OPTIONS`) request. */
export function corsPreflight(req: NextRequest, methods: string[]): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req, methods) });
}
