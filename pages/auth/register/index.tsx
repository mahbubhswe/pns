import React from "react";
import type { GetServerSideProps } from "next";
import RegistrationForm from "@/components/RegisterForm";
import { getPublicSettings } from "@/features/settings";
import type { SiteSettings } from "@/lib/shared/settings";

type Props = { settings: SiteSettings };

/** Fees, payment details and the open/closed flag come from the database. */
export const getServerSideProps: GetServerSideProps<Props> = async () => {
  return { props: { settings: await getPublicSettings() } };
};

export default function RegisterIndex({ settings }: Props) {
  return <RegistrationForm settings={settings} />;
}
