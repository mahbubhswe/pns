import { json, parseBody, publicOrigin, readBody, route } from "@/lib/server/http";
import { forgotPasswordSchema, requestPasswordReset } from "@/features/membership";
import { getPublicSettings } from "@/features/settings";
import type { OkResponse } from "@/types/api";

/** Always answers ok, so the form can't be used to find out who is a member. */
export const POST = route(async req => {
  const { email } = parseBody(forgotPasswordSchema, await readBody(req));
  const { site } = await getPublicSettings();
  await requestPasswordReset(email, publicOrigin(req), site.name);
  const body: OkResponse = { ok: true };
  return json(body);
});
