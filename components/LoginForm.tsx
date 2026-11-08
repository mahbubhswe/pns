"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Divider,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import { apiPost, errorMessage } from "@/lib/api";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/lib/shared/settings";
import type { MemberLoginResponse } from "@/types/api";

export default function LoginForm({ site = DEFAULT_SITE_SETTINGS.site }: { site?: SiteSettings["site"] }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [show, setShow] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    sev: "success" | "error" | "info" | "warning";
  }>({ open: false, msg: "", sev: "success" });

  const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailOk(email) || password.trim().length < 6) {
      setToast({ open: true, msg: "Enter valid credentials", sev: "error" });
      return;
    }
    try {
      setSubmitting(true);
      const res = await apiPost<MemberLoginResponse>("/api/auth/login", {
        email: email.trim(),
        password: password.trim(),
      });
      if (!res?.ok) throw new Error("Login failed");
      setToast({ open: true, msg: "Login successful", sev: "success" });
      // Hard navigation so the new cookie is sent with the next request.
      window.location.assign("/profile");
    } catch (err) {
      setToast({ open: true, msg: errorMessage(err, "Login failed"), sev: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <AuthShell
        site={site}
        scene={1}
        eyebrow="Members"
        title="Welcome back, neighbour"
        subtitle="Sign in to see your application, your plot details and updates from the committee."
      >
        <Box component="form" onSubmit={onSubmit} action="/api/auth/login" method="post" noValidate>
          <Stack spacing={2.25}>
            <TextField
              name="email"
              label="Email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={!!email && !emailOk(email)}
              helperText={!!email && !emailOk(email) ? "Enter a valid email" : " "}
              autoComplete="username"
              fullWidth
              required
            />
            <TextField
              name="password"
              label="Password"
              type={show ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              helperText={password && password.length < 6 ? "Min 6 characters" : " "}
              error={!!password && password.length < 6}
              autoComplete="current-password"
              fullWidth
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label="Show password" onClick={() => setShow(v => !v)} edge="end">
                      {show ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              size="large"
              variant="contained"
              disabled={submitting || !emailOk(email) || password.length < 6}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
              sx={{ py: 1.5 }}
            >
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </Stack>
        </Box>
        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            New to {site.shortName}?
          </Typography>
        </Divider>
        <Button component={Link} href="/auth/register" variant="outlined" size="large" startIcon={<PersonAddIcon />} fullWidth>
          Apply for membership
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: "center" }}>
          Committee member? <Link href="/admin/login">Sign in to the management portal</Link>
        </Typography>
      </AuthShell>

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast({ ...toast, open: false })}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.sev} variant="filled" sx={{ width: "100%" }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
