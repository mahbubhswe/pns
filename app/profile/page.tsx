import type { Metadata } from "next";
import ProfileLoader from "@/components/ProfileLoader";
import { getPublicSettings } from "@/features/settings";
import { visibleHomeSections } from "@/lib/shared/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Profile" };

/** Loads the society name from settings on the server; the profile itself renders in the browser. */
export default async function ProfilePage() {
  const settings = await getPublicSettings();
  return <ProfileLoader site={settings.site} sections={visibleHomeSections(settings)} />;
}
