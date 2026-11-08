import React, { useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddRounded from "@mui/icons-material/AddRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import PaymentsRounded from "@mui/icons-material/PaymentsRounded";
import AccountBalanceRounded from "@mui/icons-material/AccountBalanceRounded";
import PhoneIphoneRounded from "@mui/icons-material/PhoneIphoneRounded";
import MenuBookRounded from "@mui/icons-material/MenuBookRounded";
import DashboardLayout from "@/components/dashboard/Layout";
import { PageHeader } from "@/components/dashboard/ui";
import { ACCOUNT_TYPE_LABEL, FundAccount, useAccounts } from "@/components/accounting/data";
import { useAdmin } from "@/lib/useAdmin";
import { money, sendJSON } from "@/lib/format";

type Draft = {
  id?: number;
  name: string;
  type: "CASH" | "BANK" | "MOBILE_BANKING";
  accountNumber: string;
  institution: string;
  branch: string;
  openingBalance: string;
  notes: string;
  isActive: boolean;
};

const ICON = { CASH: <PaymentsRounded />, BANK: <AccountBalanceRounded />, MOBILE_BANKING: <PhoneIphoneRounded /> };
const TONE = { CASH: "#1E8E6E", BANK: "#2F6FDE", MOBILE_BANKING: "#D12053" };

export default function AccountsPage() {
  const { accounts, mutate } = useAccounts();
  const { can } = useAdmin();
  const setup = can("accounting.setup");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const total = accounts.reduce((s, a) => s + a.balance, 0);

  const edit = (a?: FundAccount) =>
    setDraft(
      a
        ? { id: a.id, name: a.name, type: a.type, accountNumber: a.accountNumber || "", institution: a.institution || "", branch: a.branch || "", openingBalance: String(a.openingBalance), notes: a.notes || "", isActive: a.isActive }
        : { name: "", type: "BANK", accountNumber: "", institution: "", branch: "", openingBalance: "0", notes: "", isActive: true }
    );

  const save = async () => {
    if (!draft) return;
    setError("");
    try {
      const body = { ...draft, openingBalance: Number(draft.openingBalance) || 0 };
      if (draft.id) await sendJSON(`/api/accounting/accounts/${draft.id}`, "PATCH", body);
      else await sendJSON("/api/accounting/accounts", "POST", body);
      setDraft(null);
      await mutate();
    } catch (e: any) {
      setError(e?.message || "Could not save");
    }
  };

  return (
    <DashboardLayout title="Cash & bank accounts" permission={["accounting.setup", "accounting.view"]}>
      <PageHeader
        eyebrow="Finance"
        title="Cash & bank accounts"
        subtitle="Where the society's money actually sits. Balances update the moment a voucher is saved."
        actions={
          setup && (
            <Button variant="contained" startIcon={<AddRounded />} onClick={() => edit()}>
              Add account
            </Button>
          )
        }
      />

      <Card sx={{ p: 2.5, mb: 2.5, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <Typography color="text.secondary" sx={{ fontWeight: 700 }}>
          Total across all accounts
        </Typography>
        <Typography sx={{ fontSize: 28, fontWeight: 900, fontVariantNumeric: "tabular-nums", ml: "auto" }}>{money(total)}</Typography>
      </Card>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", xl: "1fr 1fr 1fr" } }}>
        {accounts.map(a => {
          const c = TONE[a.type];
          return (
            <Card key={a.id} sx={{ p: 2.5, opacity: a.isActive ? 1 : 0.6, position: "relative", overflow: "hidden" }}>
              <Box sx={{ position: "absolute", right: -40, top: -40, width: 140, height: 140, borderRadius: "50%", bgcolor: alpha(c, 0.08) }} />
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ position: "relative" }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, display: "grid", placeItems: "center", bgcolor: alpha(c, 0.12), color: c }}>{ICON[a.type]}</Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 750 }} noWrap>
                    {a.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {ACCOUNT_TYPE_LABEL[a.type]}
                    {a.accountNumber ? ` · ${a.accountNumber}` : ""}
                  </Typography>
                </Box>
                {!a.isActive && <Chip size="small" label="Inactive" />}
              </Stack>
              <Typography sx={{ fontSize: 30, fontWeight: 900, mt: 2.5, fontVariantNumeric: "tabular-nums", color: a.balance < 0 ? "error.main" : "text.primary" }}>{money(a.balance)}</Typography>
              <Typography variant="body2" color="text.secondary">
                Opening {money(a.openingBalance, { decimals: false })} · {a.voucherCount || 0} vouchers
              </Typography>
              {(a.institution || a.branch) && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  {[a.institution, a.branch].filter(Boolean).join(", ")}
                </Typography>
              )}
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                {can("accounting.reports") && (
                  <Button size="small" startIcon={<MenuBookRounded />} component={Link} href={`/dashboard/accounting/reports?type=cash-book&accountId=${a.id}`}>
                    {a.type === "CASH" ? "Cash book" : "Bank book"}
                  </Button>
                )}
                {setup && (
                  <Button size="small" color="inherit" startIcon={<EditRounded />} onClick={() => edit(a)}>
                    Edit
                  </Button>
                )}
              </Stack>
            </Card>
          );
        })}
      </Box>

      <Dialog open={!!draft} onClose={() => setDraft(null)} fullWidth maxWidth="sm">
        <DialogTitle>{draft?.id ? "Edit account" : "Add cash / bank account"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField size="small" label="Account name" value={draft?.name || ""} onChange={e => setDraft(d => d && { ...d, name: e.target.value })} sx={{ flex: 2 }} required autoFocus />
              <TextField select size="small" label="Type" value={draft?.type || "BANK"} onChange={e => setDraft(d => d && { ...d, type: e.target.value as any })} sx={{ flex: 1 }}>
                <MenuItem value="CASH">Cash</MenuItem>
                <MenuItem value="BANK">Bank</MenuItem>
                <MenuItem value="MOBILE_BANKING">Mobile banking</MenuItem>
              </TextField>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField size="small" label={draft?.type === "MOBILE_BANKING" ? "Wallet number" : "Account number"} value={draft?.accountNumber || ""} onChange={e => setDraft(d => d && { ...d, accountNumber: e.target.value })} sx={{ flex: 1 }} />
              <TextField size="small" label={draft?.type === "MOBILE_BANKING" ? "Provider (bKash, Nagad…)" : "Bank"} value={draft?.institution || ""} onChange={e => setDraft(d => d && { ...d, institution: e.target.value })} sx={{ flex: 1 }} />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField size="small" label="Branch" value={draft?.branch || ""} onChange={e => setDraft(d => d && { ...d, branch: e.target.value })} sx={{ flex: 1 }} />
              <TextField
                size="small"
                label="Opening balance"
                value={draft?.openingBalance || ""}
                onChange={e => setDraft(d => d && { ...d, openingBalance: e.target.value.replace(/[^\d.-]/g, "") })}
                InputProps={{ startAdornment: <InputAdornment position="start">৳</InputAdornment> }}
                helperText="Balance before the first voucher in this portal"
                sx={{ flex: 1 }}
              />
            </Stack>
            <TextField size="small" label="Notes" value={draft?.notes || ""} onChange={e => setDraft(d => d && { ...d, notes: e.target.value })} multiline minRows={2} />
            {draft?.id && (
              <FormControlLabel control={<Switch checked={draft.isActive} onChange={e => setDraft(d => d && { ...d, isActive: e.target.checked })} />} label="Account in use" />
            )}
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setDraft(null)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={save} disabled={!draft?.name.trim()}>
            Save account
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
