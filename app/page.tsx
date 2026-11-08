import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";
import { getPublicSettings } from "@/features/settings";
import { listReadablePosts, toPublicPostDto } from "@/features/post";
import { renderTemplate } from "@/lib/shared/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  return {
    title: `${settings.site.name} — Membership`,
    description: renderTemplate(settings.site.tagline, settings) || `Join ${settings.site.name}.`,
  };
}

/** Landing page. All content is admin-editable (dashboard → Settings → Landing page). */
export default async function Page() {
  // Landing page: public posts only, even for a logged-in member.
  const [settings, posts] = await Promise.all([getPublicSettings(), listReadablePosts({ member: false }, 3)]);
  return <HomePage settings={settings} news={posts.map(p => toPublicPostDto(p))} />;
}
