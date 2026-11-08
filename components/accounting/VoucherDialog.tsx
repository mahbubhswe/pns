"use client";

// components/accounting/VoucherDialog.tsx — record or edit an income, expense or transfer voucher.
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  ListSubheader,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CloseRounded from "@mui/icons-material/CloseRounded";
import SouthWestRounded from "@mui/icons-material/SouthWestRounded";
import NorthEastRounded from "@mui/icons-material/NorthEastRounded";
import SwapHorizRounded from "@mui/icons-material/SwapHorizRounded";
import AttachFileRounded from "@mui/icons-material/AttachFileRounded";
import { accountingError, useAccounts, useHeads, type Voucher } from "@/components/accounting/data";
import { amountInWords, money, todayISO } from "@/lib/format";
import { apiPatch, apiPost, apiPostForm } from "@/lib/api";
import type { UploadResponse, VoucherMutationResponse } from "@/types/api";
import { TYPE_META } from "@/components/dashboard/ui";

type Kind = "INCOME" | "EXPENSE" | "TRANSFER";

export type VoucherDraft = Partial<{
  id: number;
  type: Kind;
  date: string;
  amount: number | string;
  headId: number | "";
  accountId: number | "";
  toAccountId: number | "";
  partyName: string;
  reference: string;
  description: string;
  attachmentUrl: string;
  memberId: number | null;
}>;

export default function VoucherDialog({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial?: VoucherDraft | null;
  onClose: () => void;
  onSaved: (v: Voucher, created: boolean) => void;
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { accounts } = useAccounts();
  const { heads } = useHeads();
  const editing = Boolean(initial?.id);
  const [v, setV] = useState<VoucherDraft>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setV({
      type: "INCOME",
      date: todayISO(),
      amount: "",
      headId: "",
      accountId: "",
      toAccountId: "",
      partyName: "",
      reference: "",
      description: "",
      attachmentUrl: "",
      memberId: null,
      ...(initial || {}),
    });
  }, [open, initial]);

  const type = (v.type || "INCOME") as Kind;
  const activeAccounts = accounts.filter(a => a.isActive || a.id === v.accountId || a.id === v.toAccountId);
  const typeHeads = heads.filter(h => h.type === type && (h.isActive || h.id === v.headId));

  // Default a sensible account/head once data arrives.
  useEffect(() => {
    if (!open) return;
    setV(prev => {
      const next = { ...prev };
      if (!next.accountId && activeAccounts.length) next.accountId = activeAccounts[0].id;
      if (type === "TRANSFER" && !next.toAccountId && activeAccounts.length > 1)
        next.toAccountId = activeAccounts.find(a => a.id !== next.accountId)?.id || "";
      if (type !== "TRANSFER" && next.headId && !heads.find(h => h.id === next.headId && h.type === type)) next.headId = "";
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, accounts.length, heads.length, type]);

  const amount = Number(v.amount) || 0;
  const fromAcc = accounts.find(a => a.id === v.accountId);
  const overdraw = (type === "EXPENSE" || type === "TRANSFER") && fromAcc && fromAcc.type !== "BANK" && !editing && amount > fromAcc.balance;

  const partyLabel = type === "INCOME" ? "Received from" : type === "EXPENSE" ? "Paid to" : "Handled by";
  const color = TYPE_META[type].color;

  const set = (k: keyof VoucherDraft) => (e: React.ChangeEvent<HTMLInputElement>) => setV(p => ({ ...p, [k]: e.target.value }));

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { url } = await apiPostForm<UploadResponse>("/api/admin/upload?kind=document", fd);
      setV(p => ({ ...p, attachmentUrl: url }));
    } catch (e) {
      setError(accountingError(e, "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setError("");
    setSaving(true);
    try {
      const body = { ...v, amount: Number(v.amount) };
      const res = editing
        ? await apiPatch<VoucherMutationResponse>(`/api/accounting/vouchers/${v.id}`, body)
        : await apiPost<VoucherMutationResponse>("/api/accounting/vouchers", body);
      onSaved(res.voucher, !editing);
    } catch (e) {
      setError(accountingError(e, "Could not save the voucher"));
    } finally {
      setSaving(false);
    }
  };

  const headGroups = useMemo(() => typeHeads, [typeHeads]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" fullScreen={fullScreen}>
      <DialogTitle sx={{ pr: 7 }}>
        {editing ? "Edit voucher" : "New voucher"}
        <Typography variant="body2" color="text.secondary">
          {editing ? "Type can't change after saving — void and re-enter if needed." : "Every taka in or out gets a numbered voucher."}
        </Typography>
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 12, top: 12 }} aria-label="Close">
          <CloseRounded />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.25}>
          <ToggleButtonGroup
            exclusive
            fullWidth
            value={type}
            onChange={(_, t) => t && setV(p => ({ ...p, type: t, headId: "" }))}
            disabled={editing}
            sx={{ "& .MuiToggleButton-root": { py: 1.25, fontWeight: 700, textTransform: "none", gap: 0.75 } }}
          >
            <ToggleButton value="INCOME" sx={{ "&.Mui-selected": { bgcolor: alpha(TYPE_META.INCOME.color, 0.14), color: TYPE_META.INCOME.color } }}>
              <SouthWestRounded fontSize="small" /> Income
            </ToggleButton>
            <ToggleButton value="EXPENSE" sx={{ "&.Mui-selected": { bgcolor: alpha(TYPE_META.EXPENSE.color, 0.14), color: TYPE_META.EXPENSE.color } }}>
              <NorthEastRounded fontSize="small" /> Expense
            </ToggleButton>
            <ToggleButton value="TRANSFER" sx={{ "&.Mui-selected": { bgcolor: alpha(TYPE_META.TRANSFER.color, 0.14), color: TYPE_META.TRANSFER.color } }}>
              <SwapHorizRounded fontSize="small" /> Transfer
            </ToggleButton>
          </ToggleButtonGroup>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField label="Date" type="date" size="small" value={v.date || ""} onChange={set("date")} InputLabelProps={{ shrink: true }} sx={{ flex: 1 }} required />
            <TextField
              label="Amount"
              size="small"
              value={v.amount ?? ""}
              onChange={e => setV(p => ({ ...p, amount: e.target.value.replace(/[^\d.]/g, "") }))}
              inputProps={{ inputMode: "decimal" }}
              InputProps={{ startAdornment: <InputAdornment position="start">৳</InputAdornment> }}
              sx={{ flex: 1, "& input": { fontWeight: 800, fontSize: 18, color } }}
              required
            />
          </Stack>
          {amount > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: "-8px !important", fontStyle: "italic" }}>
              {amountInWords(amount)}
            </Typography>
          )}

          {type !== "TRANSFER" ? (
            <TextField select size="small" label={type === "INCOME" ? "Income head (what is it for?)" : "Expense head (what was it for?)"} value={v.headId ?? ""} onChange={e => setV(p => ({ ...p, headId: Number(e.target.value) }))} required>
              {headGroups.length === 0 && <MenuItem disabled>No heads yet — add some under Ledger heads</MenuItem>}
              {headGroups.map(h => (
                <MenuItem key={h.id} value={h.id}>
                  {h.code ? <Box component="span" sx={{ color: "text.secondary", mr: 1, fontFamily: "ui-monospace, monospace", fontSize: 12 }}>{h.code}</Box> : null}
                  {h.name}
                </MenuItem>
              ))}
            </TextField>
          ) : null}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              select
              size="small"
              label={type === "INCOME" ? "Received into" : type === "EXPENSE" ? "Paid from" : "From account"}
              value={v.accountId ?? ""}
              onChange={e => setV(p => ({ ...p, accountId: Number(e.target.value) }))}
              sx={{ flex: 1 }}
              required
            >
              <ListSubheader>Cash & bank</ListSubheader>
              {activeAccounts.map(a => (
                <MenuItem key={a.id} value={a.id}>
                  <Stack direction="row" justifyContent="space-between" sx={{ width: "100%" }} spacing={2}>
                    <span>{a.name}</span>
                    <Typography component="span" variant="body2" color="text.secondary">
                      {money(a.balance, { decimals: false })}
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
            {type === "TRANSFER" && (
              <TextField select size="small" label="To account" value={v.toAccountId ?? ""} onChange={e => setV(p => ({ ...p, toAccountId: Number(e.target.value) }))} sx={{ flex: 1 }} required>
                {activeAccounts
                  .filter(a => a.id !== v.accountId)
                  .map(a => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.name}
                    </MenuItem>
                  ))}
              </TextField>
            )}
          </Stack>
          {overdraw && (
            <Alert severity="warning" sx={{ py: 0.25 }}>
              {fromAcc!.name} only shows {money(fromAcc!.balance)}. Double-check the amount or account.
            </Alert>
          )}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField size="small" label={partyLabel} value={v.partyName || ""} onChange={set("partyName")} sx={{ flex: 1 }} placeholder={type === "EXPENSE" ? "e.g. Rahim Printers" : "e.g. Member name"} />
            <TextField size="small" label="Reference" value={v.reference || ""} onChange={set("reference")} sx={{ flex: 1 }} placeholder="Receipt no., cheque, bKash TrxID" />
          </Stack>
          <TextField size="small" label="Notes" value={v.description || ""} onChange={set("description")} multiline minRows={2} placeholder="Anything a future treasurer should know" />

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button component="label" size="small" variant="outlined" startIcon={uploading ? <CircularProgress size={16} /> : <AttachFileRounded />} disabled={uploading}>
              {v.attachmentUrl ? "Replace attachment" : "Attach receipt / bill"}
              <input hidden type="file" accept="image/*,application/pdf" onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
            </Button>
            {v.attachmentUrl && (
              <Typography variant="body2" component="a" href={v.attachmentUrl} target="_blank" rel="noreferrer" noWrap sx={{ color: "primary.main", maxWidth: 260 }}>
                View attachment
              </Typography>
            )}
          </Stack>

          {v.memberId ? (
            <Alert severity="info" sx={{ py: 0.25 }}>
              This voucher will be linked to member #{v.memberId}.
            </Alert>
          ) : null}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={save} disabled={saving || !amount} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}>
          {editing ? "Save changes" : `Save ${TYPE_META[type].short.toLowerCase()}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
