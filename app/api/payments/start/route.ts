import { json, parseBody, publicOrigin, readBody, route } from "@/lib/server/http";
import { findUnpaidApplication, startPayment, startPaymentSchema } from "@/features/payment";
import { getPublicSettings } from "@/features/settings";
import type { StartPaymentResponse } from "@/types/api";

/** Public: pay (or retry paying) an application, proven by reference + phone. */
export const POST = route(async req => {
  const input = parseBody(startPaymentSchema, await readBody(req));
  const user = await findUnpaidApplication(input);
  const { site } = await getPublicSettings();
  const body: StartPaymentResponse = { paymentUrl: await startPayment(user, publicOrigin(req), site.name) };
  return json(body);
});
