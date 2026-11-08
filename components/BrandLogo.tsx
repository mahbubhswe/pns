// components/BrandLogo.tsx — PNS mark: a home on the lake with the morning sun.
import React from "react";
import Link from "next/link";
import { Box, Typography } from "@mui/material";

export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <Box component="svg" viewBox="0 0 64 64" sx={{ width: size, height: size, flexShrink: 0, display: "block" }} aria-hidden>
      <rect width="64" height="64" rx="16" fill="#0F6E56" />
      <path d="M14 34 32 18l18 16v14a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2Z" fill="#F6F4EE" />
      <path d="M26 50V38h12v12" fill="#0F6E56" />
      <circle cx="45" cy="17" r="6" fill="#F4A62A" />
      <path d="M10 54c8-4 14-4 22 0s14 4 22 0" stroke="#E2553C" strokeWidth="3" fill="none" strokeLinecap="round" />
    </Box>
  );
}

export default function BrandLogo({
  href = "/",
  size = 40,
  light = false,
  compact = false,
  subtitle = "Purbachal Newtown Society",
}: {
  href?: string;
  size?: number;
  light?: boolean;
  compact?: boolean;
  subtitle?: string;
}) {
  return (
    <Box
      component={Link}
      href={href}
      sx={{ display: "inline-flex", alignItems: "center", gap: 1.25, textDecoration: "none", color: light ? "#fff" : "text.primary", minWidth: 0 }}
      aria-label="Purbachal Newtown Society home"
    >
      <BrandMark size={size} />
      {!compact && (
        <Box sx={{ lineHeight: 1, minWidth: 0 }}>
          <Typography component="span" sx={{ display: "block", fontWeight: 800, fontSize: size * 0.45, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            PNS
          </Typography>
          <Typography
            component="span"
            noWrap
            sx={{ display: "block", fontSize: Math.max(10.5, size * 0.27), fontWeight: 600, opacity: light ? 0.85 : 0.7, lineHeight: 1.2 }}
          >
            {subtitle}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
