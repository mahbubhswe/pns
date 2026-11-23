"use client";

// Public "track my application": reference number + phone → status.
import React, { useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { Alert, Box, Button, Card, CircularProgress, Container, Stack, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchRounded from "@mui/icons-material/SearchRounded";
import HourglassTopRounded from "@mui/icons-material/HourglassTopRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import HighlightOffRounded from "@mui/icons-material/HighlightOffRounded";
import PublicShell, { PublicPageTitle, type PublicChrome } from "@/components/PublicShell";
import { apiPost, errorMessage } from "@/lib/api";
import { MEMBER_TYPE_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/shared/membership";
import type { StartPaymentResponse, TrackApplicationDto, TrackApplicationResponse } from "@/types/api";

const STATUS = {
  PENDING: {
    label: "Under review",
    color: "#B7791F",
    icon: <HourglassTopRounded />,
    note: "The committee is checking your documents and payment. This usually takes a few days.",
  },
  APPROVED: {
    label: "Approved",
    color: "#1F7A4F",
    icon: <CheckCircleRounded />,
    note: "Welcome to the society! Sign in to see your membership details.",
  },
  REJECTED: {
    label: "Not approved",
    color: "#C0392B",
    icon: <HighlightOffRounded />,
    note: "Your application was not approved. Please contact the committee for details.",
  },
} as const;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ py: 1.25, borderTop: t => `1px solid ${t.palette.divider}` }}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography sx={{ fontWeight: 700, textAlign: "right" }}>{value}</Typography>
    </Stack>
  );
}

function Result({ app, phone }: { app: TrackApplicationDto; phone: string }) {
  const s = STATUS[app.status];
  const unpaid = app.paymentStatus !== "PAID";
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  async function payNow() {
    setPaying(true);
    setPayError("");
    try {
      const res = await apiPost<StartPaymentResponse>("/api/payments/start", { ref: app.ref, phone });
      window.location.assign(res.paymentUrl);
    } catch (err) {
      setPayError(errorMessage(err, "Could not open the payment page."));
      setPaying(false);
    }
  }

  return (
    <Card sx={{ p: { xs: 2.5, md: 3.5 }, mt: 3 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: alpha(s.color, 0.12), color: s.color }}>{s.icon}</Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Status
          </Typography>
          <Typography sx={{ fontWeight: 800, fontSize: 20, color: s.color }}>{s.label}</Typography>
        </Box>
      </Stack>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {s.note}
      </Typography>
      <Row label="Reference" value={app.ref} />
      <Row label="Applicant" value={app.name} />
      <Row label="Membership" value={MEMBER_TYPE_LABELS[app.membershipType].label} />
      <Row label="Submitted" value={dayjs(app.submittedAt).format("D MMM YYYY")} />
      <Row label="Payment" value={`${PAYMENT_STATUS_LABELS[app.paymentStatus]} · BDT ${app.membershipFee.toLocaleString("en-IN")}`} />
      {app.pnsId && <Row label="PNS ID" value={app.pnsId} />}
      {unpaid && (
        <>
          <Alert severity="warning" sx={{ mt: 2 }}>
            The committee reviews your application after the membership fee is paid.
          </Alert>
          {payError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {payError}
            </Alert>
          )}
          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={payNow} disabled={paying} startIcon={paying ? <CircularProgress size={18} color="inherit" /> : undefined}>
            {paying ? "Opening payment…" : `Pay BDT ${app.membershipFee.toLocaleString("en-IN")} online`}
          </Button>
        </>
      )}
      {app.status === "APPROVED" && (
        <Button component={Link} href="/auth/login" variant="contained" fullWidth sx={{ mt: 2 }}>
          Sign in
        </Button>
      )}
    </Card>
  );
}

export default function TrackView(chrome: PublicChrome) {
  const [ref, setRef] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [app, setApp] = useState<TrackApplicationDto | null>(null);

  const ready = ref.trim().length > 0 && phone.replace(/\D/g, "").length >= 10;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError("");
    setApp(null);
    try {
      const res = await apiPost<TrackApplicationResponse>("/api/applications/track", { ref: ref.trim(), phone: phone.trim() });
      setApp(res.application);
    } catch (err) {
      setError(errorMessage(err, "Could not look up the application."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PublicShell {...chrome}>
      <PublicPageTitle
        maxWidth="sm"
        title="Track your application"
        intro="Enter your reference number and the phone number you used on the form."
      />
      <Container maxWidth="sm">
        <Card component="form" onSubmit={onSubmit} noValidate sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Stack spacing={2}>
            <TextField
              label="Reference number"
              placeholder="APP-2026-00042"
              value={ref}
              onChange={e => setRef(e.target.value.toUpperCase())}
              inputProps={{ autoCapitalize: "characters", spellCheck: false }}
              fullWidth
            />
            <TextField label="Phone number" placeholder="01XXXXXXXXX" type="tel" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" fullWidth />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={busy || !ready}
              startIcon={busy ? <CircularProgress size={18} color="inherit" /> : <SearchRounded />}
            >
              {busy ? "Checking…" : "Check status"}
            </Button>
          </Stack>
        </Card>
        {error && (
          <Alert severity="warning" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
        {app && <Result app={app} phone={phone} />}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: "center" }}>
          Lost your reference number? It is in the confirmation email and the application PDF.
        </Typography>
      </Container>
    </PublicShell>
  );
}
