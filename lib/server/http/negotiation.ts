import type { NextApiRequest, NextApiResponse } from "next";

/**
 * True when the request came from a plain HTML form submission (no JS), in
 * which case login endpoints redirect instead of returning JSON.
 */
export function wantsHtml(req: NextApiRequest): boolean {
  const accept = String(req.headers.accept || "");
  const contentType = String(req.headers["content-type"] || "");
  return accept.includes("text/html") || contentType.includes("application/x-www-form-urlencoded");
}

export function redirectSeeOther(res: NextApiResponse, location: string) {
  res.statusCode = 303;
  res.setHeader("Location", location);
  res.end();
}
