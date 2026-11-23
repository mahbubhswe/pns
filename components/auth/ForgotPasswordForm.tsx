"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Alert, Box, Button, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import AuthShell from "@/components/AuthShell";
import { apiPost, errorMessage } from "@/lib/api";
import type { SiteSettings } from "@/lib/shared/settings";

const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

export default function ForgotPasswordForm({ site }: { site: SiteSettings["site"] }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailOk(email)) return;
    setBusy(true);
    setError("");
    try {
      await apiPost("/api/auth/password/forgot", { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(errorMessage(err, "Could not send the link. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      site={site}
      scene={2}
      eyebrow="Members"
      title="Forgot your password?"
      subtitle="Enter the email you used on your application. We'll send you a link to set a new password."
    >
      {sent ? (
        <Stack spacing={2}>
          <Alert severity="success">
            If <b>{email.trim()}</b> belongs to a member account, a link is on its way. It works for 1 hour — check your spam folder too.
          </Alert>
          <Button component={Link} href="/auth/login" variant="outlined" size="large">
            Back to sign in
          </Button>
        </Stack>
      ) : (
        <Box component="form" onSubmit={onSubmit} noValidate>
          <Stack spacing={2.25}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={!!email && !emailOk(email)}
              helperText={!!email && !emailOk(email) ? "Enter a valid email" : " "}
              autoComplete="email"
              autoFocus
              fullWidth
            />
            <Button
              type="submit"
              size="large"
              variant="contained"
              disabled={busy || !emailOk(email)}
              startIcon={busy ? <CircularProgress size={18} color="inherit" /> : undefined}
              sx={{ py: 1.5 }}
            >
              {busy ? "Sending…" : "Send reset link"}
            </Button>
          </Stack>
        </Box>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: "center" }}>
        No email on your membership? Contact the committee — they can send you a set-up link.
      </Typography>
    </AuthShell>
  );
}
