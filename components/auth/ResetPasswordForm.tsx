"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, Stack, TextField } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AuthShell from "@/components/AuthShell";
import { apiGet, apiPost, errorMessage } from "@/lib/api";
import type { SiteSettings } from "@/lib/shared/settings";

type LinkInfo = { name: string; needsEmail: boolean };
const INVALID = "This link is invalid or has expired. Please ask for a new one.";
const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

export default function ResetPasswordForm({ site, token }: { site: SiteSettings["site"]; token: string }) {
  const [info, setInfo] = useState<LinkInfo | null>(null);
  const [linkError, setLinkError] = useState(token ? "" : INVALID);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    apiGet<LinkInfo>(`/api/auth/password/reset?token=${encodeURIComponent(token)}`)
      .then(setInfo)
      .catch(err => setLinkError(errorMessage(err, INVALID)));
  }, [token]);

  const tooShort = password.length > 0 && password.length < 8;
  const mismatch = confirm.length > 0 && confirm !== password;
  const ready = !!info && password.length >= 8 && confirm === password && (!info.needsEmail || emailOk(email));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError("");
    try {
      await apiPost("/api/auth/password/reset", { token, password, ...(info?.needsEmail && { email: email.trim() }) });
      // The response signs the member in; hard navigation so the cookie is sent.
      window.location.assign("/profile");
    } catch (err) {
      setError(errorMessage(err, "Could not save the password."));
      setBusy(false);
    }
  }

  const eye = (
    <InputAdornment position="end">
      <IconButton aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(v => !v)} edge="end">
        {show ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <AuthShell
      site={site}
      scene={2}
      eyebrow="Members"
      title={info ? `Hi ${info.name.split(" ")[0]}, set your password` : "Set a new password"}
      subtitle="Choose a password of at least 8 characters. You'll be signed in right after."
    >
      {linkError ? (
        <Stack spacing={2}>
          <Alert severity="error">{linkError}</Alert>
          <Button component={Link} href="/auth/forgot" variant="contained" size="large">
            Get a new link
          </Button>
        </Stack>
      ) : !info ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box component="form" onSubmit={onSubmit} noValidate>
          <Stack spacing={2.25}>
            {error && <Alert severity="error">{error}</Alert>}
            {info.needsEmail && (
              <TextField
                label="Your email address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                error={!!email && !emailOk(email)}
                helperText={!!email && !emailOk(email) ? "Enter a valid email" : "You'll use this email to sign in."}
                autoComplete="email"
                fullWidth
              />
            )}
            <TextField
              label="New password"
              type={show ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={tooShort}
              helperText={tooShort ? "At least 8 characters" : " "}
              autoComplete="new-password"
              fullWidth
              InputProps={{ endAdornment: eye }}
            />
            <TextField
              label="Confirm password"
              type={show ? "text" : "password"}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              error={mismatch}
              helperText={mismatch ? "Passwords don't match" : " "}
              autoComplete="new-password"
              fullWidth
            />
            <Button
              type="submit"
              size="large"
              variant="contained"
              disabled={busy || !ready}
              startIcon={busy ? <CircularProgress size={18} color="inherit" /> : undefined}
              sx={{ py: 1.5 }}
            >
              {busy ? "Saving…" : "Save password & sign in"}
            </Button>
          </Stack>
        </Box>
      )}
    </AuthShell>
  );
}
