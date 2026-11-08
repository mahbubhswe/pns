import { json, parseBody, parseIdParam, readBody, route } from "@/lib/server/http";
import { requirePermission } from "@/features/access";
import { deleteFundAccount, updateFundAccount, updateFundAccountSchema } from "@/features/accounting";
import type { FundAccountMutationResponse } from "@/types/api";

type Params = { id: string };

export const PATCH = route<Params>(async (req, { params }) => {
  await requirePermission(req, "accounting.setup");
  const input = parseBody(updateFundAccountSchema, await readBody(req));
  const body: FundAccountMutationResponse = { ok: true, account: await updateFundAccount(parseIdParam(params.id), input) };
  return json(body);
});

export const DELETE = route<Params>(async (req, { params }) => {
  await requirePermission(req, "accounting.setup");
  await deleteFundAccount(parseIdParam(params.id));
  return json({ ok: true });
});
