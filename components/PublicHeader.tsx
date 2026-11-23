"use client";

// components/PublicHeader.tsx — site header for the public pages (transparent over the hero, solid on scroll).
// Home-page sections are links in the bar (one per section); pages that open
// separately (Committee, News, Documents, Track) are grouped under "More ▾" (opens on hover).
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Slide,
  Stack,
  Toolbar,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import MenuRounded from "@mui/icons-material/MenuRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import Groups2Rounded from "@mui/icons-material/Groups2Rounded";
import CampaignRounded from "@mui/icons-material/CampaignRounded";
import DescriptionRounded from "@mui/icons-material/DescriptionRounded";
import ManageSearchRounded from "@mui/icons-material/ManageSearchRounded";
import MoreMenu, { type MoreLink } from "@/components/MoreMenu";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import BrandLogo from "@/components/BrandLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { DEFAULT_SITE_SETTINGS, type HomeSection, type SiteSettings } from "@/lib/shared/settings";

type NavLink = { label: string; href: string; section?: HomeSection };

/** One link per home-page section, in page order. Hidden when that section is off or empty. */
const SECTION_LINKS: NavLink[] = [
  { label: "About", href: "/#about", section: "about" },
  { label: "Why join", href: "/#why", section: "why" },
  { label: "Gallery", href: "/#gallery", section: "gallery" },
  { label: "How to join", href: "/#join", section: "join" },
  { label: "Fees", href: "/#fees", section: "fees" },
  { label: "FAQ", href: "/#faq", section: "faq" },
];

/** Separate pages, under "More ▾". */
const PAGE_LINKS: MoreLink[] = [
  { label: "Executive committee", hint: "Who runs the society", href: "/committee", icon: <Groups2Rounded /> },
  { label: "News & notices", hint: "Updates from the committee", href: "/news", icon: <CampaignRounded /> },
  { label: "Documents", hint: "Constitution, certificates & more", href: "/documents", icon: <DescriptionRounded /> },
  { label: "Track application", hint: "Check your status or pay", href: "/track", icon: <ManageSearchRounded /> },
];

const navSx = { fontWeight: 650, fontSize: 14.5, px: { lg: 1.1, xl: 1.5 }, minWidth: 0, whiteSpace: "nowrap", opacity: 0.9, "&:hover": { opacity: 1 } } as const;

type Props = {
  /** Transparent over a dark hero until the page scrolls. */
  overlay?: boolean;
  /** Organisation details from site settings (defaults until loaded). */
  site?: SiteSettings["site"];
  /** Hide the "Apply" buttons while registration is closed. */
  registrationOpen?: boolean;
  /** Home-page sections that exist (from `visibleHomeSections`); links to others are hidden. */
  sections?: HomeSection[];
};

export default function PublicHeader({ overlay = false, site = DEFAULT_SITE_SETTINGS.site, registrationOpen = true, sections }: Props) {
  const sectionLinks = sections ? SECTION_LINKS.filter(l => !l.section || sections.includes(l.section)) : SECTION_LINKS;
  const theme = useTheme();
  const [scrolled, setScrolled] = useState(!overlay);
  const [farDown, setFarDown] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (overlay) setScrolled(window.scrollY > 40);
      setFarDown(window.scrollY > 560);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  const clear = overlay && !scrolled;
  const close = () => setOpen(false);

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
        <Toolbar sx={{ minHeight: { xs: 64, md: 76 }, maxWidth: 1440, width: "100%", mx: "auto", px: { xs: 2, md: 3, xl: 4 }, gap: { xs: 1.5, lg: 1 } }}>
          <BrandLogo light={clear} size={40} name={site.shortName} subtitle={site.name} />
          <Box sx={{ flex: 1 }} />
          <Stack component="nav" aria-label="Main" direction="row" spacing={0} sx={{ display: { xs: "none", lg: "flex" } }}>
            {sectionLinks.map(l => (
              <Button key={l.href} component={Link} href={l.href} color="inherit" sx={navSx}>
                {l.label}
              </Button>
            ))}
            <MoreMenu items={PAGE_LINKS} sx={navSx} />
          </Stack>
          <ThemeToggle />
          <Button component={Link} href="/auth/login" color="inherit" sx={{ display: { xs: "none", sm: "inline-flex" }, fontWeight: 700 }}>
            Log in
          </Button>
          {registrationOpen && (
            <Button
              component={Link}
              href="/auth/register"
              variant="contained"
              color={clear ? "warning" : "primary"}
              sx={{ display: { xs: "none", sm: "inline-flex" }, ...(clear && { color: "#2B1A00" }) }}
            >
              Apply
            </Button>
          )}
          <IconButton color="inherit" onClick={() => setOpen(true)} sx={{ display: { lg: "none" } }} aria-label="Open menu">
            <MenuRounded />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={open} onClose={close} PaperProps={{ sx: { width: 300, p: 2 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <BrandLogo size={36} name={site.shortName} subtitle={site.name} />
          <IconButton onClick={close} aria-label="Close menu">
            <CloseRounded />
          </IconButton>
        </Stack>
        <List dense>
          {sectionLinks.map(l => (
            <ListItemButton key={l.href} component={Link} href={l.href} onClick={close}>
              <ListItemText primary={l.label} primaryTypographyProps={{ fontWeight: 650, fontSize: 16 }} />
            </ListItemButton>
          ))}
          <ListSubheader disableSticky sx={{ bgcolor: "transparent", lineHeight: "32px", mt: 1 }}>
            More
          </ListSubheader>
          {PAGE_LINKS.map(l => (
            <ListItemButton key={l.href} component={Link} href={l.href} onClick={close} sx={{ gap: 1.5 }}>
              <Box sx={{ display: "grid", placeItems: "center", color: "primary.main", "& svg": { fontSize: 20 } }}>{l.icon}</Box>
              <ListItemText primary={l.label} primaryTypographyProps={{ fontWeight: 650, fontSize: 16 }} />
            </ListItemButton>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={1.25}>
          {registrationOpen && (
            <Button component={Link} href="/auth/register" variant="contained" size="large" onClick={close}>
              Apply for membership
            </Button>
          )}
          <Button component={Link} href="/auth/login" variant="outlined" size="large" onClick={close}>
            Member login
          </Button>
          <Button component={Link} href="/admin/login" color="inherit" onClick={close}>
            Committee sign-in
          </Button>
        </Stack>
      </Drawer>

      {/* Phones: a slim "Apply" bar once the visitor has scrolled past the top of the page. */}
      {registrationOpen && (
        <Slide direction="up" in={farDown} mountOnEnter unmountOnExit>
          <Box
            sx={{
              display: { xs: "block", sm: "none" },
              position: "fixed",
              left: 12,
              right: 12,
              bottom: "calc(12px + env(safe-area-inset-bottom))",
              zIndex: theme.zIndex.appBar,
            }}
          >
            <Button
              component={Link}
              href="/auth/register"
              variant="contained"
              size="large"
              fullWidth
              endIcon={<ArrowForwardRounded />}
              sx={{ py: 1.4, borderRadius: 3, boxShadow: "0 12px 30px -10px rgba(8,20,16,.55)" }}
            >
              Apply for membership
            </Button>
          </Box>
        </Slide>
      )}
    </>
  );
}
