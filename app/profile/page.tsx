import type { Metadata } from "next";
import { cookies } from "next/headers";
import ProfileLoader from "@/components/ProfileLoader";
import { getMemberFromCookies } from "@/lib/server/auth";
import { getPublicSettings } from "@/features/settings";
import { listMemberNotices, toPublicPostDto } from "@/features/post";
import { visibleHomeSections } from "@/lib/shared/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Profile" };

/**
 * Loads the society name and, for a verified member, the members-only notices
 * on the server; the profile itself renders in the browser.
 */
export default async function ProfilePage() {
  const isMember = Boolean(getMemberFromCookies(await cookies()));
  const [settings, notices] = await Promise.all([getPublicSettings(), isMember ? listMemberNotices(6) : Promise.resolve([])]);
  return (
    <ProfileLoader site={settings.site} sections={visibleHomeSections(settings)} notices={notices.map(n => toPublicPostDto(n))} />
  );
}
