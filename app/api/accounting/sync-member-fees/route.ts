import { json, parseBody, readBody, route } from "@/lib/server/http";
import { requirePermission } from "@/features/access";
import { memberFeeSyncSchema, previewMemberFeeSync, syncMemberFees } from "@/features/accounting";
import type { MemberFeeSyncPreview, MemberFeeSyncResponse } from "@/types/api";

/** How many approved members still have no receipt voucher for their fee. */
export const GET = route(async req => {
  await requirePermission(req, "accounting.entry");
  const body: MemberFeeSyncPreview = await previewMemberFeeSync();
  return json(body);
});

/** Create one receipt voucher per approved member that doesn't have one yet. */
export const POST = route(async req => {
  const admin = await requirePermission(req, "accounting.entry");
  const input = parseBody(memberFeeSyncSchema, await readBody(req));
  const result = await syncMemberFees(input, admin.id);
  const body: MemberFeeSyncResponse = { ok: true, ...result };
  return json(body);
});
