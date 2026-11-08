// components/accounting/data.ts — client-side types and SWR hooks for the accounting module.
import useSWR from "swr";
import { apiGet, errorMessage } from "@/lib/api";
import { DEFAULT_SITE_SETTINGS } from "@/lib/shared/settings";
import type { FundAccountDto, FundAccountsResponse, LedgerHeadDto, LedgerHeadsResponse, SettingsResponse, VoucherDto } from "@/types/api";

export type FundAccount = FundAccountDto;
export type LedgerHead = LedgerHeadDto;
export type Voucher = VoucherDto;

export const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  CASH: "Cash",
  BANK: "Bank",
  MOBILE_BANKING: "Mobile banking",
};

export function useAccounts() {
  const r = useSWR<FundAccountsResponse>("/api/accounting/accounts", apiGet);
  return { accounts: r.data?.accounts || [], loading: r.isLoading, mutate: r.mutate };
}

export function useHeads() {
  const r = useSWR<LedgerHeadsResponse>("/api/accounting/heads", apiGet);
  return { heads: r.data?.heads || [], loading: r.isLoading, mutate: r.mutate };
}

/** Friendly sentence from an API error (first field message for validation failures). */
export function accountingError(err: unknown, fallback = "Something went wrong"): string {
  return errorMessage(err, fallback);
}

/** Society name/address for printed vouchers and reports (dashboard → Settings). */
export function useSociety() {
  const r = useSWR<SettingsResponse>("/api/settings/public", apiGet, { revalidateOnFocus: false });
  const site = r.data?.settings.site ?? DEFAULT_SITE_SETTINGS.site;
  return { name: site.name, shortName: site.shortName, address: site.address };
}
