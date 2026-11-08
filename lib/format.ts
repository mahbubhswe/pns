// lib/format.ts — friendly formatting helpers shared by the public site and the admin portal.

const bdt = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const bdtShort = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ৳ 1,25,000.00 — Bangladeshi digit grouping (lakh/crore). */
export function money(value: number | null | undefined, opts: { decimals?: boolean; sign?: boolean } = {}): string {
  const n = Number(value || 0);
  const abs = Math.abs(n);
  const body = opts.decimals === false ? bdtShort.format(abs) : bdt.format(abs);
  const sign = n < 0 ? "−" : opts.sign && n > 0 ? "+" : "";
  return `${sign}৳ ${body}`;
}

/** Compact axis/tile label: ৳12.5K, ৳3.2L (lakh), ৳1.1Cr (crore). */
export function moneyCompact(value: number | null | undefined): string {
  const n = Number(value || 0);
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  const t = (x: number, d: number) => x.toFixed(d).replace(/\.0$/, "");
  if (abs >= 1e7) return `${sign}৳${t(abs / 1e7, abs >= 1e8 ? 0 : 1)}Cr`;
  if (abs >= 1e5) return `${sign}৳${t(abs / 1e5, abs >= 1e6 ? 0 : 1)}L`;
  if (abs >= 1e3) return `${sign}৳${t(abs / 1e3, abs >= 1e4 ? 0 : 1)}K`;
  return `${sign}৳${abs.toFixed(0)}`;
}

export function formatDate(value: string | Date | null | undefined, style: "short" | "long" = "short"): string {
  if (!value) return "—";
  const d = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00Z`) : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
    timeZone: typeof value === "string" && value.length === 10 ? "UTC" : undefined,
  });
}

export function timeAgo(value: string | Date | null | undefined): string {
  if (!value) return "never";
  const diff = Date.now() - new Date(value).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} day${d > 1 ? "s" : ""} ago`;
  return formatDate(value as string | Date);
}

export function initials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return "Working late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/** Local today as YYYY-MM-DD (for date inputs). */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function firstOfMonthISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export function downloadCsv(filename: string, header: string[], rows: Array<Array<unknown>>) {
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [header.map(esc).join(","), ...rows.map(r => r.map(esc).join(","))].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function belowThousand(n: number): string {
  const parts: string[] = [];
  if (n >= 100) {
    parts.push(`${ONES[Math.floor(n / 100)]} hundred`);
    n %= 100;
  }
  if (n >= 20) {
    parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : ""));
  } else if (n > 0) {
    parts.push(ONES[n]);
  }
  return parts.join(" ");
}

/** 125050.5 -> "Taka one lakh twenty-five thousand fifty and paisa fifty only" (Bangladeshi system). */
export function amountInWords(value: number): string {
  const n = Math.abs(Number(value) || 0);
  let taka = Math.floor(n);
  const paisa = Math.round((n - taka) * 100);
  if (taka === 0 && paisa === 0) return "Taka zero only";
  const parts: string[] = [];
  const crore = Math.floor(taka / 1e7);
  taka %= 1e7;
  const lakh = Math.floor(taka / 1e5);
  taka %= 1e5;
  const thousand = Math.floor(taka / 1000);
  taka %= 1000;
  if (crore) parts.push(`${crore >= 1000 ? amountInWords(crore).replace(/^Taka |\s?only$/g, "") : belowThousand(crore)} crore`);
  if (lakh) parts.push(`${belowThousand(lakh)} lakh`);
  if (thousand) parts.push(`${belowThousand(thousand)} thousand`);
  if (taka) parts.push(belowThousand(taka));
  let words = `Taka ${parts.join(" ") || "zero"}`;
  if (paisa) words += ` and paisa ${belowThousand(paisa)}`;
  return `${words} only`;
}
