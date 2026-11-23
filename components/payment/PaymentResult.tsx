"use client";

// Where the payment gateway sends the applicant back to.
import React from "react";
import Link from "next/link";
import { Box, Button, Card, Container, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRounded from "@mui/icons-material/ErrorOutlineRounded";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import PublicShell, { type PublicChrome } from "@/components/PublicShell";

const VIEW = {
  success: {
    color: "#1F7A4F",
    icon: <CheckCircleRounded sx={{ fontSize: 44 }} />,
    title: "Payment received",
    text: "Thank you! Your application is complete and the committee will review it. A copy has been emailed to you.",
  },
  failed: {
    color: "#C0392B",
    icon: <ErrorOutlineRounded sx={{ fontSize: 44 }} />,
    title: "Payment not completed",
    text: "Your application is saved, but the payment didn't go through. You can try again — no money is taken twice.",
  },
  cancelled: {
    color: "#B7791F",
    icon: <ErrorOutlineRounded sx={{ fontSize: 44 }} />,
    title: "Payment cancelled",
    text: "Your application is saved. Pay whenever you're ready from Track your application.",
  },
} as const;

export default function PaymentResult({ status, applicationRef, ...chrome }: PublicChrome & { status: keyof typeof VIEW; applicationRef: string }) {
  const v = VIEW[status];
  return (
    <PublicShell {...chrome}>
      <Container maxWidth="sm">
        <Card sx={{ p: { xs: 3, md: 5 }, textAlign: "center" }}>
          <Box sx={{ width: 72, height: 72, mx: "auto", borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: alpha(v.color, 0.12), color: v.color }}>{v.icon}</Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mt: 2 }}>
            {v.title}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {v.text}
          </Typography>
          {applicationRef && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Your reference number
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                <Typography sx={{ fontSize: 28, fontWeight: 900, letterSpacing: 1 }}>{applicationRef}</Typography>
                <Tooltip title="Copy">
                  <IconButton aria-label="Copy reference number" onClick={() => navigator.clipboard?.writeText(applicationRef).catch(() => {})}>
                    <ContentCopyRounded />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          )}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="center" sx={{ mt: 3 }}>
            <Button component={Link} href="/track" variant="contained" size="large">
              {status === "success" ? "Track your application" : "Pay now"}
            </Button>
            <Button component={Link} href="/" variant="outlined" size="large">
              Home
            </Button>
          </Stack>
        </Card>
      </Container>
    </PublicShell>
  );
}
