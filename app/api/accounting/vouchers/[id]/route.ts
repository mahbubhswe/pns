import { json, parseBody, parseIdParam, readBody, route } from "@/lib/server/http";
import { requirePermission } from "@/features/access";
import { ACCOUNTING_READ, getVoucher, updateVoucher, updateVoucherSchema } from "@/features/accounting";
import type { VoucherMutationResponse, VoucherResponse } from "@/types/api";

type Params = { id: string };

export const GET = route<Params>(async (req, { params }) => {
  await requirePermission(req, ACCOUNTING_READ);
  const body: VoucherResponse = { voucher: await getVoucher(parseIdParam(params.id)) };
  return json(body);
});

export const PATCH = route<Params>(async (req, { params }) => {
  await requirePermission(req, "accounting.entry");
  const input = parseBody(updateVoucherSchema, await readBody(req));
  const body: VoucherMutationResponse = { ok: true, voucher: await updateVoucher(parseIdParam(params.id), input) };
  return json(body);
});
