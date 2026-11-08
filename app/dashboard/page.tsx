"use client";

import React from "react";
import useSWR from "swr";
import Link from "next/link";
import { Avatar, Box, Button, Card, Chip, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import Groups2Rounded from "@mui/icons-material/Groups2Rounded";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import HourglassTopRounded from "@mui/icons-material/HourglassTopRounded";
import DoNotDisturbOnRounded from "@mui/icons-material/DoNotDisturbOnRounded";
import AccountBalanceWalletRounded from "@mui/icons-material/AccountBalanceWalletRounded";
import TrendingUpRounded from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRounded from "@mui/icons-material/TrendingDownRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import ArticleRounded from "@mui/icons-material/ArticleRounded";
import BadgeRounded from "@mui/icons-material/BadgeRounded";
import PageGate from "@/components/dashboard/PageGate";
import { SectionCard, StatCard, StatusChip, EmptyState, Grid } from "@/components/dashboard/ui";
import { IncomeExpenseChart, SingleBarChart } from "@/components/dashboard/charts";
import { getJSON } from "@/lib/api";
import { useAdmin } from "@/lib/useAdmin";
import { formatDate, greeting, initials, money, timeAgo } from "@/lib/format";
import type { AccountingSummary, DashboardStats } from "@/types/api";

type Stats = DashboardStats;

const monthLabel = (key: string) => new Date(`${key}-01T00:00:00Z`).toLocaleString("en-US", { month: "short", timeZone: "UTC" });

export default function DashboardPage() {
  const theme = useTheme();
  const { admin, can } = useAdmin();
  const { data: stats } = useSWR<Stats>(can("dashboard.view") ? "/api/dashboard/stats" : null, getJSON);
  const showFinance = can(["accounting.view", "accounting.reports"]);
  const { data: fin } = useSWR<AccountingSummary>(showFinance ? "/api/accounting/summary" : null, getJSON);

  const s = stats;
  const firstName = admin?.name?.split(" ")[0] || "there";
  const approvalRate = s && s.total ? Math.round((s.active / s.total) * 100) : 0;

  return (
    <PageGate title="Dashboard" permission="dashboard.view">
      {/* Welcome band */}
      <Card
        sx={{
          mb: 3,
          p: { xs: 2.5, md: 3.5 },
          position: "relative",
          overflow: "hidden",
          color: "#fff",
          border: "none",
          background: `linear-gradient(120deg, ${theme.palette.mode === "light" ? "#0A4F3E" : "#0B3B2F"} 0%, #0F6E56 55%, #1E8E6E 100%)`,
        }}
      >
        <WelcomeArt />
        <Box sx={{ position: "relative", maxWidth: 640 }}>
          <Typography sx={{ opacity: 0.85, fontWeight: 600 }}>
            {greeting()}, {firstName} 👋
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.5, fontSize: { xs: 24, md: 32 } }}>
            {s ? (
              s.pending > 0 ? (
                <>
                  {s.pending} neighbour{s.pending > 1 ? "s are" : " is"} waiting for your review
                </>
              ) : (
                <>All applications are reviewed. Nice work!</>
              )
            ) : (
              "Loading today's picture…"
            )}
          </Typography>
          <Typography sx={{ mt: 1, opacity: 0.85 }}>
            Here&apos;s how Purbachal Newtown Society is doing today — members, money and messages in one place.
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 2.5 }}>
            {can("members.view") && (
              <Button component={Link} href="/dashboard/membership?status=pending" variant="contained" color="warning" endIcon={<ArrowForwardRounded />} sx={{ color: "#2B1A00" }}>
                Review applications
              </Button>
            )}
            {can("accounting.entry") && (
              <Button component={Link} href="/dashboard/accounting/vouchers?new=INCOME" variant="outlined" startIcon={<AddRounded />} sx={{ color: "#fff", borderColor: "rgba(255,255,255,.5)", "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,.08)" } }}>
                Record a receipt
              </Button>
            )}
          </Stack>
        </Box>
      </Card>

      <Grid min={220} sx={{ mb: 3 }}>
        <StatCard label="Total members" value={s?.total ?? "—"} icon={<Groups2Rounded />} hint={s ? `${approvalRate}% approved` : " "} href={can("members.view") ? "/dashboard/membership" : undefined} />
        <StatCard label="Approved" value={s?.active ?? "—"} tone="success" icon={<VerifiedRounded />} hint="Active members" href={can("members.view") ? "/dashboard/membership?status=active" : undefined} />
        <StatCard label="Pending review" value={s?.pending ?? "—"} tone="warning" icon={<HourglassTopRounded />} hint="Need a decision" href={can("members.view") ? "/dashboard/membership?status=pending" : undefined} />
        <StatCard label="Rejected" value={s?.inactive ?? "—"} tone="error" icon={<DoNotDisturbOnRounded />} hint="Not approved" href={can("members.view") ? "/dashboard/membership?status=inactive" : undefined} />
      </Grid>

      {showFinance && (
        <Grid min={220} sx={{ mb: 3 }}>
          <StatCard label="Money in hand & bank" value={fin ? money(fin.totalBalance, { decimals: false }) : "—"} tone="info" icon={<AccountBalanceWalletRounded />} hint={fin ? `${fin.balances.length} cash/bank accounts` : " "} href="/dashboard/accounting" />
          <StatCard label="Income this month" value={fin ? money(fin.month.income, { decimals: false }) : "—"} tone="success" icon={<TrendingUpRounded />} hint="Receipts recorded" />
          <StatCard label="Spent this month" value={fin ? money(fin.month.expense, { decimals: false }) : "—"} tone="secondary" icon={<TrendingDownRounded />} hint="Payments recorded" />
          <StatCard
            label="This month's balance"
            value={fin ? money(fin.month.net, { decimals: false, sign: true }) : "—"}
            tone={fin && fin.month.net < 0 ? "error" : "primary"}
            icon={<AccountBalanceWalletRounded />}
            hint={fin ? (fin.month.net >= 0 ? "Surplus — income covers spending" : "Deficit — spending is higher") : " "}
          />
        </Grid>
      )}

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "1.6fr 1fr" }, mb: 3 }}>
        {showFinance ? (
          <SectionCard title="Income vs expenditure" subtitle="Last 12 months, posted vouchers only" action={<Button component={Link} href="/dashboard/accounting/reports" size="small" endIcon={<ArrowForwardRounded />}>Reports</Button>}>
            {fin ? <IncomeExpenseChart data={fin.trend} /> : <Box sx={{ height: 300 }} />}
          </SectionCard>
        ) : (
          <SectionCard title="New registrations" subtitle="Applications received per month">
            {s ? <SingleBarChart label="Registrations" data={s.monthly.map(m => ({ label: monthLabel(m.key), value: m.count }))} height={300} /> : <Box sx={{ height: 300 }} />}
          </SectionCard>
        )}

        <SectionCard
          title="Latest applications"
          subtitle="Most recent first"
          noPad
          action={can("members.view") ? <Button component={Link} href="/dashboard/membership" size="small" endIcon={<ArrowForwardRounded />}>All</Button> : undefined}
        >
          {s && s.recent.length === 0 ? (
            <EmptyState icon={<Groups2Rounded />} title="No applications yet" body="When plot owners register online, they'll appear here." />
          ) : (
            <Stack sx={{ px: 1, pb: 1 }}>
              {(s?.recent || []).map(m => (
                <Box
                  key={m.id}
                  component={Link}
                  href={`/dashboard/membership/${m.id}`}
                  sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: 2.5, textDecoration: "none", color: "inherit", "&:hover": { bgcolor: "action.hover" } }}
                >
                  <Avatar src={m.ownerPhoto || undefined} sx={{ width: 40, height: 40, bgcolor: alpha(theme.palette.primary.main, 0.14), color: "primary.main" }}>
                    {initials(m.ownerNameEnglish)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14.5 }} noWrap>
                      {m.ownerNameEnglish}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      Sector {m.sectorNumber} · Plot {m.plotNumber} · {timeAgo(m.createdAt)}
                    </Typography>
                  </Box>
                  <StatusChip status={m.status} />
                </Box>
              ))}
            </Stack>
          )}
        </SectionCard>
      </Box>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        {showFinance && (
          <SectionCard title="New registrations" subtitle="Applications received per month">
            {s ? <SingleBarChart label="Registrations" data={s.monthly.map(m => ({ label: monthLabel(m.key), value: m.count }))} /> : <Box sx={{ height: 240 }} />}
          </SectionCard>
        )}
        <SectionCard title="At a glance" subtitle={`Updated ${formatDate(new Date())}`}>
          <Stack spacing={1.5}>
            <GlanceRow icon={<ArticleRounded />} label="Posts" value={s ? `${s.postsPublished} published · ${s.postsDraft} drafts` : "—"} href={can(["posts.view", "posts.manage"]) ? "/dashboard/posts" : undefined} />
            <GlanceRow icon={<BadgeRounded />} label="Staff accounts" value={s ? `${s.adminUsers} people` : "—"} href={can(["users.view", "users.manage"]) ? "/dashboard/users" : undefined} />
            {fin?.balances.map(b => (
              <GlanceRow key={b.id} icon={<AccountBalanceWalletRounded />} label={b.name} value={money(b.balance)} href="/dashboard/accounting" />
            ))}
            <Box sx={{ pt: 1 }}>
              <Chip size="small" variant="outlined" label={`Signed in as ${admin?.roleName || "…"}`} />
            </Box>
          </Stack>
        </SectionCard>
      </Box>
    </PageGate>
  );
}

function GlanceRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const inner = (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.25, borderRadius: 2.5, "&:hover": href ? { bgcolor: "action.hover" } : undefined }}>
      <Box sx={{ width: 36, height: 36, borderRadius: 2, display: "grid", placeItems: "center", bgcolor: "action.hover", color: "text.secondary" }}>{icon}</Box>
      <Typography sx={{ flex: 1, fontWeight: 600 }} noWrap>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 750, fontVariantNumeric: "tabular-nums" }} noWrap>
        {value}
      </Typography>
    </Stack>
  );
  return href ? (
    <Box component={Link} href={href} sx={{ color: "inherit", textDecoration: "none" }}>
      {inner}
    </Box>
  ) : (
    inner
  );
}

/** Decorative skyline drawn in the welcome band. */
function WelcomeArt() {
  return (
    <Box
      component="svg"
      viewBox="0 0 400 160"
      preserveAspectRatio="xMaxYMax meet"
      aria-hidden
      sx={{ position: "absolute", right: 0, bottom: 0, width: { xs: 260, md: 420 }, height: "100%", opacity: 0.22, pointerEvents: "none" }}
    >
      <circle cx="330" cy="40" r="22" fill="#F4A62A" />
      <g fill="#fff">
        <rect x="150" y="70" width="34" height="90" rx="3" />
        <rect x="190" y="40" width="40" height="120" rx="3" />
        <rect x="236" y="85" width="30" height="75" rx="3" />
        <rect x="272" y="60" width="44" height="100" rx="3" />
        <rect x="322" y="95" width="30" height="65" rx="3" />
        <path d="M356 160v-46l22-18 22 18v46z" />
        <path d="M90 160v-40l26-22 26 22v40z" />
      </g>
    </Box>
  );
}
