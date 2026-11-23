import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { getPublicSettings } from "@/features/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Forgot password" };

export default async function ForgotPasswordPage() {
  const { site } = await getPublicSettings();
  return <ForgotPasswordForm site={site} />;
}
