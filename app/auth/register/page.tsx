import type { Metadata } from "next";
import RegistrationForm from "@/components/RegisterForm";
import { getPublicSettings } from "@/features/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getPublicSettings();
  return {
    title: "Membership Registration",
    description: `Register for ${site.name} membership and submit your ownership details and payment receipt.`,
  };
}

/** Fees, payment details and the open/closed flag come from the database. */
export default async function RegisterPage() {
  const settings = await getPublicSettings();
  return <RegistrationForm settings={settings} />;
}
