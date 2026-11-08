"use client";

import React, { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddRounded from "@mui/icons-material/AddRounded";
import AssessmentRounded from "@mui/icons-material/AssessmentRounded";
import TrendingUpRounded from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRounded from "@mui/icons-material/TrendingDownRounded";
import AccountBalanceWalletRounded from "@mui/icons-material/AccountBalanceWalletRounded";
import SavingsRounded from "@mui/icons-material/SavingsRounded";
import SyncRounded from "@mui/icons-material/SyncRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import ReceiptLongRounded from "@mui/icons-material/ReceiptLongRounded";
import Swal from "sweetalert2";
import PageGate from "@/components/dashboard/PageGate";
import { EmptyState, Grid, PageHeader, SectionCard, StatCard, TypeChip, TYPE_META } from "@/components/dashboard/ui";
import { IncomeExpenseChart, RankBars, useFinanceColors } from "@/components/dashboard/charts";
import { accountingError, useAccounts } from "@/components/accounting/data";
import { apiGet, apiPost } from "@/lib/api";
import { useAdmin } from "@/lib/useAdmin";
import { formatDate, money } from "@/lib/format";
import type { AccountingSummary as Summary, MemberFeeSyncResponse } from "@/types/api";

export default function AccountingOverview() {
  const router = useRouter();
  const { can } = useAdmin();
  const colors = useFinanceColors();
  const { data, mutate } = useSWR<Summary>("/api/accounting/summary", apiGet);
  const { accounts } = useAccounts();
  const [sync, setSync] = useState<{ bkash: number | ""; bank: number | "" } | null>(null);
  const [syncErr, setSyncErr] = useState("");
  const year = new Date().getFullYear();

  const openSync = () => {
    setSyncErr("");
    setSync({
      bkash: accounts.find(a => a.type === "MOBILE_BANKING")?.id || "",
      bank: accounts.find(a => a.type === "BANK")?.id || "",
    });
  };

  const runSync = async () => {
    if (!sync) return;
    try {
      const r = await apiPost<MemberFeeSyncResponse>("/api/accounting/sync-member-fees", { bkashAccountId: sync.bkash, bankAccountId: sync.bank });
      setSync(null);
      await mutate();
      Swal.fire({ icon: "success", title: `${r.created} receipt${r.created === 1 ? "" : "s"} created`, text: r.skipped ? `${r.skipped} skipped — choose an account for that payment method.` : "Membership fees are now in the books.", confirmButtonColor: "#0F6E56" });
    } catch (e) {
      setSyncErr(accountingError(e, "Could not sync"));
    }
  };

  return (
    <PageGate title="Accounts overview" permission={["accounting.view", "accounting.reports"]}>
      <PageHeader
        eyebrow="Finance"
        title="Society accounts"
        subtitle={data ? `The money picture as of ${formatDate(data.asOf, "long")}. Every figure comes from posted vouchers.` : "The money picture for the society."}
        actions={
          <>
            {can("accounting.reports") && (
              <Button component={Link} href="/dashboard/accounting/reports" variant="outlined" startIcon={<AssessmentRounded />}>
                Reports
              </Button>
            )}
            {can("accounting.entry") && (
              <>
                <Button variant="outlined" color="secondary" startIcon={<TrendingDownRounded />} onClick={() => router.push("/dashboard/accounting/vouchers?new=EXPENSE")}>
                  Record expense
                </Button>
                <Button variant="contained" startIcon={<AddRounded />} onClick={() => router.push("/dashboard/accounting/vouchers?new=INCOME")}>
                  Record income
                </Button>
              </>
            )}
          </>
        }
      />

      {data && data.approvedMembersWithoutFeeEntry > 0 && can("accounting.entry") && (
        <Alert
          severity="info"
          icon={<SyncRounded />}
          sx={{ mb: 2.5, alignItems: "center" }}
          action={
            <Button color="inherit" size="small" onClick={openSync} sx={{ fontWeight: 700 }}>
              Add to books
            </Button>
          }
        >
          <strong>{data.approvedMembersWithoutFeeEntry}</strong> approved member{data.approvedMembersWithoutFeeEntry === 1 ? "" : "s"} paid a membership fee that isn&apos;t recorded as income yet.
        </Alert>
      )}

      {/* Hero balance */}
      <Card
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 2.5,
          border: "none",
          color: "#fff",
          background: "linear-gradient(125deg, #0A4F3E 0%, #0F6E56 60%, #178A6D 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "absolute", right: -60, bottom: -80, width: 260, height: 260, borderRadius: "50%", border: "36px solid rgba(255,255,255,.06)" }} />
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ md: "center" }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ opacity: 0.85, fontWeight: 600 }}>Total money with the society</Typography>
            <Typography sx={{ fontSize: { xs: 34, md: 46 }, fontWeight: 900, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{data ? money(data.totalBalance) : "—"}</Typography>
            <Typography sx={{ opacity: 0.8 }}>Cash in hand + bank + mobile wallets</Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ flex: 1.4 }}>
            {(data?.balances || []).map(b => (
              <Box key={b.id} sx={{ flex: 1, p: 1.75, borderRadius: 3, bgcolor: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.16)", minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, opacity: 0.85, fontWeight: 600 }} noWrap>
                  {b.name}
                </Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 800, fontVariantNumeric: "tabular-nums" }} noWrap>
                  {money(b.balance, { decimals: false })}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Card>

      <Grid min={210} sx={{ mb: 2.5 }}>
        <StatCard label="Income this month" value={data ? money(data.month.income, { decimals: false }) : "—"} tone="success" icon={<TrendingUpRounded />} />
        <StatCard label="Expenses this month" value={data ? money(data.month.expense, { decimals: false }) : "—"} tone="secondary" icon={<TrendingDownRounded />} />
        <StatCard label={`Income in ${year}`} value={data ? money(data.year.income, { decimals: false }) : "—"} tone="primary" icon={<SavingsRounded />} />
        <StatCard
          label={`Surplus in ${year}`}
          value={data ? money(data.year.net, { decimals: false, sign: true }) : "—"}
          tone={data && data.year.net < 0 ? "error" : "info"}
          icon={<AccountBalanceWalletRounded />}
          hint={data ? (data.year.net >= 0 ? "Income is ahead of spending" : "Spending is ahead of income") : " "}
        />
      </Grid>

      <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", lg: "1.7fr 1fr" }, mb: 2.5 }}>
        <SectionCard title="Income vs expenditure" subtitle="Last 12 months">
          {data ? <IncomeExpenseChart data={data.trend} height={320} /> : <Box sx={{ height: 320 }} />}
        </SectionCard>
        <SectionCard title={`Where money went in ${year}`} subtitle="Top expense heads">
          {data && data.year.topExpenses.length ? <RankBars rows={data.year.topExpenses} color={colors.expense} /> : <EmptyState title="No expenses yet" body="Expenses you record will be ranked here." />}
          {data && data.year.topIncome.length > 0 && (
            <>
              <Typography sx={{ fontWeight: 750, mt: 3, mb: 1.5 }}>Where money came from</Typography>
              <RankBars rows={data.year.topIncome} color={colors.income} />
            </>
          )}
        </SectionCard>
      </Box>

      <SectionCard
        title="Latest vouchers"
        noPad
        action={
          <Button component={Link} href="/dashboard/accounting/vouchers" size="small" endIcon={<ArrowForwardRounded />}>
            All vouchers
          </Button>
        }
      >
        {data && data.recent.length === 0 ? (
          <EmptyState icon={<ReceiptLongRounded />} title="No vouchers yet" body="Record the first income or expense and it will show up here." />
        ) : (
          <Box sx={{ px: 1, pb: 1 }}>
            {(data?.recent || []).map(v => (
              <Box
                key={v.id}
                component={Link}
                href={`/dashboard/accounting/vouchers/${v.id}`}
                sx={{ display: "flex", alignItems: "center", gap: 2, p: 1.5, borderRadius: 2.5, color: "inherit", textDecoration: "none", opacity: v.status === "VOID" ? 0.5 : 1, "&:hover": { bgcolor: "action.hover" } }}
              >
                <Box sx={{ width: 42, height: 42, borderRadius: 2.5, display: "grid", placeItems: "center", bgcolor: alpha(TYPE_META[v.type].color, 0.12), color: TYPE_META[v.type].color, flexShrink: 0 }}>
                  {v.type === "INCOME" ? <TrendingUpRounded /> : v.type === "EXPENSE" ? <TrendingDownRounded /> : <SyncRounded />}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700 }} noWrap>
                    {v.type === "TRANSFER" ? `${v.accountName} → ${v.toAccountName}` : v.headName}
                    {v.partyName ? <Typography component="span" color="text.secondary"> · {v.partyName}</Typography> : null}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {v.voucherNo} · {formatDate(v.date)} · {v.accountName}
                  </Typography>
                </Box>
                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                  <TypeChip type={v.type} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontVariantNumeric: "tabular-nums", color: TYPE_META[v.type].color, textDecoration: v.status === "VOID" ? "line-through" : "none", whiteSpace: "nowrap" }}>
                  {v.type === "INCOME" ? "+" : v.type === "EXPENSE" ? "−" : ""}
                  {money(v.amount, { decimals: false })}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </SectionCard>

      <Dialog open={!!sync} onClose={() => setSync(null)} fullWidth maxWidth="xs">
        <DialogTitle>Add membership fees to the books</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            One receipt voucher is created per approved member, dated on their application day, under the “Membership Fee” head.
          </Typography>
          <Stack spacing={2}>
            <TextField select size="small" label="bKash payments go into" value={sync?.bkash ?? ""} onChange={e => setSync(s => s && { ...s, bkash: Number(e.target.value) })}>
              {accounts.map(a => (
                <MenuItem key={a.id} value={a.id}>
                  {a.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Bank payments go into" value={sync?.bank ?? ""} onChange={e => setSync(s => s && { ...s, bank: Number(e.target.value) })}>
              {accounts.map(a => (
                <MenuItem key={a.id} value={a.id}>
                  {a.name}
                </MenuItem>
              ))}
            </TextField>
            {syncErr && <Alert severity="error">{syncErr}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setSync(null)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={runSync} startIcon={<SyncRounded />}>
            Create receipts
          </Button>
        </DialogActions>
      </Dialog>
    </PageGate>
  );
}
