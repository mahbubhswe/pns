import { json, parseBody, parseQuery, readBody, route } from "@/lib/server/http";
import { requirePermission } from "@/features/access";
import { ACCOUNTING_READ, createVoucher, listVouchers, listVouchersQuerySchema, voucherInputSchema } from "@/features/accounting";
import type { VoucherMutationResponse } from "@/types/api";

export const GET = route(async req => {
  await requirePermission(req, ACCOUNTING_READ);
  const query = parseQuery(listVouchersQuerySchema, req.nextUrl.searchParams);
  return json(await listVouchers(query));
});

export const POST = route(async req => {
  const admin = await requirePermission(req, "accounting.entry");
  const input = parseBody(voucherInputSchema, await readBody(req));
  const body: VoucherMutationResponse = { ok: true, voucher: await createVoucher(input, admin.id) };
  return json(body, 201);
});
