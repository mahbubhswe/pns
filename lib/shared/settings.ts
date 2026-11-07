/**
 * Site settings: admin-editable configuration stored in the `SiteSetting`
 * table and exposed to the UI. Isomorphic (no Node imports).
 *
 * The constants in ./membership.ts are only the *defaults* used before an
 * admin has saved anything; runtime values always come from the database via
 * `features/settings`.
 */
import { MEMBERSHIP_FEE_BANK, MEMBERSHIP_FEE_BKASH, PAYMENT_DETAILS, type PaymentMethod } from "./membership";

export type HeroSlide = { src: string; alt: string };
export type TitledItem = { title: string; body: string };
export type FaqItem = { question: string; answer: string };

export type SiteSettings = {
  site: {
    name: string;
    shortName: string;
    tagline: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
  };
  payment: {
    feeBkash: number;
    feeBank: number;
    bkashNumber: string;
    bankName: string;
    bankAccountName: string;
    bankAccountNumber: string;
    bankRoutingNumber: string;
  };
  registration: {
    open: boolean;
    closedMessage: string;
  };
  /** Landing page content. Text fields may use the placeholders in HOME_PLACEHOLDERS. */
  home: {
    heroTitle: string;
    heroSubtitle: string;
    slides: HeroSlide[];
    aboutTitle: string;
    aboutIntro: string;
    aboutPoints: TitledItem[];
    stepsTitle: string;
    steps: TitledItem[];
    faqTitle: string;
    faqs: FaqItem[];
    ctaTitle: string;
    ctaBody: string;
  };
};

export const SETTINGS_SECTIONS = ["site", "payment", "registration", "home"] as const;
export type SettingsSection = (typeof SETTINGS_SECTIONS)[number];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  site: {
    name: "Purbachal Newtown Society",
    shortName: "PNS",
    tagline: "A community of Purbachal New Town plot owners.",
    contactEmail: "",
    contactPhone: "",
    address: "",
  },
  payment: {
    feeBkash: MEMBERSHIP_FEE_BKASH,
    feeBank: MEMBERSHIP_FEE_BANK,
    bkashNumber: PAYMENT_DETAILS.bkashNumber,
    bankName: PAYMENT_DETAILS.bank.name,
    bankAccountName: PAYMENT_DETAILS.bank.accountName,
    bankAccountNumber: PAYMENT_DETAILS.bank.accountNumber,
    bankRoutingNumber: PAYMENT_DETAILS.bank.routingNumber,
  },
  registration: {
    open: true,
    closedMessage: "Membership registration is currently closed. Please check back later.",
  },
  home: {
    heroTitle: "Join the Purbachal Community",
    heroSubtitle:
      "{siteName} is a volunteer-run community of Purbachal New Town plot owners. সদস্যপদ গ্রহণ করে উন্নয়নে অংশ নিন।",
    slides: [
      {
        src: "https://www.hellopurbachal.com/wp-content/uploads/2022/08/Purbachal-300-ft-lake-road.jpg",
        alt: "Purbachal 300 ft lake road",
      },
      {
        src: "https://www.hellopurbachal.com/wp-content/uploads/2022/08/Purbachal-300-ft-bridge.jpg",
        alt: "Purbachal 300 ft bridge",
      },
      {
        src: "https://www.hellopurbachal.com/wp-content/uploads/2022/08/Purbachal-300-lake.jpg",
        alt: "Purbachal 300 ft lake",
      },
    ],
    aboutTitle: "About Purbachal New Town",
    aboutIntro:
      "Bangladesh's largest planned township (by RAJUK), connected to Dhaka via a ~12.5 km expressway (aka “300 ft / July 36 Expressway”).",
    aboutPoints: [
      {
        title: "Scale & plan",
        body: "Master-planned sectors and arterial roads; residential & mixed-use zones.",
      },
      {
        title: "Location",
        body: "Northeast of Dhaka, spanning Rupganj (Narayanganj) & Kaliganj (Gazipur).",
      },
      { title: "Connectivity", body: "Fast link to Kuril Flyover and Kanchan Bridge." },
    ],
    stepsTitle: "How to join",
    steps: [
      {
        title: "1) Prepare Required Documents",
        body: "Keep these ready: ONE proof of land ownership (LD tax receipt with plot details OR mutation paper OR BDS khatian) plus NID number and owner's photo.",
      },
      {
        title: "2) Pay Membership Fee (BDT {fee})",
        body: "bKash (Send Money) {bkash} — Reference: your full name. Or transfer to {accountName}, A/C {accountNumber}, Routing {routing} at {bankName}.",
      },
      {
        title: "3) Complete the Online Registration",
        body: "Fill plot details, owner info, NID, contacts & addresses; provide bKash Txn ID / bank details; upload documents and photo.",
      },
    ],
    faqTitle: "Frequently Asked",
    faqs: [
      {
        question: "Is {siteName} officially registered?",
        answer: "{shortName} is in the process of obtaining legal registration and will launch its official website soon.",
      },
      {
        question: "How is my data handled?",
        answer:
          "Your information is used only for membership registration, identity verification, and administration, and is kept confidential and secure.",
      },
    ],
    ctaTitle: "Ready to become a member?",
    ctaBody: "Pay the fee, keep documents ready, and complete the quick online form.",
  },
};

export function feeForPaymentMethod(settings: SiteSettings, method: PaymentMethod): number {
  return method === "BANK" ? settings.payment.feeBank : settings.payment.feeBkash;
}

/** Placeholders admins may use in landing-page text. */
export const HOME_PLACEHOLDERS = [
  "{siteName}",
  "{shortName}",
  "{fee}",
  "{feeBank}",
  "{bkash}",
  "{bankName}",
  "{accountName}",
  "{accountNumber}",
  "{routing}",
] as const;

/** Replace `{placeholder}` tokens in landing-page text with live settings. */
export function renderTemplate(text: string, settings: SiteSettings): string {
  const values: Record<string, string> = {
    siteName: settings.site.name,
    shortName: settings.site.shortName,
    fee: String(settings.payment.feeBkash),
    feeBank: String(settings.payment.feeBank),
    bkash: settings.payment.bkashNumber,
    bankName: settings.payment.bankName,
    accountName: settings.payment.bankAccountName,
    accountNumber: settings.payment.bankAccountNumber,
    routing: settings.payment.bankRoutingNumber,
  };
  return text.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}
