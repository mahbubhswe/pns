// Online membership payment: start a checkout for an application, and record
// the result the gateway sends back (success / fail / cancel / IPN).
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import type { User } from "@/lib/generated/prisma";
import { ApiError } from "@/lib/server/http/errors";
import { logger } from "@/lib/server/logger";
import { getActiveGateway } from "./gateway";
import { createCheckout, validatePayment } from "./sslcommerz";
import type { StartPaymentInput } from "./schema";

const lastTenDigits = (v: string) => v.replace(/\D/g, "").slice(-10);

/** Unique per attempt, ≤ 30 characters as the gateway requires. */
function newTranId(userId: number): string {
  return `PNS${userId}T${Date.now().toString(36)}${randomBytes(3).toString("hex")}`.toUpperCase();
}

/** Create a checkout session for an unpaid application; returns the gateway URL. */
export async function startPayment(user: User, origin: string, siteName: string): Promise<string> {
  if (user.paymentStatus === "PAID") throw ApiError.badRequest("This application is already paid.");
  const gw = await getActiveGateway();
  if (!gw) throw ApiError.badRequest("Online payment is not available right now. Please try again later.");

  const tranId = newTranId(user.id);
  await prisma.user.update({ where: { id: user.id }, data: { paymentTranId: tranId, paymentMethod: "ONLINE" } });

  const cb = `${origin}/api/payments/sslcommerz`;
  return createCheckout(gw, {
    tranId,
    amount: user.membershipFee,
    productName: `${siteName} membership (${user.membershipType === "ASSOCIATE" ? "Associate" : "General"})`,
    customer: { name: user.ownerNameEnglish, email: user.email, phone: user.contactNumber, address: user.presentAddress },
    urls: { success: `${cb}/success`, fail: `${cb}/fail`, cancel: `${cb}/cancel`, ipn: `${cb}/ipn` },
    ref: user.applicationRef ?? "",
  });
}

/** "Pay now" from the tracker: reference + phone must match, like the tracker itself. */
export async function findUnpaidApplication(input: StartPaymentInput): Promise<User> {
  const user = await prisma.user.findUnique({ where: { applicationRef: input.ref } });
  if (!user || lastTenDigits(user.contactNumber) !== lastTenDigits(input.phone)) {
    throw ApiError.notFound("No application matches this reference and phone number.");
  }
  if (user.paymentStatus === "PAID") throw ApiError.badRequest("This application is already paid.");
  return user;
}

export type PaymentOutcome = { user: User | null; paid: boolean; newlyPaid: boolean };

/**
 * Confirm a payment from the gateway's callback. Only the gateway's own
 * validation answer is trusted; it must match our transaction id and the fee.
 * Safe to call more than once (success redirect and IPN both arrive).
 */
export async function confirmPayment(valId: string | null): Promise<PaymentOutcome> {
  const gw = await getActiveGateway();
  if (!gw || !valId) return { user: null, paid: false, newlyPaid: false };
  const v = await validatePayment(gw, valId);
  if (!v) return { user: null, paid: false, newlyPaid: false };

  const user = await prisma.user.findUnique({ where: { paymentTranId: v.tranId } });
  if (!user) {
    logger.warn("Payment for an unknown transaction", { tranId: v.tranId });
    return { user: null, paid: false, newlyPaid: false };
  }
  if (user.paymentStatus === "PAID") return { user, paid: true, newlyPaid: false };
  if (v.currency !== "BDT" || v.amount + 0.001 < user.membershipFee) {
    logger.warn("Payment amount mismatch", { userId: user.id, amount: v.amount, fee: user.membershipFee, currency: v.currency });
    return { user, paid: false, newlyPaid: false };
  }
  if (v.riskLevel === "1") logger.warn("Gateway flagged this payment as risky; check it before approving", { userId: user.id, tranId: v.tranId });

  // Conditional update: only one of the success redirect / IPN wins.
  const res = await prisma.user.updateMany({
    where: { id: user.id, paymentStatus: { not: "PAID" } },
    data: { paymentStatus: "PAID", paymentValId: v.valId, paymentChannel: v.channel || null, paidAt: new Date() },
  });
  const updated = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  return { user: updated, paid: true, newlyPaid: res.count === 1 };
}

/** Failed or cancelled at the gateway: the applicant can try again from the tracker. */
export async function markPaymentFailed(tranId: string | null): Promise<User | null> {
  if (!tranId) return null;
  const user = await prisma.user.findUnique({ where: { paymentTranId: tranId } });
  if (!user) return null;
  if (user.paymentStatus !== "PAID") {
    return prisma.user.update({ where: { id: user.id }, data: { paymentStatus: "FAILED" } });
  }
  return user;
}
