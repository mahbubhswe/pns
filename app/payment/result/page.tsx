import type { Metadata } from "next";
import PaymentResult from "@/components/payment/PaymentResult";
import { getPublicSettings } from "@/features/settings";
import { visibleHomeSections } from "@/lib/shared/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Payment", robots: { index: false } };

type Search = { status?: string; ref?: string };

/** Display only: the payment itself is recorded by the gateway callback, not by this page. */
export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<Search> }) {
  const [settings, sp] = await Promise.all([getPublicSettings(), searchParams]);
  const status = sp.status === "success" || sp.status === "cancelled" ? sp.status : "failed";
  const ref = /^[A-Z0-9-]{1,40}$/i.test(sp.ref ?? "") ? (sp.ref as string) : "";
  return (
    <PaymentResult
      status={status}
      applicationRef={ref}
      site={settings.site}
      sections={visibleHomeSections(settings)}
      registrationOpen={settings.registration.open}
    />
  );
}
