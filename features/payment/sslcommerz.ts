// Minimal SSLCommerz client: create a checkout session, validate a payment.
// Docs: https://developer.sslcommerz.com/doc/v4/
import { logger } from "@/lib/server/logger";
import { ApiError } from "@/lib/server/http/errors";
import type { GatewayConfig } from "./gateway";

export type CheckoutInput = {
  tranId: string;
  amount: number;
  productName: string;
  customer: { name: string; email: string; phone: string; address: string };
  urls: { success: string; fail: string; cancel: string; ipn: string };
  /** Echoed back by the gateway; we send the application reference. */
  ref: string;
};

/** Returns the gateway page URL to send the applicant to. */
export async function createCheckout(gw: GatewayConfig, input: CheckoutInput): Promise<string> {
  const body = new URLSearchParams({
    store_id: gw.storeId,
    store_passwd: gw.storePassword ?? "",
    total_amount: input.amount.toFixed(2),
    currency: "BDT",
    tran_id: input.tranId,
    success_url: input.urls.success,
    fail_url: input.urls.fail,
    cancel_url: input.urls.cancel,
    ipn_url: input.urls.ipn,
    cus_name: input.customer.name,
    cus_email: input.customer.email,
    cus_phone: input.customer.phone,
    cus_add1: input.customer.address || "Purbachal",
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
    shipping_method: "NO",
    num_of_item: "1",
    product_name: input.productName,
    product_category: "Membership",
    product_profile: "non-physical-goods",
    value_a: input.ref,
  });
  let data: { status?: string; GatewayPageURL?: string; failedreason?: string };
  try {
    const res = await fetch(`${gw.baseUrl}/gwprocess/v4/api.php`, { method: "POST", body, cache: "no-store" });
    data = await res.json();
  } catch (err) {
    logger.error("SSLCommerz session request failed", { error: String(err) });
    throw ApiError.internal("Could not reach the payment gateway. Please try again in a minute.");
  }
  if (data.status !== "SUCCESS" || !data.GatewayPageURL) {
    logger.error("SSLCommerz session refused", { reason: data.failedreason, tranId: input.tranId });
    throw ApiError.internal("The payment gateway refused the request. Please contact the committee.");
  }
  return data.GatewayPageURL;
}

export type ValidatedPayment = { tranId: string; amount: number; currency: string; channel: string; valId: string; riskLevel: string };

/**
 * Ask the gateway whether `valId` is a real, completed payment. Never trust the
 * fields the browser posts to our success URL; only this answer counts.
 */
export async function validatePayment(gw: GatewayConfig, valId: string): Promise<ValidatedPayment | null> {
  const url = new URL(`${gw.baseUrl}/validator/api/validationserverAPI.php`);
  url.search = new URLSearchParams({ val_id: valId, store_id: gw.storeId, store_passwd: gw.storePassword ?? "", v: "1", format: "json" }).toString();
  try {
    const res = await fetch(url, { cache: "no-store" });
    const d = (await res.json()) as Record<string, string | undefined>;
    if (d.status !== "VALID" && d.status !== "VALIDATED") {
      logger.warn("SSLCommerz validation: not valid", { status: d.status, valId });
      return null;
    }
    return {
      tranId: String(d.tran_id ?? ""),
      amount: Number(d.amount ?? 0),
      currency: String(d.currency_type ?? d.currency ?? ""),
      channel: String(d.card_type ?? ""),
      valId,
      riskLevel: String(d.risk_level ?? "0"),
    };
  } catch (err) {
    logger.error("SSLCommerz validation failed", { error: String(err), valId });
    return null;
  }
}
