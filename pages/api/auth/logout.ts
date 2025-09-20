// pages/api/auth/logout.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { serialize as serializeCookie } from "cookie";
import { createApiHandler } from "@/lib/server/handler";

const handler = createApiHandler(["POST"]);

handler.post((req: NextApiRequest, res: NextApiResponse) => {
  const host = req.headers.host || "";
  const isLocalhost = /^(localhost|127\.0\.0\.1)(:\\d+)?$/.test(host);

  const cookie = serializeCookie("pns_token", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: !isLocalhost && process.env.NODE_ENV === "production",
    maxAge: 0,
  });
  res.setHeader("Set-Cookie", cookie);
  return res.status(200).json({ ok: true });
});

export default handler;
