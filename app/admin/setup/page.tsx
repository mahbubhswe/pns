import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SetupForm from "@/components/admin/SetupForm";
import { needsInitialSetup } from "@/features/management-user";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Initial Setup" };

/**
 * First-run page. Reachable only while the ManagementUser table is empty;
 * afterwards the server redirects to the normal admin login.
 */
export default async function AdminSetupPage() {
  if (!(await needsInitialSetup())) redirect("/admin/login");
  return <SetupForm />;
}
