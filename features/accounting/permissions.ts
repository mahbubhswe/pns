import type { Permission } from "@/lib/shared/permissions";

/** Anyone with any accounting permission can read the chart of accounts and vouchers. */
export const ACCOUNTING_READ: Permission[] = [
  "accounting.view",
  "accounting.entry",
  "accounting.void",
  "accounting.setup",
  "accounting.reports",
];
