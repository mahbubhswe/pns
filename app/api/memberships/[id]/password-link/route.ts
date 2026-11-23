import { json, parseBody, parseIdParam, publicOrigin, readBody, route } from "@/lib/server/http";
import { PASSWORD_SETUP_TTL_SECONDS } from "@/lib/config/constants";
import { requirePermission } from "@/features/access";
import { createPasswordSetupLink, passwordLinkSchema } from "@/features/membership";
import { getPublicSettings } from "@/features/settings";
import type { PasswordLinkResponse } from "@/types/api";

type Params = { id: string };

/** Staff: create a password set-up link for a member (imported members need one to log in). */
export const POST = route<Params>(async (req, { params }) => {
  await requirePermission(req, "members.manage");
  const { sendEmail } = parseBody(passwordLinkSchema, await readBody(req));
  const { site } = await getPublicSettings();
  const link = await createPasswordSetupLink(parseIdParam(params.id), publicOrigin(req), site.name, sendEmail);
  const body: PasswordLinkResponse = { ok: true, expiresInDays: PASSWORD_SETUP_TTL_SECONDS / 86400, ...link };
  return json(body);
});
