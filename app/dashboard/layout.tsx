import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/Layout";
import { getAdminFromCookies } from "@/lib/server/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "Dashboard", template: "%s | Dashboard" } };

/**
 * Every dashboard page is wrapped here. The token is verified server-side
 * (not just checked for presence as in proxy.ts), so an invalid or expired
 * admin cookie never renders the shell.
 */
export default async function Layout({ children }: { children: ReactNode }) {
  const admin = getAdminFromCookies(await cookies());
  if (!admin) redirect("/admin/login");
  return <DashboardLayout>{children}</DashboardLayout>;
}
