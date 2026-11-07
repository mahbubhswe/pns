"use client";

import dynamic from "next/dynamic";

// Profile reads browser-only APIs (canvas cropping), so it renders client-side only.
const Profile = dynamic(() => import("@/components/Profile"), { ssr: false });

export default function ProfilePage() {
  return <Profile />;
}
