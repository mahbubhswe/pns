import type { Metadata } from "next";
import CommitteeView from "@/components/committee/CommitteeView";
import { getPublicSettings } from "@/features/settings";
import { listPublicCommittee, toCommitteeMemberDto } from "@/features/committee";
import { visibleHomeSections } from "@/lib/shared/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Executive committee" };

export default async function CommitteePage() {
  const [settings, members] = await Promise.all([getPublicSettings(), listPublicCommittee()]);
  return (
    <CommitteeView
      site={settings.site}
      sections={visibleHomeSections(settings)}
      registrationOpen={settings.registration.open}
      members={members.map(toCommitteeMemberDto)}
    />
  );
}
