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
import axios from "axios";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import AuthShell from "@/components/AuthShell";

export default function LoginForm() {
  const router = useRouter();
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
      const res = await axios.post(
        "/api/auth/login",
        {
          email: email.trim(),
          password: password.trim(),
        },
        { withCredentials: true }
      );
      if (res.data?.ok) {
        setToast({ open: true, msg: "Login successful", sev: "success" });
        // Force a hard navigation to ensure cookie is applied
        if (typeof window !== "undefined") {
          window.location.assign("/profile");
        } else {
          try {
            router.replace("/profile");
          } catch {
            // no-op
          }
        }
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
        <title>Member login · Purbachal Newtown Society</title>
      </Head>
      <AuthShell
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
            New to PNS?
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
