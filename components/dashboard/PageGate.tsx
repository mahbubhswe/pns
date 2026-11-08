"use client";

// components/dashboard/PageGate.tsx — sets the tab title and hides a dashboard page
// from staff whose role doesn't include the permission. The API enforces the same
// permissions; this only keeps people from landing on a page that can't load.
import React, { PropsWithChildren, useEffect } from "react";
import Link from "next/link";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import LockPersonRounded from "@mui/icons-material/LockPersonRounded";
import { useAdmin } from "@/lib/useAdmin";
import type { Permission } from "@/lib/shared/permissions";

type Props = PropsWithChildren<{
  /** Browser tab title */
  title?: string;
  /** Show the page only to staff holding one of these permissions */
  permission?: Permission | Permission[];
}>;

export default function PageGate({ title, permission, children }: Props) {
  const { admin, loading, can } = useAdmin();

  useEffect(() => {
    if (title) document.title = `${title} · PNS Admin`;
  }, [title]);

  if (loading && !admin) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (permission && !can(permission)) return <NoAccess />;
  return <>{children}</>;
}

function NoAccess() {
  return (
    <Stack alignItems="center" spacing={2} sx={{ py: { xs: 8, md: 12 }, textAlign: "center" }}>
      <Box sx={{ width: 72, height: 72, borderRadius: 4, display: "grid", placeItems: "center", bgcolor: "action.hover", color: "text.secondary" }}>
        <LockPersonRounded sx={{ fontSize: 36 }} />
      </Box>
      <Typography variant="h5">This area isn&apos;t part of your role</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 440 }}>
        Your account doesn&apos;t have permission to open this page. If you need it for your work, ask a Super Admin to update your role.
      </Typography>
      <Button component={Link} href="/dashboard" variant="contained">
        Back to dashboard
      </Button>
    </Stack>
  );
}
