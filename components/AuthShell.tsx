"use client";

// components/AuthShell.tsx — split-screen layout for sign-in pages with a living neighbourhood scene.
import React from "react";
import Link from "next/link";
import { Box, Button, Stack, Typography } from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import BrandLogo from "@/components/BrandLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { SceneSvg, SCENES } from "@/components/landing/scenes";
import { SCENE_CSS, SceneDefs } from "@/components/landing/scene-kit";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/lib/shared/settings";

export function SceneStage({ index, paused }: { index: number; paused?: boolean }) {
  return (
    <>
      <style>{SCENE_CSS}</style>
      <SceneDefs />
      <SceneSvg index={index} paused={paused} />
    </>
  );
}

export default function AuthShell({
  scene = 0,
  eyebrow,
  title,
  subtitle,
  children,
  quote = "A neighbourhood is built by its neighbours.",
  site = DEFAULT_SITE_SETTINGS.site,
}: {
  /** Organisation details from site settings. */
  site?: SiteSettings["site"];
  scene?: number;
  eyebrow?: string;
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  quote?: string;
}) {
  const s = SCENES[scene % SCENES.length];
  return (
    <Box sx={{ minHeight: "100svh", display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" }, bgcolor: "background.default" }}>
      {/* Scene panel */}
      <Box sx={{ position: "relative", overflow: "hidden", minHeight: { xs: 230, md: "100svh" }, bgcolor: "#0B1A14", order: { xs: 0, md: 0 } }}>
        <Box sx={{ position: "absolute", inset: 0 }}>
          <SceneStage index={scene} />
        </Box>
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,20,16,.55) 0%, rgba(8,20,16,0) 35%, rgba(8,20,16,.15) 60%, rgba(8,20,16,.85) 100%)" }} />
        <Box sx={{ position: "absolute", top: { xs: 16, md: 28 }, left: { xs: 16, md: 32 } }}>
          <BrandLogo light size={40} name={site.shortName} subtitle={site.name} />
        </Box>
        <Box sx={{ position: "absolute", left: { xs: 16, md: 40 }, right: { xs: 16, md: 40 }, bottom: { xs: 16, md: 40 }, color: "#fff", display: { xs: "none", md: "block" } }}>
          <Typography sx={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.15, maxWidth: 520 }}>“{quote}”</Typography>
          <Typography sx={{ mt: 1.5, opacity: 0.85 }}>
            {s.title} · <Box component="span" sx={{ fontFamily: '"Hind Siliguri", sans-serif' }}>{s.bn}</Box>
          </Typography>
        </Box>
      </Box>

      {/* Form panel */}
      <Box sx={{ display: "flex", flexDirection: "column", px: { xs: 2.5, sm: 6, lg: 10 }, py: { xs: 3, md: 4 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button component={Link} href="/" startIcon={<ArrowBackRounded />} color="inherit" sx={{ color: "text.secondary" }}>
            Home
          </Button>
          <ThemeToggle />
        </Stack>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 460, width: "100%", mx: "auto", py: { xs: 3, md: 6 } }}>
          {eyebrow && (
            <Typography variant="overline" color="secondary" sx={{ mb: 1 }}>
              {eyebrow}
            </Typography>
          )}
          <Typography variant="h3" sx={{ fontSize: { xs: 30, md: 38 } }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
              {subtitle}
            </Typography>
          )}
          {children}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
          © {new Date().getFullYear()} {site.name}
        </Typography>
      </Box>
    </Box>
  );
}
