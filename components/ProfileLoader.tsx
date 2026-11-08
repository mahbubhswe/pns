"use client";

import dynamic from "next/dynamic";
import type { HomeSection, SiteSettings } from "@/lib/shared/settings";

// Profile reads browser-only APIs (canvas cropping), so it renders client-side only.
const Profile = dynamic(() => import("@/components/Profile"), { ssr: false });

export default function ProfileLoader(props: { site: SiteSettings["site"]; sections: HomeSection[] }) {
  return <Profile {...props} />;
}
