// components/accounting/data.ts — client-side types and SWR hooks for the accounting module.
import useSWR from "swr";
import { getJSON } from "@/lib/api";

export type FundAccount = {
  id: number;
  name: string;
  type: "CASH" | "BANK" | "MOBILE_BANKING";
  accountNumber: string | null;
  institution: string | null;
  branch?: string | null;
  notes?: string | null;
  isActive: boolean;
  openingBalance: number;
  balance: number;
  voucherCount?: number;
};

export type LedgerHead = {
  id: number;
  name: string;
  code: string | null;
  type: "INCOME" | "EXPENSE";
  description: string | null;
  isActive: boolean;
  isSystem: boolean;
  voucherCount: number;
  total: number;
};

export type Voucher = {
  id: number;
  voucherNo: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  status: "POSTED" | "VOID";
  date: string;
  amount: number;
  headId: number | null;
  headName: string | null;
  headCode: string | null;
  accountId: number;
  accountName: string | null;
  toAccountId: number | null;
  toAccountName: string | null;
  partyName: string | null;
  reference: string | null;
  description: string | null;
  attachmentUrl: string | null;
  memberId: number | null;
  memberName: string | null;
  createdBy: string | null;
  voidReason: string | null;
  voidedAt: string | null;
  voidedBy: string | null;
  createdAt: string;
};

export const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  CASH: "Cash",
  BANK: "Bank",
  MOBILE_BANKING: "Mobile banking",
};

export function useAccounts() {
  const r = useSWR<{ accounts: FundAccount[] }>("/api/accounting/accounts", getJSON);
  return { accounts: r.data?.accounts || [], loading: r.isLoading, mutate: r.mutate };
}

export function useHeads() {
  const r = useSWR<{ heads: LedgerHead[] }>("/api/accounting/heads", getJSON);
  return { heads: r.data?.heads || [], loading: r.isLoading, mutate: r.mutate };
}
