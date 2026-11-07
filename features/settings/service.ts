import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma";
import { logger } from "@/lib/server/logger";
import {
  DEFAULT_SITE_SETTINGS,
  SETTINGS_SECTIONS,
  type SettingsSection,
  type SiteSettings,
} from "@/lib/shared/settings";
import { siteSettingsSchema, type UpdateSiteSettingsInput } from "./schema";

function isSection(key: string): key is SettingsSection {
  return (SETTINGS_SECTIONS as readonly string[]).includes(key);
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Current settings: database rows layered over the code defaults, then
 * validated. Unknown or corrupt rows never break the site; they fall back to
 * defaults and are logged.
 */
export async function getSettings(): Promise<SiteSettings> {
  const rows = await prisma.siteSetting.findMany();

  const merged: Record<SettingsSection, Record<string, unknown>> = {
    site: { ...DEFAULT_SITE_SETTINGS.site },
    payment: { ...DEFAULT_SITE_SETTINGS.payment },
    registration: { ...DEFAULT_SITE_SETTINGS.registration },
    home: { ...DEFAULT_SITE_SETTINGS.home },
  };

  for (const row of rows) {
    if (!isSection(row.key) || !isObject(row.value)) continue;
    merged[row.key] = { ...merged[row.key], ...row.value };
  }

  const parsed = siteSettingsSchema.safeParse(merged);
  if (!parsed.success) {
    logger.warn("Stored site settings are invalid; using defaults", parsed.error.issues);
    return DEFAULT_SITE_SETTINGS;
  }
  return parsed.data;
}

/** Settings that are safe to expose to anonymous visitors. */
export async function getPublicSettings(): Promise<SiteSettings> {
  // Everything stored today is public-facing (fees, bank details, site name).
  // Add filtering here if a private section is ever introduced.
  return getSettings();
}

export async function updateSettings(input: UpdateSiteSettingsInput, updatedById: number): Promise<SiteSettings> {
  const current = await getSettings();

  const writes = SETTINGS_SECTIONS.filter(section => input[section]).map(section => {
    const value = { ...current[section], ...input[section] } as Prisma.InputJsonObject;
    return prisma.siteSetting.upsert({
      where: { key: section },
      create: { key: section, value, updatedById },
      update: { value, updatedById },
    });
  });

  await prisma.$transaction(writes);
  return getSettings();
}
