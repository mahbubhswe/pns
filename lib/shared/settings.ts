/**
 * Site settings: admin-editable configuration stored in the `SiteSetting`
 * table and exposed to the UI. Isomorphic (no Node imports).
 *
 * The constants in ./membership.ts are only the *defaults* used before an
 * admin has saved anything; runtime values always come from the database via
 * `features/settings`.
 */
import { MEMBERSHIP_FEE_BANK, MEMBERSHIP_FEE_BKASH, PAYMENT_DETAILS, type MemberType, type PaymentMethod } from "./membership";

export type HeroSlide = { src: string; alt: string };
/** "scenes" = the 20 animated neighbourhood illustrations; "photos" = the slides below. */
export type HeroStyle = "scenes" | "photos";
export const HERO_STYLES: readonly HeroStyle[] = ["scenes", "photos"];
export type TitledItem = { title: string; body: string };
/** A figure in the band under the hero, e.g. { value: "30", label: "Planned sectors", note: "in Purbachal New Town" }. */
export type StatItem = { value: string; label: string; note: string };
export type FaqItem = { question: string; answer: string };
/** A photo in the home-page gallery (uploaded from Dashboard → Landing page). */
export type GalleryItem = { src: string; caption: string };
/** Home-page blocks an admin can switch off (Dashboard → Landing page). */
export type HomeBlock = "stats" | "about" | "why" | "gallery" | "join" | "fees" | "committee" | "news" | "faq" | "cta";
export const HOME_BLOCKS: Array<{ key: HomeBlock; label: string }> = [
  { key: "stats", label: "Figures under the hero" },
  { key: "about", label: "About" },
  { key: "why", label: "Why join" },
  { key: "gallery", label: "Gallery" },
  { key: "join", label: "How to join steps" },
  { key: "fees", label: "Fees & payment" },
  { key: "committee", label: "Executive committee" },
  { key: "news", label: "Latest news" },
  { key: "faq", label: "FAQ" },
  { key: "cta", label: "Final call to action" },
];

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
    /** Associate membership fees (a family member of a plot owner). */
    feeBkashAssociate: number;
    feeBankAssociate: number;
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
    /** Which home-page blocks are shown (a block also hides when it has no content). */
    show: Record<HomeBlock, boolean>;
    heroTitle: string;
    heroSubtitle: string;
    heroPrimaryLabel: string;
    heroSecondaryLabel: string;
    heroStyle: HeroStyle;
    slides: HeroSlide[];
    /** Figures under the hero (hidden when empty). */
    stats: StatItem[];
    aboutTitle: string;
    aboutIntro: string;
    /** Photo beside the About text; empty shows the township illustration. */
    aboutImage: string;
    aboutPoints: TitledItem[];
    galleryTitle: string;
    /** Photos for the gallery section (hidden when empty). */
    gallery: GalleryItem[];
    benefitsTitle: string;
    benefitsIntro: string;
    benefits: TitledItem[];
    stepsTitle: string;
    steps: TitledItem[];
    feesTitle: string;
    committeeTitle: string;
    faqTitle: string;
    faqs: FaqItem[];
    newsTitle: string;
    ctaTitle: string;
    ctaBody: string;
    ctaPrimaryLabel: string;
    ctaSecondaryLabel: string;
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
    feeBkashAssociate: MEMBERSHIP_FEE_BKASH,
    feeBankAssociate: MEMBERSHIP_FEE_BANK,
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
    show: { stats: true, about: true, why: true, gallery: true, join: true, fees: true, committee: true, news: true, faq: true, cta: true },
    heroTitle: "Welcome to *Purbachal Newtown Society*",
    heroSubtitle: "Be United – Make your voice heard",
    heroPrimaryLabel: "Become a member",
    heroSecondaryLabel: "Member login",
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
    aboutImage: "",
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
    galleryTitle: "Life in *Purbachal*",
    gallery: [],
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
        body: "Keep your ownership proof, NID and a recent photo ready.",
      },
      {
        title: "Fill in the online form",
        body: "Add your plot and personal details and upload the documents.",
      },
      {
        title: "Pay online",
        body: "Pay the membership fee securely, and your application is complete.",
      },
    ],
    feesTitle: "Membership fee",
    committeeTitle: "Meet your *committee*",
    faqTitle: "Things neighbours usually ask",
    faqs: [
      {
        question: "Who can become a member?",
        answer: "Any owner of a plot in Purbachal New Town can apply online with their plot details and one proof of ownership.",
      },
      {
        question: "What documents do I need?",
        answer:
          "One proof of land ownership (LD tax receipt, mutation paper or BDS khatian), the owner's NID number and a recent photo.",
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
      { value: "3", label: "Simple steps", note: "documents, form, payment" },
      { value: "100%", label: "Online", note: "apply & track from anywhere" },
    ],
    newsTitle: "Latest from the society",
    ctaPrimaryLabel: "Start registration",
    ctaSecondaryLabel: "Track my application",
    ctaTitle: "Ready to meet your neighbours?",
    ctaBody: "আজই সদস্য হোন — একসাথে গড়ি আমাদের পূর্বাচল।",
  },
};

/** Landing-page sections that can be hidden from settings (anchor ids on the home page). */
export type HomeSection = "about" | "why" | "gallery" | "join" | "fees" | "committee" | "faq";

/** Which home-page sections have content, so header/footer links never point at a hidden section. */
export function visibleHomeSections(settings: SiteSettings): HomeSection[] {
  const { home } = settings;
  const shown: HomeSection[] = [];
  if (home.show.about && (home.aboutTitle || home.aboutIntro || home.aboutPoints.length > 0)) shown.push("about");
  if (home.show.why && home.benefits.length > 0) shown.push("why");
  if (home.show.gallery && home.gallery.length > 0) shown.push("gallery");
  if (home.show.join && home.steps.length > 0) shown.push("join");
  if (home.show.fees) shown.push("fees");
  if (home.show.committee) shown.push("committee");
  if (home.show.faq && home.faqs.length > 0) shown.push("faq");
  return shown;
}

export function feeForPaymentMethod(settings: SiteSettings, method: PaymentMethod, type: MemberType = "GENERAL"): number {
  const p = settings.payment;
  if (type === "ASSOCIATE") return method === "BANK" ? p.feeBankAssociate : p.feeBkashAssociate;
  return method === "BANK" ? p.feeBank : p.feeBkash;
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
