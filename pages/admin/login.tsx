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
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ShieldRounded from "@mui/icons-material/ShieldRounded";
import axios from "axios";
import Head from "next/head";
import AuthShell from "@/components/AuthShell";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [show, setShow] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; msg: string; sev: "success" | "error" | "info" | "warning" }>({ open: false, msg: "", sev: "success" });

  const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailOk(email) || password.trim().length < 6) {
      setToast({ open: true, msg: "Enter valid credentials", sev: "error" });
      return;
    }
    try {
      setSubmitting(true);
      const res = await axios.post("/api/admin/login", { email: email.trim(), password: password.trim() });
      if (res.data?.ok) {
        setToast({ open: true, msg: "Welcome", sev: "success" });
        if (typeof window !== "undefined") window.location.assign("/dashboard");
      } else {
        throw new Error("Login failed");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Login failed";
      setToast({ open: true, msg, sev: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Management portal · PNS</title>
      </Head>
      <AuthShell
        scene={14}
        eyebrow="Management portal"
        title="Committee sign-in"
        subtitle="For PNS volunteers and staff. Your role decides what you can see once you're in."
        quote="Every approval and every receipt here helps a neighbour."
      >
        <Box component="form" onSubmit={onSubmit} action="/api/admin/login" method="post" noValidate>
          <Stack spacing={2.25}>
            <TextField
              name="email"
              label="Work email"
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
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <ShieldRounded />}
              sx={{ py: 1.5 }}
            >
              {submitting ? "Signing in…" : "Sign in securely"}
            </Button>
          </Stack>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          Forgot your password or locked out? Ask a Super Admin to reset it from Staff users.
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
