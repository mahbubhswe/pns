import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { needsInitialSetup } from "@/features/management-user";
import { getPublicSettings } from "@/features/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Management Login" };

/** No management user yet? Send the visitor to first-run setup instead. */
export default async function AdminLoginPage() {
  if (await needsInitialSetup()) redirect("/admin/setup");
  const { site } = await getPublicSettings();
  return <AdminLoginForm site={site} />;
}
