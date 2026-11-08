import React, { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import PrintRounded from "@mui/icons-material/PrintRounded";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import BalanceRounded from "@mui/icons-material/BalanceRounded";
import ReceiptRounded from "@mui/icons-material/ReceiptRounded";
import MenuBookRounded from "@mui/icons-material/MenuBookRounded";
import CategoryRounded from "@mui/icons-material/CategoryRounded";
import TodayRounded from "@mui/icons-material/TodayRounded";
import ScaleRounded from "@mui/icons-material/ScaleRounded";
import AccountTreeRounded from "@mui/icons-material/AccountTreeRounded";
import CalendarMonthRounded from "@mui/icons-material/CalendarMonthRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import DashboardLayout from "@/components/dashboard/Layout";
import { PageHeader } from "@/components/dashboard/ui";
import { BrandMark } from "@/components/BrandLogo";
import { IncomeExpenseChart } from "@/components/dashboard/charts";
import { useAccounts, useHeads } from "@/components/accounting/data";
import { apiError, downloadCsv, firstOfMonthISO, formatDate, money, todayISO } from "@/lib/format";

type ReportKey =
  | "income-expenditure"
  | "receipts-payments"
  | "cash-book"
  | "head-ledger"
  | "day-book"
  | "trial-balance"
  | "balance-sheet"
  | "monthly-summary";

const REPORTS: Array<{ key: ReportKey; title: string; blurb: string; icon: React.ReactNode; range: "period" | "asof" | "year" }> = [
  { key: "income-expenditure", title: "Income & Expenditure", blurb: "Surplus or deficit for a period, by head", icon: <BalanceRounded />, range: "period" },
  { key: "receipts-payments", title: "Receipts & Payments", blurb: "Opening balance, money in/out, closing balance", icon: <ReceiptRounded />, range: "period" },
  { key: "cash-book", title: "Cash / Bank Book", blurb: "Every entry in one account with running balance", icon: <MenuBookRounded />, range: "period" },
  { key: "head-ledger", title: "Head-wise Ledger", blurb: "All vouchers under one income or expense head", icon: <CategoryRounded />, range: "period" },
  { key: "day-book", title: "Day Book", blurb: "Chronological register of all vouchers", icon: <TodayRounded />, range: "period" },
  { key: "trial-balance", title: "Trial Balance", blurb: "Debits equal credits — the arithmetic check", icon: <ScaleRounded />, range: "asof" },
  { key: "balance-sheet", title: "Statement of Financial Position", blurb: "What the society holds and its accumulated fund", icon: <AccountTreeRounded />, range: "asof" },
  { key: "monthly-summary", title: "Monthly Summary", blurb: "Income vs expenditure, month by month", icon: <CalendarMonthRounded />, range: "year" },
];

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await apiError(res));
  return res.json();
};

export default function ReportsPage() {
  const router = useRouter();
  const theme = useTheme();
  const { accounts } = useAccounts();
  const { heads } = useHeads();
  const [type, setType] = useState<ReportKey>("income-expenditure");
  const [from, setFrom] = useState(firstOfMonthISO());
  const [to, setTo] = useState(todayISO());
  const [year, setYear] = useState(new Date().getFullYear());
  const [accountId, setAccountId] = useState<number | "">("");
  const [headId, setHeadId] = useState<number | "">("");

  useEffect(() => {
    if (!router.isReady) return;
    const t = String(router.query.type || "");
    if (REPORTS.some(r => r.key === t)) setType(t as ReportKey);
    if (router.query.accountId) setAccountId(Number(router.query.accountId));
    if (router.query.headId) setHeadId(Number(router.query.headId));
  }, [router.isReady, router.query.type, router.query.accountId, router.query.headId]);

  useEffect(() => {
    if (type === "cash-book" && !accountId && accounts.length) setAccountId(accounts[0].id);
    if (type === "head-ledger" && !headId && heads.length) setHeadId(heads[0].id);
  }, [type, accountId, headId, accounts, heads]);

  const meta = REPORTS.find(r => r.key === type)!;

  const key = useMemo(() => {
    const p = new URLSearchParams({ type });
    if (meta.range === "period") {
      p.set("from", from);
      p.set("to", to);
    }
    if (meta.range === "asof") p.set("to", to);
    if (meta.range === "year") p.set("year", String(year));
    if (type === "cash-book") {
      if (!accountId) return null;
      p.set("accountId", String(accountId));
    }
    if (type === "head-ledger") {
      if (!headId) return null;
      p.set("headId", String(headId));
    }
    return `/api/accounting/reports?${p.toString()}`;
  }, [type, meta.range, from, to, year, accountId, headId]);

  const { data, error, isLoading } = useSWR<any>(key, fetcher);
  const report = data?.data;

  const periodLabel =
    meta.range === "year"
      ? `Calendar year ${year}`
      : meta.range === "asof"
        ? `As at ${formatDate(to, "long")}`
        : `${formatDate(from, "long")} to ${formatDate(to, "long")}`;
  const subject =
    type === "cash-book" ? accounts.find(a => a.id === accountId)?.name : type === "head-ledger" ? heads.find(h => h.id === headId)?.name : undefined;

  const exportCsv = () => {
    if (!report) return;
    const name = `pns-${type}-${meta.range === "year" ? year : meta.range === "asof" ? to : `${from}_${to}`}.csv`;
    const rows = toCsvRows(type, report);
    downloadCsv(name, rows.header, rows.rows);
  };

  return (
    <DashboardLayout title="Financial reports" permission="accounting.reports">
      <Box className="no-print">
        <PageHeader
          eyebrow="Finance"
          title="Financial reports"
          subtitle="Standard statements for the executive committee, the AGM and auditors. Print them or export to Excel."
          actions={
            <>
              <Button variant="outlined" startIcon={<DownloadRounded />} onClick={exportCsv} disabled={!report}>
                Export CSV
              </Button>
              <Button variant="contained" startIcon={<PrintRounded />} onClick={() => window.print()} disabled={!report}>
                Print / PDF
              </Button>
            </>
          }
        />
      </Box>

      <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", lg: "300px 1fr" }, alignItems: "start", "@media print": { display: "block" } }}>
        {/* Report picker */}
        <Box className="no-print">
          <TextField select fullWidth size="small" label="Report" value={type} onChange={e => setType(e.target.value as ReportKey)} sx={{ display: { lg: "none" }, mb: 1 }}>
            {REPORTS.map(r => (
              <MenuItem key={r.key} value={r.key}>
                {r.title}
              </MenuItem>
            ))}
          </TextField>
          <Stack spacing={1} sx={{ display: { xs: "none", lg: "flex" } }}>
            {REPORTS.map(r => {
              const active = r.key === type;
              return (
                <Box
                  key={r.key}
                  role="button"
                  tabIndex={0}
                  onClick={() => setType(r.key)}
                  onKeyDown={e => e.key === "Enter" && setType(r.key)}
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 3,
                    cursor: "pointer",
                    border: `1px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
                    bgcolor: active ? alpha(theme.palette.primary.main, 0.07) : "background.paper",
                    transition: "all .15s ease",
                    "&:hover": { borderColor: "primary.main" },
                  }}
                >
                  <Box sx={{ color: active ? "primary.main" : "text.secondary", mt: 0.25 }}>{r.icon}</Box>
                  <Box>
                    <Typography sx={{ fontWeight: 750, fontSize: 14.5 }}>{r.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {r.blurb}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          {/* Filters */}
          <Card className="no-print" sx={{ p: 2, mb: 2 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} useFlexGap flexWrap="wrap" alignItems={{ sm: "center" }}>
              {meta.range === "period" && (
                <>
                  <TextField size="small" type="date" label="From" value={from} onChange={e => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
                  <TextField size="small" type="date" label="To" value={to} onChange={e => setTo(e.target.value)} InputLabelProps={{ shrink: true }} />
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    {quickRanges().map(q => (
                      <Chip
                        key={q.label}
                        label={q.label}
                        size="small"
                        variant={from === q.from && to === q.to ? "filled" : "outlined"}
                        color={from === q.from && to === q.to ? "primary" : "default"}
                        onClick={() => {
                          setFrom(q.from);
                          setTo(q.to);
                        }}
                      />
                    ))}
                  </Stack>
                </>
              )}
              {meta.range === "asof" && <TextField size="small" type="date" label="As at" value={to} onChange={e => setTo(e.target.value)} InputLabelProps={{ shrink: true }} />}
              {meta.range === "year" && (
                <TextField select size="small" label="Year" value={year} onChange={e => setYear(Number(e.target.value))} sx={{ minWidth: 120 }}>
                  {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map(y => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              {type === "cash-book" && (
                <TextField select size="small" label="Account" value={accountId} onChange={e => setAccountId(Number(e.target.value))} sx={{ minWidth: 200 }}>
                  {accounts.map(a => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              {type === "head-ledger" && (
                <TextField select size="small" label="Head" value={headId} onChange={e => setHeadId(Number(e.target.value))} sx={{ minWidth: 220 }}>
                  {heads.map(h => (
                    <MenuItem key={h.id} value={h.id}>
                      {h.code ? `${h.code} · ` : ""}
                      {h.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Stack>
          </Card>

          {/* Statement */}
          <Card sx={{ p: { xs: 2, md: 4 }, "@media print": { border: 0, boxShadow: "none", p: 0 } }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <BrandMark size={46} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "text.secondary" }}>Purbachal Newtown Society</Typography>
                <Typography variant="h5" sx={{ lineHeight: 1.2 }}>
                  {meta.title}
                  {subject ? ` — ${subject}` : ""}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {periodLabel} · Amounts in Bangladeshi Taka (৳)
                </Typography>
              </Box>
            </Stack>

            {error ? (
              <Alert severity="warning">{(error as Error).message}</Alert>
            ) : isLoading || !report ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ReportBody type={type} r={report} />
            )}

            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 4 }}>
              Generated {new Date().toLocaleString("en-GB")} from the PNS management portal. Voided vouchers are excluded from all totals.
            </Typography>
            <Box sx={{ display: "none", "@media print": { display: "grid" }, gridTemplateColumns: "repeat(3, 1fr)", gap: 6, mt: 10 }}>
              {["Prepared by", "Treasurer", "General Secretary"].map(l => (
                <Box key={l} sx={{ borderTop: "1.5px solid #000", pt: 0.5, textAlign: "center", fontWeight: 700, fontSize: 13 }}>
                  {l}
                </Box>
              ))}
            </Box>
          </Card>
        </Box>
      </Box>
    </DashboardLayout>
  );
}

function quickRanges() {
  const d = new Date();
  const iso = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  const y = d.getFullYear();
  const m = d.getMonth();
  // Bangladesh fiscal year runs July–June.
  const fyStart = m >= 6 ? new Date(y, 6, 1) : new Date(y - 1, 6, 1);
  return [
    { label: "This month", from: iso(new Date(y, m, 1)), to: iso(d) },
    { label: "Last month", from: iso(new Date(y, m - 1, 1)), to: iso(new Date(y, m, 0)) },
    { label: "This year", from: `${y}-01-01`, to: iso(d) },
    { label: "Fiscal year", from: iso(fyStart), to: iso(d) },
  ];
}

// ---------------------------------------------------------------------------
// Renderers
// ---------------------------------------------------------------------------

const num = (n: number) => money(n).replace("৳ ", "");

function Amt({ v, bold, color }: { v: number; bold?: boolean; color?: string }) {
  return (
    <Box component="span" sx={{ fontVariantNumeric: "tabular-nums", fontWeight: bold ? 800 : 500, color, whiteSpace: "nowrap" }}>
      {v < 0 ? `(${num(-v)})` : num(v)}
    </Box>
  );
}

const cellR = { textAlign: "right" as const, whiteSpace: "nowrap" as const };
const tableSx = {
  "& td, & th": { py: 1, px: 1.25 },
  "& tr.total td": { fontWeight: 800, borderTop: "2px solid", borderTopColor: "text.primary" },
  "& tr.group td": { fontWeight: 800, bgcolor: "action.hover", fontSize: 12.5, textTransform: "uppercase", letterSpacing: ".06em" },
};

function Scroll({ children }: { children: React.ReactNode }) {
  return <Box sx={{ overflowX: "auto", mx: { xs: -2, md: 0 }, px: { xs: 2, md: 0 } }}>{children}</Box>;
}

function Balanced({ ok, label }: { ok: boolean; label: string }) {
  return (
    <Alert severity={ok ? "success" : "error"} icon={ok ? <CheckCircleRounded /> : <WarningAmberRounded />} sx={{ mt: 2 }}>
      {ok ? label : "Totals don't match — check for vouchers with missing heads or accounts."}
    </Alert>
  );
}

function ReportBody({ type, r }: { type: ReportKey; r: any }) {
  switch (type) {
    case "income-expenditure":
      return (
        <Scroll>
          <Table size="small" sx={tableSx}>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Head</TableCell>
                <TableCell sx={cellR}>Amount (৳)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow className="group">
                <TableCell colSpan={3}>Income</TableCell>
              </TableRow>
              {r.income.map((h: any) => (
                <TableRow key={`i${h.headId}`}>
                  <TableCell>{h.code}</TableCell>
                  <TableCell>{h.name}</TableCell>
                  <TableCell sx={cellR}>
                    <Amt v={h.amount} />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="total">
                <TableCell colSpan={2}>Total income</TableCell>
                <TableCell sx={cellR}>
                  <Amt v={r.totalIncome} bold />
                </TableCell>
              </TableRow>
              <TableRow className="group">
                <TableCell colSpan={3}>Expenditure</TableCell>
              </TableRow>
              {r.expense.map((h: any) => (
                <TableRow key={`e${h.headId}`}>
                  <TableCell>{h.code}</TableCell>
                  <TableCell>{h.name}</TableCell>
                  <TableCell sx={cellR}>
                    <Amt v={h.amount} />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="total">
                <TableCell colSpan={2}>Total expenditure</TableCell>
                <TableCell sx={cellR}>
                  <Amt v={r.totalExpense} bold />
                </TableCell>
              </TableRow>
              <TableRow className="total">
                <TableCell colSpan={2}>{r.surplus >= 0 ? "Surplus (income over expenditure)" : "Deficit (expenditure over income)"}</TableCell>
                <TableCell sx={cellR}>
                  <Amt v={r.surplus} bold color={r.surplus >= 0 ? "success.main" : "error.main"} />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Scroll>
      );

    case "receipts-payments":
      return (
        <>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
            <Scroll>
              <Table size="small" sx={tableSx}>
                <TableHead>
                  <TableRow>
                    <TableCell>Receipts</TableCell>
                    <TableCell sx={cellR}>৳</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow className="group">
                    <TableCell colSpan={2}>Opening balance</TableCell>
                  </TableRow>
                  {r.opening.map((a: any) => (
                    <TableRow key={`o${a.accountId}`}>
                      <TableCell>{a.name}</TableCell>
                      <TableCell sx={cellR}>
                        <Amt v={a.amount} />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="group">
                    <TableCell colSpan={2}>Received during the period</TableCell>
                  </TableRow>
                  {r.receipts.map((h: any) => (
                    <TableRow key={`r${h.headId}`}>
                      <TableCell>{h.name}</TableCell>
                      <TableCell sx={cellR}>
                        <Amt v={h.amount} />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="total">
                    <TableCell>Total</TableCell>
                    <TableCell sx={cellR}>
                      <Amt v={r.debitTotal} bold />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Scroll>
            <Scroll>
              <Table size="small" sx={tableSx}>
                <TableHead>
                  <TableRow>
                    <TableCell>Payments</TableCell>
                    <TableCell sx={cellR}>৳</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow className="group">
                    <TableCell colSpan={2}>Paid during the period</TableCell>
                  </TableRow>
                  {r.payments.map((h: any) => (
                    <TableRow key={`p${h.headId}`}>
                      <TableCell>{h.name}</TableCell>
                      <TableCell sx={cellR}>
                        <Amt v={h.amount} />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="group">
                    <TableCell colSpan={2}>Closing balance</TableCell>
                  </TableRow>
                  {r.closing.map((a: any) => (
                    <TableRow key={`c${a.accountId}`}>
                      <TableCell>{a.name}</TableCell>
                      <TableCell sx={cellR}>
                        <Amt v={a.amount} />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="total">
                    <TableCell>Total</TableCell>
                    <TableCell sx={cellR}>
                      <Amt v={r.creditTotal} bold />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Scroll>
          </Box>
          <Balanced ok={Math.abs(r.debitTotal - r.creditTotal) < 0.01} label="Both sides agree: opening + receipts = payments + closing." />
        </>
      );

    case "cash-book":
      return (
        <Scroll>
          <Table size="small" sx={tableSx}>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Voucher</TableCell>
                <TableCell>Particulars</TableCell>
                <TableCell sx={cellR}>Receipt (Dr)</TableCell>
                <TableCell sx={cellR}>Payment (Cr)</TableCell>
                <TableCell sx={cellR}>Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow className="group">
                <TableCell colSpan={5}>Opening balance</TableCell>
                <TableCell sx={cellR}>
                  <Amt v={r.opening} bold />
                </TableCell>
              </TableRow>
              {r.rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ color: "text.secondary", textAlign: "center", py: 3 }}>
                    No entries in this period.
                  </TableCell>
                </TableRow>
              )}
              {r.rows.map((x: any) => (
                <TableRow key={x.id}>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(x.date)}</TableCell>
                  <TableCell sx={{ fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap" }}>{x.voucherNo}</TableCell>
                  <TableCell>{x.particulars}</TableCell>
                  <TableCell sx={cellR}>{x.receipt ? <Amt v={x.receipt} /> : ""}</TableCell>
                  <TableCell sx={cellR}>{x.payment ? <Amt v={x.payment} /> : ""}</TableCell>
                  <TableCell sx={cellR}>
                    <Amt v={x.balance} />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="total">
                <TableCell colSpan={3}>Totals & closing balance</TableCell>
                <TableCell sx={cellR}>
                  <Amt v={r.totalReceipts} bold />
                </TableCell>
                <TableCell sx={cellR}>
                  <Amt v={r.totalPayments} bold />
                </TableCell>
                <TableCell sx={cellR}>
                  <Amt v={r.closing} bold />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Scroll>
      );

    case "head-ledger":
      return (
        <Scroll>
          <Table size="small" sx={tableSx}>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Voucher</TableCell>
                <TableCell>{r.head.type === "INCOME" ? "Received from" : "Paid to"}</TableCell>
                <TableCell>Account</TableCell>
                <TableCell sx={cellR}>Amount</TableCell>
                <TableCell sx={cellR}>Cumulative</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {r.rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ color: "text.secondary", textAlign: "center", py: 3 }}>
                    No vouchers under this head in the period.
                  </TableCell>
                </TableRow>
              )}
              {r.rows.map((x: any) => (
                <TableRow key={x.id}>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(x.date)}</TableCell>
                  <TableCell sx={{ fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap" }}>{x.voucherNo}</TableCell>
                  <TableCell>
                    {x.party}
                    {x.description ? (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {x.description}
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell>{x.account}</TableCell>
                  <TableCell sx={cellR}>
                    <Amt v={x.amount} />
                  </TableCell>
                  <TableCell sx={cellR}>
                    <Amt v={x.cumulative} />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="total">
                <TableCell colSpan={4}>Total {r.head.type === "INCOME" ? "received" : "spent"}</TableCell>
                <TableCell sx={cellR}>
                  <Amt v={r.total} bold />
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </Scroll>
      );

    case "day-book":
      return (
        <>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
            <Chip label={`Income ${money(r.totals.income)}`} />
            <Chip label={`Expenses ${money(r.totals.expense)}`} />
            <Chip label={`Transfers ${money(r.totals.transfer)}`} />
            {r.totals.voided > 0 && <Chip color="error" variant="outlined" label={`${r.totals.voided} voided`} />}
          </Stack>
          <Scroll>
            <Table size="small" sx={tableSx}>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Voucher</TableCell>
                  <TableCell>Particulars</TableCell>
                  <TableCell>Account</TableCell>
                  <TableCell sx={cellR}>Debit (in)</TableCell>
                  <TableCell sx={cellR}>Credit (out)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {r.rows.map((x: any) => (
                  <TableRow key={x.id} sx={{ opacity: x.status === "VOID" ? 0.5 : 1, "& td": { textDecoration: x.status === "VOID" ? "line-through" : "none" } }}>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(x.date)}</TableCell>
                    <TableCell sx={{ fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap" }}>{x.voucherNo}</TableCell>
                    <TableCell>{x.particulars}</TableCell>
                    <TableCell>{x.type === "TRANSFER" ? `${x.accountName} → ${x.toAccountName}` : x.accountName}</TableCell>
                    <TableCell sx={cellR}>{x.type === "INCOME" ? <Amt v={x.amount} /> : x.type === "TRANSFER" ? <Amt v={x.amount} /> : ""}</TableCell>
                    <TableCell sx={cellR}>{x.type === "EXPENSE" ? <Amt v={x.amount} /> : x.type === "TRANSFER" ? <Amt v={x.amount} /> : ""}</TableCell>
                  </TableRow>
                ))}
                {r.rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ color: "text.secondary", textAlign: "center", py: 3 }}>
                      No vouchers in this period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Scroll>
        </>
      );

    case "trial-balance": {
      let lastGroup = "";
      return (
        <>
          <Scroll>
            <Table size="small" sx={tableSx}>
              <TableHead>
                <TableRow>
                  <TableCell>Account / head</TableCell>
                  <TableCell sx={cellR}>Debit (৳)</TableCell>
                  <TableCell sx={cellR}>Credit (৳)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {r.rows.flatMap((x: any, i: number) => {
                  const out = [];
                  if (x.group !== lastGroup) {
                    lastGroup = x.group;
                    out.push(
                      <TableRow key={`g${i}`} className="group">
                        <TableCell colSpan={3}>{x.group}</TableCell>
                      </TableRow>
                    );
                  }
                  out.push(
                    <TableRow key={i}>
                      <TableCell>
                        {x.code ? <Box component="span" sx={{ color: "text.secondary", mr: 1, fontFamily: "ui-monospace, monospace" }}>{x.code}</Box> : null}
                        {x.name}
                      </TableCell>
                      <TableCell sx={cellR}>{x.debit ? <Amt v={x.debit} /> : ""}</TableCell>
                      <TableCell sx={cellR}>{x.credit ? <Amt v={x.credit} /> : ""}</TableCell>
                    </TableRow>
                  );
                  return out;
                })}
                <TableRow className="total">
                  <TableCell>Total</TableCell>
                  <TableCell sx={cellR}>
                    <Amt v={r.totalDebit} bold />
                  </TableCell>
                  <TableCell sx={cellR}>
                    <Amt v={r.totalCredit} bold />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Scroll>
          <Balanced ok={r.balanced} label="Trial balance agrees — total debits equal total credits." />
        </>
      );
    }

    case "balance-sheet":
      return (
        <>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
            <Scroll>
              <Table size="small" sx={tableSx}>
                <TableHead>
                  <TableRow>
                    <TableCell>Assets</TableCell>
                    <TableCell sx={cellR}>৳</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {r.assets.map((a: any) => (
                    <TableRow key={a.name}>
                      <TableCell>
                        {a.name}
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          {a.group}
                        </Typography>
                      </TableCell>
                      <TableCell sx={cellR}>
                        <Amt v={a.amount} />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="total">
                    <TableCell>Total assets</TableCell>
                    <TableCell sx={cellR}>
                      <Amt v={r.totalAssets} bold />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Scroll>
            <Scroll>
              <Table size="small" sx={tableSx}>
                <TableHead>
                  <TableRow>
                    <TableCell>Fund & liabilities</TableCell>
                    <TableCell sx={cellR}>৳</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>General fund (opening balances)</TableCell>
                    <TableCell sx={cellR}>
                      <Amt v={r.fund.openingFund} />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Add: accumulated surplus / (deficit)</TableCell>
                    <TableCell sx={cellR}>
                      <Amt v={r.fund.accumulatedSurplus} />
                    </TableCell>
                  </TableRow>
                  <TableRow className="total">
                    <TableCell>Total fund</TableCell>
                    <TableCell sx={cellR}>
                      <Amt v={r.fund.total} bold />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Scroll>
          </Box>
          <Balanced ok={r.balanced} label="Balanced — what the society holds equals its accumulated fund." />
        </>
      );

    case "monthly-summary":
      return (
        <>
          <Box className="no-print" sx={{ mb: 3 }}>
            <IncomeExpenseChart data={r.months} height={280} />
          </Box>
          <Scroll>
            <Table size="small" sx={tableSx}>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell sx={cellR}>Income</TableCell>
                  <TableCell sx={cellR}>Expenditure</TableCell>
                  <TableCell sx={cellR}>Surplus / (deficit)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {r.months.map((m: any) => (
                  <TableRow key={m.month}>
                    <TableCell>
                      {m.label} {r.year}
                    </TableCell>
                    <TableCell sx={cellR}>
                      <Amt v={m.income} />
                    </TableCell>
                    <TableCell sx={cellR}>
                      <Amt v={m.expense} />
                    </TableCell>
                    <TableCell sx={cellR}>
                      <Amt v={m.net} color={m.net < 0 ? "error.main" : undefined} />
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="total">
                  <TableCell>Year total</TableCell>
                  <TableCell sx={cellR}>
                    <Amt v={r.totals.income} bold />
                  </TableCell>
                  <TableCell sx={cellR}>
                    <Amt v={r.totals.expense} bold />
                  </TableCell>
                  <TableCell sx={cellR}>
                    <Amt v={r.totals.net} bold />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Scroll>
        </>
      );
  }
}

function toCsvRows(type: ReportKey, r: any): { header: string[]; rows: unknown[][] } {
  const f = (n: number) => (Number(n) || 0).toFixed(2);
  switch (type) {
    case "income-expenditure":
      return {
        header: ["Section", "Code", "Head", "Amount"],
        rows: [
          ...r.income.map((h: any) => ["Income", h.code || "", h.name, f(h.amount)]),
          ["Income", "", "Total income", f(r.totalIncome)],
          ...r.expense.map((h: any) => ["Expenditure", h.code || "", h.name, f(h.amount)]),
          ["Expenditure", "", "Total expenditure", f(r.totalExpense)],
          ["Result", "", r.surplus >= 0 ? "Surplus" : "Deficit", f(r.surplus)],
        ],
      };
    case "receipts-payments":
      return {
        header: ["Side", "Line", "Amount"],
        rows: [
          ...r.opening.map((a: any) => ["Receipts", `Opening — ${a.name}`, f(a.amount)]),
          ...r.receipts.map((h: any) => ["Receipts", h.name, f(h.amount)]),
          ["Receipts", "Total", f(r.debitTotal)],
          ...r.payments.map((h: any) => ["Payments", h.name, f(h.amount)]),
          ...r.closing.map((a: any) => ["Payments", `Closing — ${a.name}`, f(a.amount)]),
          ["Payments", "Total", f(r.creditTotal)],
        ],
      };
    case "cash-book":
      return {
        header: ["Date", "Voucher", "Particulars", "Reference", "Receipt", "Payment", "Balance"],
        rows: [["", "", "Opening balance", "", "", "", f(r.opening)], ...r.rows.map((x: any) => [x.date, x.voucherNo, x.particulars, x.reference || "", f(x.receipt), f(x.payment), f(x.balance)]), ["", "", "Totals", "", f(r.totalReceipts), f(r.totalPayments), f(r.closing)]],
      };
    case "head-ledger":
      return {
        header: ["Date", "Voucher", "Party", "Account", "Notes", "Amount", "Cumulative"],
        rows: [...r.rows.map((x: any) => [x.date, x.voucherNo, x.party, x.account, x.description || "", f(x.amount), f(x.cumulative)]), ["", "", "", "", "Total", f(r.total), ""]],
      };
    case "day-book":
      return {
        header: ["Date", "Voucher", "Type", "Status", "Particulars", "From account", "To account", "Amount"],
        rows: r.rows.map((x: any) => [x.date, x.voucherNo, x.type, x.status, x.particulars, x.accountName, x.toAccountName || "", f(x.amount)]),
      };
    case "trial-balance":
      return {
        header: ["Group", "Code", "Name", "Debit", "Credit"],
        rows: [...r.rows.map((x: any) => [x.group, x.code || "", x.name, f(x.debit), f(x.credit)]), ["", "", "Total", f(r.totalDebit), f(r.totalCredit)]],
      };
    case "balance-sheet":
      return {
        header: ["Side", "Line", "Amount"],
        rows: [
          ...r.assets.map((a: any) => ["Assets", a.name, f(a.amount)]),
          ["Assets", "Total assets", f(r.totalAssets)],
          ["Fund", "General fund (opening)", f(r.fund.openingFund)],
          ["Fund", "Accumulated surplus", f(r.fund.accumulatedSurplus)],
          ["Fund", "Total fund", f(r.fund.total)],
        ],
      };
    case "monthly-summary":
      return {
        header: ["Month", "Income", "Expenditure", "Net"],
        rows: [...r.months.map((m: any) => [`${m.label} ${r.year}`, f(m.income), f(m.expense), f(m.net)]), ["Total", f(r.totals.income), f(r.totals.expense), f(r.totals.net)]],
      };
  }
}
