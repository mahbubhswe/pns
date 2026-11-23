"use client";

// Site settings → Payment: SSLCommerz credentials. Saved on its own (not with
// "Save settings"); the password is write-only and never shown again.
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { Alert, Button, Card, CardContent, CardHeader, Chip, CircularProgress, FormControlLabel, Stack, Switch, TextField } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { apiGet, apiPut, errorMessage } from "@/lib/api";
import type { GatewaySettingsDto, GatewaySettingsResponse } from "@/types/api";

export default function GatewaySettingsCard({ onSaved, onError }: { onSaved: (msg: string) => void; onError: (msg: string) => void }) {
  const { data, isLoading, mutate } = useSWR<GatewaySettingsResponse>("/api/admin/payment-gateway", apiGet);
  const [form, setForm] = useState<Omit<GatewaySettingsDto, "hasPassword" | "passwordUnreadable"> & { storePassword: string }>({
    enabled: false,
    sandbox: true,
    storeId: "",
    storePassword: "",
  });
  const [saving, setSaving] = useState(false);
  const g = data?.gateway;

  useEffect(() => {
    if (g) setForm({ enabled: g.enabled, sandbox: g.sandbox, storeId: g.storeId, storePassword: "" });
  }, [g]);

  async function save() {
    setSaving(true);
    try {
      const res = await apiPut<GatewaySettingsResponse>("/api/admin/payment-gateway", {
        ...form,
        storePassword: form.storePassword || undefined,
      });
      await mutate(res, { revalidate: false });
      setForm(f => ({ ...f, storePassword: "" }));
      onSaved("Online payment settings saved");
    } catch (err) {
      onError(errorMessage(err, "Could not save online payment settings"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardHeader
        title="Online payment (SSLCommerz)"
        subheader="Applicants pay the fee online after submitting the form. Get the Store ID and password from your SSLCommerz merchant panel."
        action={
          g && (
            <Chip
              size="small"
              color={g.enabled && g.hasPassword ? "success" : "default"}
              label={g.enabled && g.hasPassword ? (g.sandbox ? "On · sandbox (test)" : "On · live") : "Off"}
              sx={{ mt: 1, mr: 1 }}
            />
          )
        }
      />
      <CardContent>
        {isLoading ? (
          <CircularProgress size={24} />
        ) : (
          <Stack spacing={2}>
            {!g?.enabled && (
              <Alert severity="warning">While online payment is off, the registration form can&apos;t take new applications.</Alert>
            )}
            {g?.passwordUnreadable && (
              <Alert severity="error">The saved password can no longer be read (the server secret changed). Enter it again.</Alert>
            )}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="Store ID" value={form.storeId} onChange={e => setForm(f => ({ ...f, storeId: e.target.value }))} fullWidth autoComplete="off" />
              <TextField
                label="Store password"
                type="password"
                value={form.storePassword}
                onChange={e => setForm(f => ({ ...f, storePassword: e.target.value }))}
                fullWidth
                autoComplete="new-password"
                placeholder={g?.hasPassword ? "•••••••• (saved)" : ""}
                InputLabelProps={{ shrink: Boolean(g?.hasPassword || form.storePassword) }}
                helperText={g?.hasPassword ? "Leave empty to keep the saved password." : "Stored encrypted; it is never shown again."}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
              <FormControlLabel
                control={<Switch checked={form.sandbox} onChange={e => setForm(f => ({ ...f, sandbox: e.target.checked }))} />}
                label="Sandbox (test mode — no real money)"
              />
              <FormControlLabel
                control={<Switch checked={form.enabled} onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))} />}
                label="Take payments online"
              />
            </Stack>
            <div>
              <Button type="button" variant="contained" startIcon={<SaveIcon />} onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save online payment"}
              </Button>
            </div>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
