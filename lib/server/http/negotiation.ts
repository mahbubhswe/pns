import { NextRequest, NextResponse } from "next/server";

/**
 * True when the request came from a plain HTML form submission (no JS), in
 * which case login endpoints redirect instead of returning JSON.
 */
export function wantsHtml(req: NextRequest): boolean {
  const accept = req.headers.get("accept") || "";
  const contentType = req.headers.get("content-type") || "";
  return accept.includes("text/html") || contentType.includes("application/x-www-form-urlencoded");
}

/** 303 redirect to a path on the same origin. */
export function redirectSeeOther(req: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, req.url), 303);
}
