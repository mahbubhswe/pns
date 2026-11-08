import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";
import { getPublicSettings } from "@/features/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Member Login" };

export default async function LoginPage() {
  const { site } = await getPublicSettings();
  return <LoginForm site={site} />;
}
