import { z } from "zod";

/** Dashboard → Site settings → Online payment. An empty password keeps the saved one. */
export const updateGatewaySchema = z.object({
  enabled: z.boolean(),
  sandbox: z.boolean(),
  storeId: z.string().trim().max(100),
  storePassword: z.string().trim().max(200).optional(),
});
export type UpdateGatewayInput = z.infer<typeof updateGatewaySchema>;

/** Public "pay now" for an application that is still unpaid: same proof as the tracker. */
export const startPaymentSchema = z.object({
  ref: z.string().trim().toUpperCase().min(1, "Enter your reference number").max(40),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine(v => v.replace(/\D/g, "").length >= 10, "Enter the phone number you used on the form"),
});
export type StartPaymentInput = z.infer<typeof startPaymentSchema>;
