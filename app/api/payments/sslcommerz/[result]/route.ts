import { NextResponse } from "next/server";
import { json, publicOrigin, route } from "@/lib/server/http";
import { logger } from "@/lib/server/logger";
import { sendApplicationEmail } from "@/features/membership";
import { confirmPayment, markPaymentFailed } from "@/features/payment";

type Params = { result: string };

/**
 * SSLCommerz posts here (form-encoded): /success, /fail and /cancel in the
 * applicant's browser, /ipn server-to-server. Only the gateway's validation
 * API decides whether a payment counts. Browsers are sent on to /payment/result.
 */
export const POST = route<Params>(async (req, { params }) => {
  const { result } = params;
  const form = await req.formData().catch(() => null);
  const get = (k: string) => {
    const v = form?.get(k);
    return typeof v === "string" && v ? v : null;
  };
  const origin = publicOrigin(req);
  const goTo = (status: string, ref?: string | null) =>
    NextResponse.redirect(`${origin}/payment/result?status=${status}${ref ? `&ref=${encodeURIComponent(ref)}` : ""}`, 303);

  try {
    if (result === "success" || result === "ipn") {
      const outcome = await confirmPayment(get("val_id"));
      if (outcome.newlyPaid && outcome.user) {
        // The application PDF + email go out once, when the payment is confirmed.
        await sendApplicationEmail(outcome.user).catch(err => logger.error("Application email failed", { error: String(err) }));
      }
      if (result === "ipn") return json({ ok: true });
      return goTo(outcome.paid ? "success" : "failed", outcome.user?.applicationRef ?? get("value_a"));
    }
    if (result === "fail" || result === "cancel") {
      const user = await markPaymentFailed(get("tran_id"));
      return goTo(result === "cancel" ? "cancelled" : "failed", user?.applicationRef ?? get("value_a"));
    }
  } catch (err) {
    logger.error("Payment callback failed", { result, error: String(err) });
    if (result === "ipn") return json({ ok: false }, 500);
    return goTo("failed", get("value_a"));
  }
  return json({ ok: false, error: "Not found" }, 404);
});
