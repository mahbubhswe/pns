import type { Metadata } from "next";
import RegistrationForm from "@/components/RegisterForm";
import { getPublicSettings } from "@/features/settings";
import { getActiveGateway } from "@/features/payment";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getPublicSettings();
  return {
    title: "Membership Registration",
    description: `Register for ${site.name} membership and submit your ownership details, then pay the fee online.`,
  };
}

/** Fees and the open/closed flag come from the database; applications need online payment to be on. */
export default async function RegisterPage() {
  const [settings, gateway] = await Promise.all([getPublicSettings(), getActiveGateway()]);
  return <RegistrationForm settings={settings} paymentReady={Boolean(gateway)} />;
}
