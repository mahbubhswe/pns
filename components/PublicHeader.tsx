"use client";

// components/PublicHeader.tsx — site header for the public pages (transparent over the hero, solid on scroll).
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppBar, Box, Button, Divider, Drawer, IconButton, List, ListItemButton, ListItemText, Stack, Toolbar } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import MenuRounded from "@mui/icons-material/MenuRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import BrandLogo from "@/components/BrandLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/lib/shared/settings";

const LINKS = [
  { label: "About Purbachal", href: "/#about" },
  { label: "Why join", href: "/#why" },
  { label: "How to join", href: "/#join" },
  { label: "Fees", href: "/#fees" },
  { label: "FAQ", href: "/#faq" },
];

type Props = {
  /** Transparent over a dark hero until the page scrolls. */
  overlay?: boolean;
  /** Organisation details from site settings (defaults until loaded). */
  site?: SiteSettings["site"];
  /** Hide the "Join" buttons while registration is closed. */
  registrationOpen?: boolean;
};

export default function PublicHeader({ overlay = false, site = DEFAULT_SITE_SETTINGS.site, registrationOpen = true }: Props) {
  const theme = useTheme();
  const [scrolled, setScrolled] = useState(!overlay);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  const clear = overlay && !scrolled;

  return (
    <>
      <AppBar
        position={overlay ? "fixed" : "sticky"}
        sx={{
          bgcolor: clear ? "transparent" : alpha(theme.palette.background.default, 0.86),
          backdropFilter: clear ? "none" : "saturate(180%) blur(14px)",
          borderBottom: `1px solid ${clear ? "transparent" : theme.palette.divider}`,
          color: clear ? "#fff" : "text.primary",
          transition: "background-color .3s ease, border-color .3s ease, color .3s ease",
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, md: 76 }, maxWidth: 1360, width: "100%", mx: "auto", px: { xs: 2, md: 4 }, gap: 2 }}>
          <BrandLogo light={clear} size={40} name={site.shortName} subtitle={site.name} />
          <Box sx={{ flex: 1 }} />
          <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", lg: "flex" } }}>
            {LINKS.map(l => (
              <Button key={l.href} component={Link} href={l.href} color="inherit" sx={{ fontWeight: 650, opacity: 0.9, "&:hover": { opacity: 1 } }}>
                {l.label}
              </Button>
            ))}
          </Stack>
          <ThemeToggle />
          <Button component={Link} href="/auth/login" color="inherit" sx={{ display: { xs: "none", sm: "inline-flex" }, fontWeight: 700 }}>
            Member login
          </Button>
          {registrationOpen && (
            <Button component={Link} href="/auth/register" variant="contained" color={clear ? "warning" : "primary"} sx={{ display: { xs: "none", sm: "inline-flex" }, ...(clear && { color: "#2B1A00" }) }}>
              Join {site.shortName}
            </Button>
          )}
          <IconButton color="inherit" onClick={() => setOpen(true)} sx={{ display: { lg: "none" } }} aria-label="Open menu">
            <MenuRounded />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { width: 300, p: 2 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <BrandLogo size={36} name={site.shortName} subtitle={site.name} />
          <IconButton onClick={() => setOpen(false)} aria-label="Close menu">
            <CloseRounded />
          </IconButton>
        </Stack>
        <List>
          {LINKS.map(l => (
            <ListItemButton key={l.href} component={Link} href={l.href} onClick={() => setOpen(false)}>
              <ListItemText primary={l.label} primaryTypographyProps={{ fontWeight: 650 }} />
            </ListItemButton>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={1.25}>
          {registrationOpen && (
            <Button component={Link} href="/auth/register" variant="contained" size="large" onClick={() => setOpen(false)}>
              Join {site.shortName}
            </Button>
          )}
          <Button component={Link} href="/auth/login" variant="outlined" size="large" onClick={() => setOpen(false)}>
            Member login
          </Button>
          <Button component={Link} href="/admin/login" color="inherit" onClick={() => setOpen(false)}>
            Committee sign-in
          </Button>
        </Stack>
      </Drawer>
    </>
  );
}
