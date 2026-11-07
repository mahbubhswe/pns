import type { NextApiRequest, NextApiResponse } from "next";
import { serialize as serializeCookie } from "cookie";
import { createApiHandler } from "@/lib/server/handler";

const ADMIN_COOKIE = "admin_token";

const handler = createApiHandler(["POST"]);

handler.post((req: NextApiRequest, res: NextApiResponse) => {
  const cookie = serializeCookie(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
  res.setHeader("Set-Cookie", cookie);
  return res.status(200).json({ ok: true });
});

export default handler;
