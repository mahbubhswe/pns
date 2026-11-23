import type { Metadata } from "next";
import TrackView from "@/components/track/TrackView";
import { getPublicSettings } from "@/features/settings";
import { visibleHomeSections } from "@/lib/shared/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Track your application" };

export default async function TrackPage() {
  const settings = await getPublicSettings();
  return <TrackView site={settings.site} sections={visibleHomeSections(settings)} registrationOpen={settings.registration.open} />;
}
