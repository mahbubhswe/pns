"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Card,
  InputAdornment,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddRounded from "@mui/icons-material/AddRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import PrintRounded from "@mui/icons-material/PrintRounded";
import BlockRounded from "@mui/icons-material/BlockRounded";
import SouthWestRounded from "@mui/icons-material/SouthWestRounded";
import NorthEastRounded from "@mui/icons-material/NorthEastRounded";
import SwapHorizRounded from "@mui/icons-material/SwapHorizRounded";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import Swal from "sweetalert2";
import PageGate from "@/components/dashboard/PageGate";
import { PageHeader, StatusChip, TypeChip, TYPE_META } from "@/components/dashboard/ui";
import VoucherDialog, { VoucherDraft } from "@/components/accounting/VoucherDialog";
import { accountingError, useAccounts, useHeads, type Voucher } from "@/components/accounting/data";
import { apiGet, apiPost } from "@/lib/api";
import { useAdmin } from "@/lib/useAdmin";
import { downloadCsv, formatDate, money } from "@/lib/format";
import type { VoucherType, VouchersResponse as Resp } from "@/types/api";

const startOfYear = () => `${new Date().getFullYear()}-01-01`;

export default function VouchersPage() {
  return (
    <Suspense fallback={null}>
      <Vouchers />
    </Suspense>
  );
}

function Vouchers() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down("md"));
  const { can } = useAdmin();
  const { accounts } = useAccounts();
  const { heads, loading: headsLoading } = useHeads();

  const [from, setFrom] = useState(startOfYear());
  const [to, setTo] = useState("");
  const [type, setType] = useState<string>("ALL");
  const [accountId, setAccountId] = useState<number | "">("");
  const [headId, setHeadId] = useState<number | "">("");
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [dialog, setDialog] = useState<VoucherDraft | null>(null);
  const [newMenu, setNewMenu] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  // Deep links: ?new=INCOME&memberId=..&amount=..&party=..&ref=..
  useEffect(() => {
    if (headsLoading) return;
    const n = String(searchParams.get("new") || "").toUpperCase();
    if (["INCOME", "EXPENSE", "TRANSFER"].includes(n) && can("accounting.entry")) {
      const memberId = searchParams.get("memberId");
      const memberHead = heads.find(h => h.type === "INCOME" && h.name === "Membership Fee");
      setDialog({
        type: n as VoucherType,
        memberId: memberId ? Number(memberId) : null,
        amount: searchParams.get("amount") || "",
        partyName: searchParams.get("party") || "",
        reference: searchParams.get("ref") || "",
        headId: memberId && memberHead ? memberHead.id : "",
        description: memberId ? "Membership fee" : "",
      });
      router.replace("/dashboard/accounting/vouchers", { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, headsLoading]);

  const key = useMemo(() => {
    const p = new URLSearchParams();
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    if (type !== "ALL") p.set("type", type);
    if (accountId) p.set("accountId", String(accountId));
    if (headId) p.set("headId", String(headId));
    if (qDebounced) p.set("q", qDebounced);
    return `/api/accounting/vouchers?${p.toString()}`;
  }, [from, to, type, accountId, headId, qDebounced]);

  const { data, isLoading, mutate } = useSWR<Resp>(key, apiGet);
  const rows = data?.vouchers || [];

  const voidVoucher = async (v: Voucher) => {
    const res = await Swal.fire({
      title: `Void ${v.voucherNo}?`,
      text: "The voucher stays in the books for audit, but stops counting in balances and reports.",
      input: "text",
      inputPlaceholder: "Reason (e.g. duplicate entry)",
      inputValidator: val => (!val || val.trim().length < 3 ? "Please write a short reason" : undefined),
      showCancelButton: true,
      confirmButtonText: "Void voucher",
      confirmButtonColor: "#D23B3B",
    });
    if (!res.isConfirmed) return;
    try {
      await apiPost(`/api/accounting/vouchers/${v.id}/void`, { reason: res.value });
      await mutate();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Couldn't void", text: accountingError(e) });
    }
  };

  const columns: GridColDef<Voucher>[] = [
    { field: "date", headerName: "Date", width: 120, valueFormatter: (v: string) => formatDate(v) },
    {
      field: "voucherNo",
      headerName: "Voucher",
      width: 170,
      renderCell: p => (
        <Stack sx={{ height: "100%", justifyContent: "center", lineHeight: 1.2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 13.5, fontFamily: "ui-monospace, SFMono-Regular, monospace", textDecoration: p.row.status === "VOID" ? "line-through" : "none" }}>
            {p.value}
          </Typography>
          <Box sx={{ mt: 0.25 }}>
            <TypeChip type={p.row.type} />
          </Box>
        </Stack>
      ),
    },
    {
      field: "particulars",
      headerName: "Particulars",
      flex: 1.3,
      minWidth: 200,
      valueGetter: (_v, r) => (r.type === "TRANSFER" ? `${r.accountName} → ${r.toAccountName}` : r.headName),
      renderCell: p => (
        <Stack sx={{ height: "100%", justifyContent: "center", minWidth: 0, lineHeight: 1.25 }}>
          <Typography sx={{ fontWeight: 650, fontSize: 14 }} noWrap>
            {p.value}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {[p.row.partyName, p.row.description].filter(Boolean).join(" · ") || "—"}
          </Typography>
        </Stack>
      ),
    },
    { field: "accountName", headerName: "Account", minWidth: 140, flex: 0.7 },
    { field: "reference", headerName: "Reference", minWidth: 120, flex: 0.5 },
    {
      field: "amount",
      headerName: "Amount",
      width: 150,
      align: "right",
      headerAlign: "right",
      renderCell: p => {
        const sign = p.row.type === "INCOME" ? "+" : p.row.type === "EXPENSE" ? "−" : "";
        return (
          <Typography sx={{ fontWeight: 800, fontVariantNumeric: "tabular-nums", color: p.row.status === "VOID" ? "text.disabled" : TYPE_META[p.row.type].color, lineHeight: "60px" }}>
            {sign}
            {money(p.value)}
          </Typography>
        );
      },
    },
    { field: "status", headerName: "Status", width: 100, renderCell: p => (p.value === "VOID" ? <StatusChip status="VOID" /> : null) },
    {
      field: "actions",
      type: "actions",
      headerName: "",
      width: 140,
      getActions: p => {
        const items = [
          <GridActionsCellItem key="print" icon={<PrintRounded fontSize="small" />} label="Open / print" onClick={() => router.push(`/dashboard/accounting/vouchers/${p.id}`)} />,
        ];
        if (can("accounting.entry") && p.row.status === "POSTED")
          items.push(
            <GridActionsCellItem
              key="edit"
              icon={<EditRounded fontSize="small" />}
              label="Edit"
              onClick={() =>
                setDialog({
                  id: p.row.id,
                  type: p.row.type,
                  date: p.row.date,
                  amount: p.row.amount,
                  headId: p.row.headId || "",
                  accountId: p.row.accountId,
                  toAccountId: p.row.toAccountId || "",
                  partyName: p.row.partyName || "",
                  reference: p.row.reference || "",
                  description: p.row.description || "",
                  attachmentUrl: p.row.attachmentUrl || "",
                  memberId: p.row.memberId,
                })
              }
            />
          );
        if (can("accounting.void") && p.row.status === "POSTED")
          items.push(<GridActionsCellItem key="void" icon={<BlockRounded fontSize="small" />} label="Void" onClick={() => voidVoucher(p.row)} showInMenu />);
        return items;
      },
    },
  ];

  const exportCsv = () =>
    downloadCsv(
      `pns-vouchers-${from || "all"}_${to || "today"}.csv`,
      ["Date", "Voucher no", "Type", "Status", "Head", "From account", "To account", "Party", "Reference", "Notes", "Amount"],
      rows.map(r => [r.date, r.voucherNo, r.type, r.status, r.headName || "", r.accountName, r.toAccountName || "", r.partyName || "", r.reference || "", r.description || "", r.amount.toFixed(2)])
    );

  const t = data?.totals;

  return (
    <PageGate title="Vouchers" permission={["accounting.view", "accounting.entry"]}>
      <PageHeader
        eyebrow="Finance"
        title="Vouchers"
        subtitle="Receipts (RV), payments (PV) and transfers (CV). Mistakes are voided, never deleted, so the books always add up."
        actions={
          <>
            <Button variant="outlined" startIcon={<DownloadRounded />} onClick={exportCsv} disabled={!rows.length}>
              Export
            </Button>
            {can("accounting.entry") && (
              <>
                <Button variant="contained" startIcon={<AddRounded />} onClick={e => setNewMenu(e.currentTarget)}>
                  New voucher
                </Button>
                <Menu anchorEl={newMenu} open={!!newMenu} onClose={() => setNewMenu(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
                  {[
                    { t: "INCOME" as const, label: "Income — money received", icon: <SouthWestRounded sx={{ color: TYPE_META.INCOME.color }} /> },
                    { t: "EXPENSE" as const, label: "Expense — money paid", icon: <NorthEastRounded sx={{ color: TYPE_META.EXPENSE.color }} /> },
                    { t: "TRANSFER" as const, label: "Transfer — between accounts", icon: <SwapHorizRounded sx={{ color: TYPE_META.TRANSFER.color }} /> },
                  ].map(o => (
                    <MenuItem
                      key={o.t}
                      onClick={() => {
                        setNewMenu(null);
                        setDialog({ type: o.t });
                      }}
                    >
                      <ListItemIcon>{o.icon}</ListItemIcon>
                      {o.label}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
          </>
        }
      />

      <Card sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr 1fr", md: "2fr repeat(4, minmax(0, 1fr))" } }}>
          <TextField
            size="small"
            placeholder="Search voucher no., party, reference…"
            value={q}
            onChange={e => setQ(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> }}
            sx={{ gridColumn: { xs: "1 / -1", md: "auto" } }}
          />
          <TextField size="small" type="date" label="From" value={from} onChange={e => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField size="small" type="date" label="To" value={to} onChange={e => setTo(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField select size="small" label="Account" value={accountId} onChange={e => setAccountId(e.target.value ? Number(e.target.value) : "")}>
            <MenuItem value="">All accounts</MenuItem>
            {accounts.map(a => (
              <MenuItem key={a.id} value={a.id}>
                {a.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label="Head" value={headId} onChange={e => setHeadId(e.target.value ? Number(e.target.value) : "")}>
            <MenuItem value="">All heads</MenuItem>
            {heads.map(h => (
              <MenuItem key={h.id} value={h.id}>
                {h.name} <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>{h.type === "INCOME" ? "income" : "expense"}</Typography>
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Card>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Tabs value={type} onChange={(_, v) => setType(v)} variant="scrollable" allowScrollButtonsMobile>
          <Tab value="ALL" label="All" />
          <Tab value="INCOME" label="Income" />
          <Tab value="EXPENSE" label="Expenses" />
          <Tab value="TRANSFER" label="Transfers" />
        </Tabs>
        <Stack direction="row" spacing={3} sx={{ px: 1 }}>
          <Total label="In" value={t?.income} color={TYPE_META.INCOME.color} />
          <Total label="Out" value={t?.expense} color={TYPE_META.EXPENSE.color} />
          <Total label="Net" value={t ? t.income - t.expense : undefined} />
        </Stack>
      </Stack>

      <Box sx={{ height: { xs: 560, md: 640 } }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          rowHeight={60}
          disableRowSelectionOnClick
          columnVisibilityModel={isPhone ? { reference: false, accountName: false, status: false, date: false } : undefined}
          initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
          pageSizeOptions={[25, 50, 100]}
          getRowClassName={p => (p.row.status === "VOID" ? "is-void" : "")}
          sx={{ "& .is-void": { opacity: 0.55 } }}
        />
      </Box>

      <VoucherDialog
        open={!!dialog}
        initial={dialog}
        onClose={() => setDialog(null)}
        onSaved={async (v, created) => {
          setDialog(null);
          await mutate();
          if (created) {
            const r = await Swal.fire({
              icon: "success",
              title: `${v.voucherNo} saved`,
              text: `${money(v.amount)} recorded. Print a receipt now?`,
              showCancelButton: true,
              confirmButtonText: "Open voucher",
              cancelButtonText: "Done",
              confirmButtonColor: "#0F6E56",
            });
            if (r.isConfirmed) router.push(`/dashboard/accounting/vouchers/${v.id}`);
          }
        }}
      />
    </PageGate>
  );
}

function Total({ label, value, color }: { label: string; value?: number; color?: string }) {
  return (
    <Box sx={{ textAlign: "right" }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 800, fontVariantNumeric: "tabular-nums", color: color || "text.primary" }}>{value === undefined ? "—" : money(value, { decimals: false })}</Typography>
    </Box>
  );
}
