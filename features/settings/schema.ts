import { z } from "zod";

const text = z.string().trim().max(500);
const longText = z.string().trim().max(2000);
const money = z.coerce.number().int().min(0).max(10_000_000);

export const siteSectionSchema = z.object({
  name: text.min(1, "Site name is required"),
  shortName: text.min(1, "Short name is required").max(20),
  tagline: text,
  contactEmail: z.union([z.literal(""), z.string().trim().email("Invalid contact email")]),
  contactPhone: text,
  address: text,
});

export const paymentSectionSchema = z.object({
  feeBkash: money,
  feeBank: money,
  bkashNumber: text,
  bankName: text,
  bankAccountName: text,
  bankAccountNumber: text,
  bankRoutingNumber: text,
});

export const registrationSectionSchema = z.object({
  open: z.boolean(),
  closedMessage: text,
});

const imageUrl = z
  .string()
  .trim()
  .min(1, "Image URL is required")
  .max(1000)
  .refine(v => v.startsWith("/") || /^https?:\/\//i.test(v), "Must be an absolute URL or a /uploads path");

const slideSchema = z.object({ src: imageUrl, alt: text });
const titledItemSchema = z.object({ title: text.min(1, "Title is required"), body: longText });
const faqSchema = z.object({ question: text.min(1, "Question is required"), answer: longText });

export const homeSectionSchema = z.object({
  heroTitle: text.min(1, "Hero title is required"),
  heroSubtitle: longText,
  heroStyle: z.enum(["scenes", "photos"], { message: "Choose scenes or photos" }),
  slides: z.array(slideSchema).min(1, "At least one slide is required").max(10),
  aboutTitle: text,
  aboutIntro: longText,
  aboutPoints: z.array(titledItemSchema).max(20),
  benefitsTitle: text,
  benefitsIntro: longText,
  benefits: z.array(titledItemSchema).max(20),
  stepsTitle: text,
  steps: z.array(titledItemSchema).max(20),
  faqTitle: text,
  faqs: z.array(faqSchema).max(50),
  ctaTitle: text,
  ctaBody: longText,
});

/** Full, validated settings object (what `getSettings()` returns). */
export const siteSettingsSchema = z.object({
  site: siteSectionSchema,
  payment: paymentSectionSchema,
  registration: registrationSectionSchema,
  home: homeSectionSchema,
});

/** PATCH body: any subset of sections, each a subset of its fields. */
export const updateSiteSettingsSchema = z
  .object({
    site: siteSectionSchema.partial().optional(),
    payment: paymentSectionSchema.partial().optional(),
    registration: registrationSectionSchema.partial().optional(),
    home: homeSectionSchema.partial().optional(),
  })
  .refine(v => Object.values(v).some(Boolean), { message: "Nothing to update" });

export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;
