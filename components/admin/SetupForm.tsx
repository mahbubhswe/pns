"use client";

// First-run setup: create the first Super Admin. Shown only while no staff account exists.
import React, { useState } from "react";
import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import RocketLaunchRounded from "@mui/icons-material/RocketLaunchRounded";
import AuthShell from "@/components/AuthShell";
import { apiPost, errorMessage } from "@/lib/api";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/lib/shared/settings";
import type { AdminLoginResponse } from "@/types/api";

export default function SetupForm({ site = DEFAULT_SITE_SETTINGS.site }: { site?: SiteSettings["site"] }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [submitting, setSubmitting] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const passwordOk = form.password.length >= 8;
  const confirmOk = form.confirm === form.password;
  const canSubmit = form.name.trim() && form.phone.trim() && emailOk && passwordOk && confirmOk && !submitting;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiPost<AdminLoginResponse>("/api/admin/setup", {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      window.location.assign("/dashboard/settings");
    } catch (err) {
      setError(errorMessage(err, "Setup failed"));
      setSubmitting(false);
    }
  }

  const passwordAdornment = {
    endAdornment: (
      <InputAdornment position="end">
        <IconButton aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(v => !v)} edge="end">
          {show ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
  };

  return (
    <AuthShell
      site={site}
      scene={2}
      eyebrow="First-time setup"
      title="Create the first administrator"
      subtitle="No staff account exists yet. This person becomes the Super Admin and can invite everyone else. This page disappears once the account is created."
      quote="Every good neighbourhood starts with someone who shows up first."
    >
      <Box component="form" onSubmit={onSubmit} noValidate>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Full name" value={form.name} onChange={set("name")} required fullWidth autoFocus />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={set("email")}
              error={!!form.email && !emailOk}
              helperText={!!form.email && !emailOk ? "Enter a valid email" : " "}
              autoComplete="username"
              required
              fullWidth
            />
            <TextField label="Phone" value={form.phone} onChange={set("phone")} required fullWidth helperText=" " />
          </Stack>
          <TextField
            label="Password"
            type={show ? "text" : "password"}
            value={form.password}
            onChange={set("password")}
            error={!!form.password && !passwordOk}
            helperText="At least 8 characters"
            autoComplete="new-password"
            required
            fullWidth
            InputProps={passwordAdornment}
          />
          <TextField
            label="Confirm password"
            type={show ? "text" : "password"}
            value={form.confirm}
            onChange={set("confirm")}
            error={!!form.confirm && !confirmOk}
            helperText={!!form.confirm && !confirmOk ? "Passwords do not match" : " "}
            autoComplete="new-password"
            required
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={!canSubmit}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <RocketLaunchRounded />}
            sx={{ py: 1.5 }}
          >
            {submitting ? "Creating…" : "Create admin & continue"}
          </Button>
          <Typography variant="body2" color="text.secondary">
            You&apos;ll be signed in and taken to Site settings to fill in the organisation details, fees and home page.
          </Typography>
        </Stack>
      </Box>
    </AuthShell>
  );
}
