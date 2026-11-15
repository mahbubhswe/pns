import type { Metadata } from "next";
import { cookies } from "next/headers";
import DocumentsView from "@/components/documents/DocumentsView";
import { getMemberFromCookies } from "@/lib/server/auth";
import { getPublicSettings } from "@/features/settings";
import { listReadableDocuments, toSiteDocumentDto } from "@/features/documents";
import { visibleHomeSections } from "@/lib/shared/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Documents" };

export default async function DocumentsPage() {
  const isMember = Boolean(getMemberFromCookies(await cookies()));
  const [settings, docs] = await Promise.all([getPublicSettings(), listReadableDocuments({ member: isMember })]);
  return (
    <DocumentsView
      site={settings.site}
      sections={visibleHomeSections(settings)}
      registrationOpen={settings.registration.open}
      documents={docs.map(toSiteDocumentDto)}
      isMember={isMember}
    />
  );
}
