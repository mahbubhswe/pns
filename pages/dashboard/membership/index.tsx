import React, { useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
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
import { PageHeader, StatusChip } from "@/components/dashboard/ui";
import { useAdmin } from "@/lib/useAdmin";
import { initials } from "@/lib/format";
import type { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import DashboardLayout from "@/components/dashboard/Layout";
import { getJSON, postJSON } from "@/lib/api";
import { useXlsx } from "@/lib/useXlsx";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import moment from "moment";

type Member = {
  id: string;
  sectorNumber: string;
  roadNumber: string;
  plotNumber: string;
  plotSize: string;
  ownershipProofType: string;
  ownershipProofFile?: string | null;
  ownerNameEnglish: string;
  ownerNameBangla: string;
  contactNumber: string;
  nidNumber: string;
  presentAddress: string;
  permanentAddress: string;
  email: string;
  ownerPhoto?: string | null;
  paymentMethod: string;
  bkashTransactionId?: string | null;
  bkashAccountNumber?: string | null;
  bankAccountNumberFrom?: string | null;
  paymentReceipt?: string | null;
  membershipFee: number;
  agreeDataUse: boolean;
  status: "active" | "pending" | "inactive";
  joinedAt: string;
  updatedAt: string;
};

type MembersResp = { members: Member[] };

const CSV_FIELDS: Array<{ key: keyof Member; label: string }> = [
  { key: "id", label: "ID" },
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
  const router = useRouter();
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
  const { can } = useAdmin();
  const statusParam = typeof router.query.status === "string" ? router.query.status : "all";
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
  const setStatus = (v: string) =>
    router.replace({ pathname: router.pathname, query: v === "all" ? {} : { status: v } }, undefined, { shallow: true });

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseFile(file);
      // Expect columns: name, email, phone, membershipType, status, joinedAt
      const normalized = rows.map((r: any) => ({
        name: String(r.name || r.Name || "").trim(),
        email: String(r.email || r.Email || "").trim() || undefined,
        phone: String(r.phone || r.Phone || "").trim() || undefined,
        membershipType: String(r.membershipType || r.MembershipType || r.Type || "standard").trim(),
        status: (String(r.status || r.Status || "active").toLowerCase() as Member["status"]) || "active",
        joinedAt: r.joinedAt || r.JoinedAt || r.Joined || new Date().toISOString(),
      }));
      await postJSON("/api/memberships", normalized);
      await mutate();
    } catch (err) {
      console.error(err);
      alert("Failed to import. Ensure the file is a valid .xlsx with proper headers.");
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

  const columns: GridColDef[] = [
    {
      field: "ownerNameEnglish",
      headerName: "Member",
      flex: 1.4,
      minWidth: 230,
      renderCell: (params: any) => (
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: "100%", minWidth: 0 }}>
          <Avatar
            src={params.row.ownerPhoto || undefined}
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
      field: "plot",
      headerName: "Plot",
      minWidth: 170,
      valueGetter: (_v: any, row: any) => `S-${row.sectorNumber} · R-${row.roadNumber} · P-${row.plotNumber}`,
    },
    { field: "contactNumber", headerName: "Phone", minWidth: 140 },
    {
      field: "paymentMethod",
      headerName: "Paid via",
      minWidth: 110,
      valueFormatter: (v: any) => (v === "BKASH" ? "bKash" : v === "BANK" ? "Bank" : v),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 150,
      renderCell: (params: any) => <StatusChip status={params.value} />,
      sortable: true,
    },
    {
      field: "joinedAt",
      headerName: "Applied",
      minWidth: 130,
      sortable: true,
      renderCell: (params: any) => {
        const v = params?.row?.joinedAt;
        if (!v) return "";
        const d = moment(v);
        return d.isValid() ? d.format("D MMM YYYY") : "";
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "",
      width: 60,
      getActions: params => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon fontSize="small" />}
          label="View"
          onClick={() => router.push(`/dashboard/membership/${params.id}`)}
          showInMenu={false}
        />,
      ],
    },
  ];

  return (
    <DashboardLayout title="Members" permission="members.view">
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
                <input ref={inputRef} hidden type="file" accept=".xlsx,.xls" onChange={handleImport} />
                <Tooltip title={ready ? "Import from XLSX" : "Loading XLSX parser..."}>
                  <span>
                    <Button variant="contained" startIcon={<UploadFileIcon />} disabled={!ready} onClick={() => inputRef.current?.click()}>
                      Import XLSX
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
    </DashboardLayout>
  );
}
