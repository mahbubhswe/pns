import { json, parseBody, parseIdParam, readBody, route } from "@/lib/server/http";
import { requirePermission } from "@/features/access";
import { deleteLedgerHead, updateLedgerHead, updateLedgerHeadSchema } from "@/features/accounting";
import type { LedgerHeadMutationResponse } from "@/types/api";

type Params = { id: string };

export const PATCH = route<Params>(async (req, { params }) => {
  await requirePermission(req, "accounting.setup");
  const input = parseBody(updateLedgerHeadSchema, await readBody(req));
  const body: LedgerHeadMutationResponse = { ok: true, head: await updateLedgerHead(parseIdParam(params.id), input) };
  return json(body);
});

export const DELETE = route<Params>(async (req, { params }) => {
  await requirePermission(req, "accounting.setup");
  await deleteLedgerHead(parseIdParam(params.id));
  return json({ ok: true });
});
