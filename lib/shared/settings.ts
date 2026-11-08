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
/** "scenes" = the 20 animated neighbourhood illustrations; "photos" = the slides below. */
export type HeroStyle = "scenes" | "photos";
export const HERO_STYLES: readonly HeroStyle[] = ["scenes", "photos"];
export type TitledItem = { title: string; body: string };
/** A figure in the band under the hero, e.g. { value: "30", label: "Planned sectors", note: "in Purbachal New Town" }. */
export type StatItem = { value: string; label: string; note: string };
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
  /**
   * Landing page content. Text fields may use the placeholders in
   * HOME_PLACEHOLDERS; wrap words in *asterisks* to highlight them, and start a
   * new line for a second paragraph (e.g. the Bangla line).
   */
  home: {
    heroTitle: string;
    heroSubtitle: string;
    heroStyle: HeroStyle;
    slides: HeroSlide[];
    /** Figures under the hero (hidden when empty). */
    stats: StatItem[];
    aboutTitle: string;
    aboutIntro: string;
    aboutPoints: TitledItem[];
    benefitsTitle: string;
    benefitsIntro: string;
    benefits: TitledItem[];
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
    heroTitle: "A neighbourhood is built by its *neighbours.*",
    heroSubtitle:
      "{siteName} brings the plot owners of Purbachal New Town together — to speak with one voice, share news, and shape a safer, greener township.\nপূর্বাচলের প্লট মালিকদের সংগঠন — সদস্য হয়ে উন্নয়নে অংশ নিন।",
    heroStyle: "scenes",
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
    aboutTitle: "Bangladesh's largest planned township — *our future home.*",
    aboutIntro:
      "Planned by RAJUK to the northeast of Dhaka, Purbachal New Town is linked to the city by the ~12.5 km expressway many still call the “300 feet road” (July 36 Expressway).",
    aboutPoints: [
      {
        title: "Scale & plan",
        body: "Master-planned sectors and arterial roads, with residential and mixed-use zones.",
      },
      {
        title: "Location",
        body: "Northeast of Dhaka, spanning Rupganj (Narayanganj) and Kaliganj (Gazipur).",
      },
      { title: "Connectivity", body: "A fast link to Kuril Flyover on one side and Kanchan Bridge on the other." },
    ],
    benefitsTitle: "Neighbours who look out for each other",
    benefitsIntro:
      "We're plot owners just like you — volunteers who want Purbachal to grow into the town we were promised.",
    benefits: [
      { title: "One united voice", body: "Plot owners speak to RAJUK and other authorities together, instead of one by one." },
      { title: "Stay in the loop", body: "Notices about roads, utilities, allotments and meetings — straight from the committee." },
      { title: "Know your neighbours", body: "Meet the families you'll share a street with long before the houses are built." },
      { title: "Safer together", body: "Coordinated security, lighting and maintenance for the sectors we live in." },
      { title: "Greener township", body: "Push for parks, trees, lakes and footpaths that keep Purbachal liveable." },
      { title: "Open accounts", body: "Every taka received and spent is recorded in the society's books." },
    ],
    stepsTitle: "Three *simple* steps.",
    steps: [
      {
        title: "Prepare your documents",
        body: "One proof of land ownership — LD tax receipt with plot details, mutation paper or BDS khatian — plus the owner's NID number and a recent photo.",
      },
      {
        title: "Pay the one-time fee",
        body: "BDT {fee} by bKash Send Money to {bkash} (reference: your full name), or BDT {feeBank} to the society's bank account.",
      },
      {
        title: "Fill in the online form",
        body: "Plot details, owner information and payment reference. Upload your documents — you'll get your application PDF by email right away.",
      },
    ],
    faqTitle: "Things neighbours usually ask",
    faqs: [
      {
        question: "Who can become a member?",
        answer: "Any owner of a plot in Purbachal New Town can apply online with their plot details and one proof of ownership.",
      },
      {
        question: "What documents do I need?",
        answer:
          "One ownership proof (LD tax receipt with plot details, mutation paper or BDS khatian), the owner's NID number, a recent photo and your payment receipt or transaction ID.",
      },
      {
        question: "How do I know my application was received?",
        answer:
          "Right after you submit, we email you a PDF copy of your application. You can also log in to your member profile at any time to see whether it is pending or approved.",
      },
      {
        question: "Is {siteName} officially registered?",
        answer: "{shortName} is in the process of obtaining legal registration and will launch its official website soon.",
      },
      {
        question: "How is my data handled?",
        answer:
          "Your information is used only for membership registration, identity verification and administration, and is kept confidential and secure.",
      },
      {
        question: "Where does the membership fee go?",
        answer:
          "Every fee is recorded as income in the society's books, alongside every expense, so the committee can prepare clear financial reports.",
      },
    ],
    stats: [
      { value: "30", label: "Planned sectors", note: "in Purbachal New Town" },
      { value: "৳{fee}", label: "One-time fee", note: "paid once when you apply" },
      { value: "3", label: "Simple steps", note: "documents, payment, form" },
      { value: "100%", label: "Online", note: "apply & track from anywhere" },
    ],
    ctaTitle: "Ready to meet your neighbours?",
    ctaBody:
      "Pay the fee, keep your documents ready and complete the short online form. We'll take it from there.\nআজই সদস্য হোন — একসাথে গড়ি আমাদের পূর্বাচল।",
  },
};

/** Landing-page sections that can be hidden from settings (anchor ids on the home page). */
export type HomeSection = "about" | "why" | "join" | "fees" | "faq";

/** Which home-page sections have content, so header/footer links never point at a hidden section. */
export function visibleHomeSections(settings: SiteSettings): HomeSection[] {
  const { home, payment } = settings;
  const shown: HomeSection[] = [];
  if (home.aboutTitle || home.aboutIntro || home.aboutPoints.length > 0) shown.push("about");
  if (home.benefits.length > 0) shown.push("why");
  if (home.steps.length > 0) shown.push("join");
  if (payment.bkashNumber || payment.bankAccountNumber) shown.push("fees");
  if (home.faqs.length > 0) shown.push("faq");
  return shown;
}

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

/** Remove the `*highlight*` markers (for plain-text uses such as page titles). */
export function stripHighlights(text: string): string {
  return text.replace(/\*([^*]+)\*/g, "$1");
}

/** Drop a leading "1) " / "2. " style number, since the page numbers steps itself. */
export function stripStepNumber(text: string): string {
  return text.replace(/^\s*\d+\s*[).:-]\s*/, "");
}

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
