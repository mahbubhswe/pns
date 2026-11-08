import { json, parseBody, readBody, route } from "@/lib/server/http";
import { requirePermission } from "@/features/access";
import { ACCOUNTING_READ, createLedgerHead, createLedgerHeadSchema, listLedgerHeads } from "@/features/accounting";
import type { LedgerHeadMutationResponse, LedgerHeadsResponse } from "@/types/api";

export const GET = route(async req => {
  await requirePermission(req, ACCOUNTING_READ);
  const body: LedgerHeadsResponse = { heads: await listLedgerHeads() };
  return json(body);
});

export const POST = route(async req => {
  await requirePermission(req, "accounting.setup");
  const input = parseBody(createLedgerHeadSchema, await readBody(req));
  const body: LedgerHeadMutationResponse = { ok: true, head: await createLedgerHead(input) };
  return json(body, 201);
});
