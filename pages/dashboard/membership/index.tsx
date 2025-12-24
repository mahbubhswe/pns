import React, { useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
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

  const rows = useMemo(() => data?.members || [], [data?.members]);

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
    { field: "ownerNameEnglish", headerName: "Name", flex: 1, minWidth: 160 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
    { field: "contactNumber", headerName: "Phone", minWidth: 140 },
    { field: "ownershipProofType", headerName: "Proof Type", minWidth: 160 },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      renderCell: (params: any) => (
        <Chip
          label={params.value}
          color={params.value === "active" ? "success" : params.value === "pending" ? "warning" : "default"}
          size="small"
          sx={{ textTransform: "capitalize" }}
        />
      ),
      sortable: true,
    },
    {
      field: "joinedAt",
      headerName: "Joined",
      minWidth: 160,
      sortable: true,
      renderCell: (params: any) => {
        const v = params?.row?.joinedAt;
        if (!v) return "";
        const d = moment(v);
        return d.isValid() ? d.format("D, MMM YYYY") : "";
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
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
    <DashboardLayout>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, flexGrow: 1 }}>
          Membership
        </Typography>
        <input ref={inputRef} hidden type="file" accept=".xlsx,.xls" onChange={handleImport} />
        <Tooltip title={ready ? "Import from XLSX" : "Loading XLSX parser..."}>
          <span>
            <Button
              variant="contained"
              startIcon={<UploadFileIcon />}
              disabled={!ready}
              onClick={() => inputRef.current?.click()}
            >
              Import XLSX
            </Button>
          </span>
        </Tooltip>
      </Box>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          sx={{ mb: 2, flexWrap: "wrap" }}
        >
          <DatePicker
            label="Start date"
            value={startDate}
            onChange={value => setStartDate(value)}
            slotProps={{
              textField: {
                sx: { minWidth: 200 },
                InputLabelProps: { shrink: true },
              },
            }}
          />
          <DatePicker
            label="End date"
            value={endDate}
            onChange={value => setEndDate(value)}
            slotProps={{
              textField: {
                sx: { minWidth: 200 },
                InputLabelProps: { shrink: true },
              },
            }}
          />
          <Button
            variant="outlined"
            onClick={() => {
              setStartDate(null);
              setEndDate(null);
            }}
            disabled={!startDate && !endDate}
          >
            Clear dates
          </Button>
          <Button variant="contained" onClick={handleDownloadCsv} disabled={!rows.length}>
            Download CSV
          </Button>
        </Stack>
      </LocalizationProvider>

      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 300 } } }}
        />
      </Paper>
    </DashboardLayout>
  );
}
