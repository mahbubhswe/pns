import { json, parseBody, readBody, route } from "@/lib/server/http";
import { requirePermission } from "@/features/access";
import { ACCOUNTING_READ, createFundAccount, createFundAccountSchema, listFundAccounts } from "@/features/accounting";
import type { FundAccountMutationResponse, FundAccountsResponse } from "@/types/api";

export const GET = route(async req => {
  await requirePermission(req, ACCOUNTING_READ);
  const body: FundAccountsResponse = { accounts: await listFundAccounts() };
  return json(body);
});

export const POST = route(async req => {
  await requirePermission(req, "accounting.setup");
  const input = parseBody(createFundAccountSchema, await readBody(req));
  const body: FundAccountMutationResponse = { ok: true, account: await createFundAccount(input) };
  return json(body, 201);
});
