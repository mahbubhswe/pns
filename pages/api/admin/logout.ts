import { createApiHandler } from "@/lib/server/http";
import { clearAuthCookie } from "@/lib/server/auth";
import { AUTH_COOKIES } from "@/lib/config/constants";

const handler = createApiHandler(["POST"]);

handler.post((req, res) => {
  clearAuthCookie(req, res, AUTH_COOKIES.admin);
  res.status(200).json({ ok: true });
});

export default handler;
