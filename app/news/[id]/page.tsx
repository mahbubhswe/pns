import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { NewsArticleView } from "@/components/news/NewsViews";
import { getMemberFromCookies } from "@/lib/server/auth";
import { getPublicSettings } from "@/features/settings";
import { getReadablePost, toPublicPostDto } from "@/features/post";
import { visibleHomeSections } from "@/lib/shared/settings";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

async function load(idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const isMember = Boolean(getMemberFromCookies(await cookies()));
  const result = await getReadablePost(id, { member: isMember });
  // Drafts and staff-only posts are indistinguishable from missing ones.
  if (result.status === "not-found") notFound();
  return { result };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { result } = await load((await params).id);
  return { title: result.status === "ok" ? result.post.title : "Members-only notice" };
}

export default async function NewsArticlePage({ params }: Props) {
  const { result } = await load((await params).id);
  const settings = await getPublicSettings();
  return (
    <NewsArticleView
      site={settings.site}
      sections={visibleHomeSections(settings)}
      registrationOpen={settings.registration.open}
      post={result.status === "ok" ? toPublicPostDto(result.post, true) : null}
      loginRequired={result.status === "login-required"}
    />
  );
}
