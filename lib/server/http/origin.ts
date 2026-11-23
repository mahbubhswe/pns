import type { NextRequest } from "next/server";
import { env } from "@/lib/config/env";

/** Public base URL for links in emails: the configured app URL, else the request's own origin. */
export function publicOrigin(req: NextRequest): string {
  return (env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin).replace(/\/+$/, "");
}
