"use client";

import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import LockRounded from "@mui/icons-material/LockRounded";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import Swal from "sweetalert2";
import PageGate from "@/components/dashboard/PageGate";
import { PageHeader } from "@/components/dashboard/ui";
import { accountingError, useHeads, type LedgerHead } from "@/components/accounting/data";
import { useAdmin } from "@/lib/useAdmin";
import { money } from "@/lib/format";
import { apiDelete, apiPatch, apiPost } from "@/lib/api";

type Draft = { id?: number; name: string; code: string; type: "INCOME" | "EXPENSE"; description: string };

export default function HeadsPage() {
  const { heads, loading, mutate } = useHeads();
  const { can } = useAdmin();
  const setup = can("accounting.setup");
  const [tab, setTab] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const rows = useMemo(() => heads.filter(h => h.type === tab), [heads, tab]);

  const save = async () => {
    if (!draft) return;
    setError("");
    try {
      if (draft.id) await apiPatch(`/api/accounting/heads/${draft.id}`, draft);
      else await apiPost("/api/accounting/heads", draft);
      setDraft(null);
      await mutate();
    } catch (e) {
      setError(accountingError(e, "Could not save"));
    }
  };

  const toggle = async (h: LedgerHead) => {
    try {
      await apiPatch(`/api/accounting/heads/${h.id}`, { isActive: !h.isActive });
      await mutate();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Couldn't update", text: accountingError(e) });
    }
  };

  const remove = async (h: LedgerHead) => {
    const ok = await Swal.fire({ title: `Delete "${h.name}"?`, icon: "warning", showCancelButton: true, confirmButtonText: "Delete", confirmButtonColor: "#D23B3B" });
    if (!ok.isConfirmed) return;
    try {
      await apiDelete(`/api/accounting/heads/${h.id}`);
      await mutate();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Couldn't delete", text: accountingError(e) });
    }
  };

  const columns: GridColDef<LedgerHead>[] = [
    { field: "code", headerName: "Code", width: 100, renderCell: p => <Typography sx={{ fontFamily: "ui-monospace, monospace", fontWeight: 700, lineHeight: "56px" }}>{p.value || "—"}</Typography> },
    {
      field: "name",
      headerName: "Head",
      flex: 1,
      minWidth: 220,
      renderCell: p => (
        <Stack sx={{ height: "100%", justifyContent: "center", minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 14 }} noWrap>
            {p.value} {p.row.isSystem && <LockRounded sx={{ fontSize: 13, color: "text.secondary", verticalAlign: "-2px" }} />}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {p.row.description || " "}
          </Typography>
        </Stack>
      ),
    },
    { field: "voucherCount", headerName: "Vouchers", width: 100, align: "right", headerAlign: "right" },
    { field: "total", headerName: "All-time total", width: 160, align: "right", headerAlign: "right", valueFormatter: (v: number) => money(v) },
    {
      field: "isActive",
      headerName: "In use",
      width: 100,
      renderCell: p => (setup ? <Switch size="small" checked={p.value} onChange={() => toggle(p.row)} /> : <Chip size="small" label={p.value ? "Yes" : "No"} />),
    },
    {
      field: "actions",
      type: "actions",
      width: 90,
      getActions: p =>
        setup
          ? [
              <GridActionsCellItem
                key="e"
                icon={<EditRounded fontSize="small" />}
                label="Edit"
                onClick={() => setDraft({ id: p.row.id, name: p.row.name, code: p.row.code || "", type: p.row.type, description: p.row.description || "" })}
              />,
              <GridActionsCellItem key="d" icon={<DeleteOutlineRounded fontSize="small" />} label="Delete" onClick={() => remove(p.row)} disabled={p.row.isSystem || p.row.voucherCount > 0} showInMenu />,
            ]
          : [],
    },
  ];

  return (
    <PageGate title="Ledger heads" permission={["accounting.setup", "accounting.view"]}>
      <PageHeader
        eyebrow="Finance"
        title="Ledger heads"
        subtitle="The categories money is recorded under — like “Membership Fee” or “Office Rent”. Reports group totals by these heads."
        actions={
          setup && (
            <Button variant="contained" startIcon={<AddRounded />} onClick={() => setDraft({ name: "", code: "", type: tab, description: "" })}>
              New head
            </Button>
          )
        }
      />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab value="INCOME" label={`Income heads (${heads.filter(h => h.type === "INCOME").length})`} />
        <Tab value="EXPENSE" label={`Expense heads (${heads.filter(h => h.type === "EXPENSE").length})`} />
      </Tabs>
      <Box sx={{ height: 600 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} rowHeight={56} disableRowSelectionOnClick hideFooter={rows.length <= 100} />
      </Box>

      <Dialog open={!!draft} onClose={() => setDraft(null)} fullWidth maxWidth="xs">
        <DialogTitle>{draft?.id ? "Edit head" : "New ledger head"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField select size="small" label="Type" value={draft?.type || "INCOME"} onChange={e => setDraft(d => d && { ...d, type: e.target.value as Draft["type"] })} disabled={!!draft?.id}>
              <MenuItem value="INCOME">Income</MenuItem>
              <MenuItem value="EXPENSE">Expense</MenuItem>
            </TextField>
            <TextField size="small" label="Name" value={draft?.name || ""} onChange={e => setDraft(d => d && { ...d, name: e.target.value })} autoFocus required />
            <TextField size="small" label="Code (optional)" value={draft?.code || ""} onChange={e => setDraft(d => d && { ...d, code: e.target.value })} placeholder={draft?.type === "EXPENSE" ? "E-212" : "I-107"} />
            <TextField size="small" label="Description" value={draft?.description || ""} onChange={e => setDraft(d => d && { ...d, description: e.target.value })} multiline minRows={2} />
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setDraft(null)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={save} disabled={!draft?.name.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </PageGate>
  );
}
