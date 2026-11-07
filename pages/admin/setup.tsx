import React, { useState } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { apiPost, errorMessage } from "@/lib/api";
import { needsInitialSetup } from "@/features/management-user";
import type { AdminLoginResponse } from "@/types/api";

/**
 * First-run page. Reachable only while the ManagementUser table is empty;
 * afterwards the server redirects to the normal admin login.
 */
export const getServerSideProps: GetServerSideProps = async () => {
  if (!(await needsInitialSetup())) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }
  return { props: {} };
};

export default function AdminSetupPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [submitting, setSubmitting] = useState(false);
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

  return (
    <>
      <Head>
        <title>Initial Setup</title>
      </Head>
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", bgcolor: "background.default" }}>
        <Container maxWidth="sm" sx={{ py: 6 }}>
          <Stack spacing={1} sx={{ mb: 3, textAlign: "center" }}>
            <Typography variant="h4" fontWeight={800}>
              Welcome
            </Typography>
            <Typography color="text.secondary">
              No administrator exists yet. Create the first admin account to start configuring the site.
              This page disappears once the account is created.
            </Typography>
          </Stack>

          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardHeader title="Create administrator" subheader="You will be signed in automatically" />
            <CardContent>
              <Box component="form" onSubmit={onSubmit} noValidate>
                <Stack spacing={2}>
                  {error && <Alert severity="error">{error}</Alert>}
                  <TextField label="Full name" value={form.name} onChange={set("name")} required fullWidth autoFocus />
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
                  <TextField label="Phone" value={form.phone} onChange={set("phone")} required fullWidth />
                  <TextField
                    label="Password"
                    type="password"
                    value={form.password}
                    onChange={set("password")}
                    error={!!form.password && !passwordOk}
                    helperText={!!form.password && !passwordOk ? "At least 8 characters" : " "}
                    autoComplete="new-password"
                    required
                    fullWidth
                  />
                  <TextField
                    label="Confirm password"
                    type="password"
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
                    startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
                  >
                    {submitting ? "Creating…" : "Create admin & continue"}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
}
