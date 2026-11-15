"use client";

import React, { Suspense, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import FilterAltOffRounded from "@mui/icons-material/FilterAltOffRounded";
import LoginRounded from "@mui/icons-material/LoginRounded";
import { PageHeader, StatusChip } from "@/components/dashboard/ui";
import { useAdmin } from "@/lib/useAdmin";
import { loginAsMember } from "@/lib/impersonate";
import { initials, photoSrc } from "@/lib/format";
import type { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import PageGate from "@/components/dashboard/PageGate";
import { errorMessage, getJSON, postJSON } from "@/lib/api";
import Swal from "sweetalert2";
import { useXlsx } from "@/lib/useXlsx";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import dayjs from "dayjs";
import type { ImportMembersResponse, MemberDto as Member, MembersListResponse as MembersResp } from "@/types/api";

/** Columns of the member import template, in order. */
const IMPORT_COLUMNS: Array<{ key: string; header: string; example: string; aliases: string[] }> = [
  { key: "pnsId", header: "PNS ID", example: "PNS-00001", aliases: ["pnsid", "memberid", "membershipid", "id"] },
  { key: "name", header: "Name", example: "Md. Abdur Rahman", aliases: ["name", "nameenglish", "ownername", "membername"] },
  { key: "nameBangla", header: "Name (Bangla)", example: "মো. আব্দুর রহমান", aliases: ["namebangla", "banglaname", "ownernamebangla"] },
  { key: "phone", header: "Phone", example: "01711000000", aliases: ["phone", "mobile", "contact", "contactnumber"] },
  { key: "email", header: "Email", example: "rahman@example.com", aliases: ["email", "emailaddress"] },
  { key: "nid", header: "NID", example: "1234567890", aliases: ["nid", "nidnumber", "nationalid"] },
  { key: "sector", header: "Sector", example: "5", aliases: ["sector", "sectornumber"] },
  { key: "road", header: "Road", example: "12", aliases: ["road", "roadnumber"] },
  { key: "plot", header: "Plot", example: "34", aliases: ["plot", "plotnumber", "plotno"] },
  { key: "plotSize", header: "Plot Size (Katha)", example: "5", aliases: ["plotsize", "plotsizekatha", "size", "katha"] },
  { key: "address", header: "Address", example: "House 1, Road 2, Dhaka", aliases: ["address", "presentaddress"] },
  { key: "membershipType", header: "Type", example: "General", aliases: ["type", "membershiptype"] },
  { key: "status", header: "Status", example: "active", aliases: ["status"] },
  { key: "joinedAt", header: "Joined", example: "2020-01-15", aliases: ["joined", "joinedat", "joindate", "date"] },
];

/** Map a spreadsheet row with flexible headers ("PNS ID", "pns_id", "Mobile"…) to import fields. */
function normalizeImportRow(raw: Record<string, unknown>): Record<string, string> {
  const byAlias = new Map<string, unknown>();
  for (const [k, v] of Object.entries(raw)) byAlias.set(k.toLowerCase().replace(/[^a-z0-9]/g, ""), v);
  const out: Record<string, string> = {};
  for (const c of IMPORT_COLUMNS) {
    const hit = [c.key.toLowerCase(), ...c.aliases].find(a => byAlias.has(a));
    out[c.key] = hit ? String(byAlias.get(hit) ?? "").trim() : "";
  }
  return out;
}

/** Download an Excel-compatible CSV template (UTF-8 BOM so Bangla shows correctly). */
function downloadImportTemplate() {
  const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const csv = [IMPORT_COLUMNS.map(c => q(c.header)).join(","), IMPORT_COLUMNS.map(c => q(c.example)).join(",")].join("\r\n");
  const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "pns-member-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const CSV_FIELDS: Array<{ key: keyof Member; label: string }> = [
  { key: "id", label: "ID" },
  { key: "pnsId", label: "PNS ID" },
  { key: "applicationRef", label: "Reference No" },
  { key: "membershipType", label: "Membership Type" },
  { key: "relationToOwner", label: "Relation with Owner" },
  { key: "ownerPnsId", label: "Owner PNS ID" },
  { key: "ownerNameEnglish", label: "Name (English)" },
  { key: "ownerNameBangla", label: "Name (Bangla)" },
  { key: "email", label: "Email" },
  { key: "contactNumber", label: "Contact" },
  { key: "sectorNumber", label: "Sector" },
  { key: "roadNumber", label: "Road" },
  { key: "plotNumber", label: "Plot" },
  { key: "plotSize", label: "Plot Size" },
  { key: "ownershipProofType", label: "Ownership Proof Type" },
  { key: "ownershipProofFile", label: "Ownership Proof File" },
  { key: "ownerPhoto", label: "Owner Photo" },
  { key: "paymentMethod", label: "Payment Method" },
  { key: "bkashTransactionId", label: "bKash Txn ID" },
  { key: "bkashAccountNumber", label: "bKash Account" },
  { key: "bankAccountNumberFrom", label: "Bank Account (Sender)" },
  { key: "paymentReceipt", label: "Payment Receipt" },
  { key: "membershipFee", label: "Membership Fee" },
  { key: "agreeDataUse", label: "Agreed to Data Use" },
  { key: "status", label: "Status" },
  { key: "joinedAt", label: "Joined At" },
  { key: "updatedAt", label: "Updated At" },
];

export default function MembershipPage() {
  return (
    <PageGate title="Members" permission="members.view">
      <Suspense fallback={null}>
        <MembershipView />
      </Suspense>
    </PageGate>
  );
}

function MembershipView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const filterKey = useMemo(() => {
    const params = new URLSearchParams();
    if (startDate) params.set("start", startDate.format("YYYY-MM-DD"));
    if (endDate) params.set("end", endDate.format("YYYY-MM-DD"));
    const query = params.toString();
    return query ? `/api/memberships?${query}` : "/api/memberships";
  }, [startDate, endDate]);

  const { data, mutate, isLoading } = useSWR<MembersResp>(filterKey, getJSON);
  const { ready, parseFile } = useXlsx();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down("sm"));
  const { admin, can } = useAdmin();
  const statusParam = searchParams.get("status") || "all";
  const statusFilter = ["active", "pending", "inactive"].includes(statusParam) ? statusParam : "all";
  const allRows = useMemo(() => data?.members || [], [data?.members]);
  const rows = useMemo(
    () => (statusFilter === "all" ? allRows : allRows.filter(r => r.status === statusFilter)),
    [allRows, statusFilter]
  );
  const counts = useMemo(
    () => ({
      all: allRows.length,
      pending: allRows.filter(r => r.status === "pending").length,
      active: allRows.filter(r => r.status === "active").length,
      inactive: allRows.filter(r => r.status === "inactive").length,
    }),
    [allRows]
  );
  const setStatus = (v: string) => router.replace(v === "all" ? pathname : `${pathname}?status=${v}`, { scroll: false });

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = (await parseFile(file)).map(normalizeImportRow).filter(r => Object.values(r).some(v => v !== ""));
      if (rows.length === 0) {
        Swal.fire({ icon: "warning", title: "No rows found", text: "Use the template: the first row must be the column headers." });
        return;
      }
      const ok = await Swal.fire({
        icon: "question",
        title: `Import ${rows.length} member${rows.length === 1 ? "" : "s"}?`,
        text: "Rows whose PNS ID or email already exists are skipped, so re-importing the same file is safe.",
        showCancelButton: true,
        confirmButtonText: "Import",
      });
      if (!ok.isConfirmed) return;
      const res = await postJSON<ImportMembersResponse>("/api/memberships", rows);
      await mutate();
      const skippedHtml = res.skipped.length
        ? `<p>${res.skipped.length} skipped:</p><ul style="text-align:left;max-height:180px;overflow:auto">${res.skipped
            .slice(0, 50)
            .map(s => `<li>Row ${s.row}: ${s.reason.replace(/</g, "&lt;")}</li>`)
            .join("")}</ul>`
        : "";
      Swal.fire({ icon: res.skipped.length ? "info" : "success", title: `${res.count} member${res.count === 1 ? "" : "s"} imported`, html: skippedHtml });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Import failed", text: errorMessage(err, "Make sure the file is an .xlsx or .csv made from the template.") });
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const escapeCsv = (value: unknown) => {
    if (value === null || value === undefined) return '""';
    return `"${String(value).replace(/"/g, '""')}"`;
  };

  const handleDownloadCsv = () => {
    if (!rows.length) return;
    const startLabel = startDate ? startDate.format("YYYY-MM-DD") : "start";
    const endLabel = endDate ? endDate.format("YYYY-MM-DD") : "end";
    const stamp = startDate || endDate ? `${startLabel}_${endLabel}` : "all";
    const headerRow = CSV_FIELDS.map(field => `"${field.label}"`).join(",");
    const dataRows = rows.map(row =>
      CSV_FIELDS.map(field => escapeCsv(row[field.key])).join(",")
    );
    const csv = [headerRow, ...dataRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pns-memberships-${stamp}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: GridColDef<Member>[] = [
    {
      field: "ownerNameEnglish",
      headerName: "Member",
      flex: 1.4,
      minWidth: 230,
      renderCell: params => (
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: "100%", minWidth: 0 }}>
          <Avatar
            src={photoSrc(params.row.ownerPhoto)}
            sx={{ width: 34, height: 34, fontSize: 13, bgcolor: alpha(theme.palette.primary.main, 0.14), color: "primary.main" }}
          >
            {initials(params.value)}
          </Avatar>
          <Box sx={{ minWidth: 0, lineHeight: 1.25 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14 }} noWrap>
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap component="div">
              {params.row.email}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: "pnsId",
      headerName: "PNS ID / Ref",
      minWidth: 150,
      valueGetter: (_v, row) => row.pnsId || row.applicationRef || "",
      renderCell: params => (
        <Box sx={{ lineHeight: 1.25, py: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>{params.row.pnsId || "—"}</Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.applicationRef}
            {params.row.membershipType === "ASSOCIATE" ? " · Associate" : ""}
          </Typography>
        </Box>
      ),
    },
    {
      field: "plot",
      headerName: "Plot",
      minWidth: 170,
      valueGetter: (_v, row) => `S-${row.sectorNumber} · R-${row.roadNumber} · P-${row.plotNumber}`,
    },
    { field: "contactNumber", headerName: "Phone", minWidth: 140 },
    {
      field: "paymentMethod",
      headerName: "Paid via",
      minWidth: 110,
      valueFormatter: (v: string) => (v === "BKASH" ? "bKash" : v === "BANK" ? "Bank" : v),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 150,
      renderCell: params => <StatusChip status={String(params.value)} />,
      sortable: true,
    },
    {
      field: "joinedAt",
      headerName: "Applied",
      minWidth: 130,
      sortable: true,
      renderCell: params => {
        const v = params.row.joinedAt;
        if (!v) return "";
        const d = dayjs(v);
        return d.isValid() ? d.format("D MMM YYYY") : "";
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "",
      width: 90,
      getActions: params => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon fontSize="small" />}
          label="View"
          onClick={() => router.push(`/dashboard/membership/${params.id}`)}
          showInMenu={false}
        />,
        ...(can("members.impersonate") && !admin?.impersonatedBy
          ? [
              <GridActionsCellItem
                key="login-as"
                icon={<LoginRounded fontSize="small" />}
                label="Log in as member"
                onClick={() => loginAsMember(params.row)}
                showInMenu
              />,
            ]
          : []),
      ],
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Members & applications"
        subtitle="Every plot owner who has applied online. Open a record to verify documents and approve or reject."
        actions={
          <>
            <Button variant="outlined" startIcon={<DownloadRounded />} onClick={handleDownloadCsv} disabled={!rows.length}>
              Export CSV
            </Button>
            {can("members.manage") && (
              <>
                <input ref={inputRef} hidden type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} />
                <Tooltip title="Excel-ready template with all supported columns">
                  <Button startIcon={<DownloadRounded />} onClick={downloadImportTemplate}>
                    Import template
                  </Button>
                </Tooltip>
                <Tooltip title={ready ? "Import existing members from Excel (.xlsx) or CSV" : "Loading Excel reader…"}>
                  <span>
                    <Button variant="contained" startIcon={<UploadFileIcon />} disabled={!ready} onClick={() => inputRef.current?.click()}>
                      Import members
                    </Button>
                  </span>
                </Tooltip>
              </>
            )}
          </>
        }
      />

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Tabs value={statusFilter} onChange={(_, v) => setStatus(v)} variant="scrollable" allowScrollButtonsMobile sx={{ minHeight: 44 }}>
          <Tab value="all" label={`All (${counts.all})`} />
          <Tab value="pending" label={`Pending (${counts.pending})`} />
          <Tab value="active" label={`Approved (${counts.active})`} />
          <Tab value="inactive" label={`Rejected (${counts.inactive})`} />
        </Tabs>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }}>
            <DatePicker
              label="Applied from"
              value={startDate}
              onChange={value => setStartDate(value)}
              slotProps={{ textField: { size: "small", sx: { minWidth: 170 } } }}
            />
            <DatePicker
              label="Applied until"
              value={endDate}
              onChange={value => setEndDate(value)}
              slotProps={{ textField: { size: "small", sx: { minWidth: 170 } } }}
            />
            <Button
              color="inherit"
              startIcon={<FilterAltOffRounded />}
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
              }}
              disabled={!startDate && !endDate}
            >
              Clear
            </Button>
          </Stack>
        </LocalizationProvider>
      </Stack>

      <Box sx={{ height: { xs: 560, md: 640 }, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          rowHeight={60}
          disableRowSelectionOnClick
          onRowClick={p => router.push(`/dashboard/membership/${p.id}`)}
          columnVisibilityModel={isPhone ? { contactNumber: false, paymentMethod: false, joinedAt: false, plot: false } : undefined}
          initialState={{
            pagination: { paginationModel: { pageSize: 25, page: 0 } },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 300 } } }}
          sx={{ "& .MuiDataGrid-row": { cursor: "pointer" } }}
        />
      </Box>
    </>
  );
}
