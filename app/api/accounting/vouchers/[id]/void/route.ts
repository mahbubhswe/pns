import { json, parseBody, parseIdParam, readBody, route } from "@/lib/server/http";
import { requirePermission } from "@/features/access";
import { voidVoucher, voidVoucherSchema } from "@/features/accounting";
import type { VoucherMutationResponse } from "@/types/api";

type Params = { id: string };

/** Vouchers are never deleted; voiding keeps the number and the audit trail. */
export const POST = route<Params>(async (req, { params }) => {
  const admin = await requirePermission(req, "accounting.void");
  const { reason } = parseBody(voidVoucherSchema, await readBody(req));
  const body: VoucherMutationResponse = { ok: true, voucher: await voidVoucher(parseIdParam(params.id), reason, admin.id) };
  return json(body);
});
