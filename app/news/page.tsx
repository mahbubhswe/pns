import type { Metadata } from "next";
import { cookies } from "next/headers";
import { NewsListView } from "@/components/news/NewsViews";
import { getMemberFromCookies } from "@/lib/server/auth";
import { getPublicSettings } from "@/features/settings";
import { listReadablePosts, toPublicPostDto } from "@/features/post";
import { visibleHomeSections } from "@/lib/shared/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "News & notices" };

export default async function NewsPage() {
  const isMember = Boolean(getMemberFromCookies(await cookies()));
  const [settings, posts] = await Promise.all([getPublicSettings(), listReadablePosts({ member: isMember }, 60)]);
  return (
    <NewsListView
      site={settings.site}
      sections={visibleHomeSections(settings)}
      registrationOpen={settings.registration.open}
      posts={posts.map(p => toPublicPostDto(p))}
      isMember={isMember}
    />
  );
}
