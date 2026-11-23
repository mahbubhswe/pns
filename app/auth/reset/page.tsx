import type { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { getPublicSettings } from "@/features/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Set your password", robots: { index: false } };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const [{ site }, { token }] = await Promise.all([getPublicSettings(), searchParams]);
  return <ResetPasswordForm site={site} token={token ?? ""} />;
}
