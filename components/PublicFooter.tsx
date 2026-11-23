"use client";

// components/PublicFooter.tsx — footer for the public pages (follows the light/dark theme); organisation details come from site settings.
import React from "react";
import Link from "next/link";
import { Box, Container, Link as MLink, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import LazyScene from "@/components/landing/LazyScene";
import { SCENE_CSS, SceneDefs } from "@/components/landing/scene-kit";
import EmailRounded from "@mui/icons-material/EmailRounded";
import PhoneRounded from "@mui/icons-material/PhoneRounded";
import PlaceRounded from "@mui/icons-material/PlaceRounded";
import BrandLogo from "@/components/BrandLogo";
import { DEFAULT_SITE_SETTINGS, type HomeSection, type SiteSettings } from "@/lib/shared/settings";

export default function PublicFooter({
  site = DEFAULT_SITE_SETTINGS.site,
  sections,
}: {
  site?: SiteSettings["site"];
  /** Home-page sections that exist; links to hidden ones are left out. */
  sections?: HomeSection[];
}) {
  const dark = useTheme().palette.mode === "dark";
  const has = (s: HomeSection) => !sections || sections.includes(s);
  const contacts = [
    site.contactEmail && { icon: <EmailRounded fontSize="small" />, text: site.contactEmail, href: `mailto:${site.contactEmail}` },
    site.contactPhone && { icon: <PhoneRounded fontSize="small" />, text: site.contactPhone, href: `tel:${site.contactPhone.replace(/[^\d+]/g, "")}` },
    site.address && { icon: <PlaceRounded fontSize="small" />, text: site.address },
  ].filter(Boolean) as Array<{ icon: React.ReactNode; text: string; href?: string }>;
  const tagline = site.tagline.trim() || "A volunteer-run community of plot owners in Purbachal New Town.";
  const lead = /[.!?।]$/.test(tagline) ? tagline : `${tagline}.`;

  return (
    <Box
      component="footer"
      sx={{
        position: "relative",
        overflow: "hidden",
        isolation: "isolate",
        bgcolor: "background.default",
        borderTop: 1,
        borderColor: "divider",
        color: "text.secondary",
        pt: { xs: 6, md: 8 },
        pb: { xs: 4, md: 5 },
      }}
    >
      {/* One soft, still illustration in the background (same in light and dark). It fades out toward
          the top, and a fade rising from the bottom keeps the bottom of the footer clean. */}
      <style>{SCENE_CSS}</style>
      <SceneDefs />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: -1,
          opacity: dark ? 0.14 : 0.18,
          filter: "saturate(.7)",
          maskImage: "linear-gradient(180deg, transparent 0%, #000 40%, #000 58%, transparent 88%)",
          WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 40%, #000 58%, transparent 88%)",
          pointerEvents: "none",
          "& .pns-scene": { width: "100%", height: "100%" },
        }}
      >
        <LazyScene index={0} paused />
      </Box>
      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Box sx={{ display: "grid", gap: 4, gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr 1fr" } }}>
          <Box>
            <BrandLogo light={dark} size={44} name={site.shortName} subtitle={site.name} />
            <Typography sx={{ mt: 2, maxWidth: 380, lineHeight: 1.7 }}>
              {lead} Working together for a safer, greener and better-planned neighbourhood.
            </Typography>
            <Typography sx={{ mt: 1, fontFamily: 'var(--font-hind), sans-serif', opacity: 0.8 }}>প্রতিবেশীদের নিয়ে গড়ে ওঠা সমাজ।</Typography>
            {contacts.length > 0 && (
              <Stack spacing={0.75} sx={{ mt: 2.5 }}>
                {contacts.map(c => (
                  <Stack key={c.text} direction="row" spacing={1} alignItems="flex-start">
                    <Box sx={{ color: dark ? "#F4A62A" : "primary.main", mt: "2px", display: "flex" }}>{c.icon}</Box>
                    {c.href ? (
                      <MLink href={c.href} underline="hover" sx={{ color: "text.secondary", "&:hover": { color: dark ? "#F4A62A" : "primary.main" } }}>
                        {c.text}
                      </MLink>
                    ) : (
                      <Typography sx={{ whiteSpace: "pre-line" }}>{c.text}</Typography>
                    )}
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>
          <Stack spacing={1}>
            <Typography sx={{ color: "text.primary", fontWeight: 800, mb: 0.5 }}>Members</Typography>
            <FooterLink href="/auth/register">Apply for membership</FooterLink>
            <FooterLink href="/auth/login">Member login</FooterLink>
            {has("join") && <FooterLink href="/#join">How to join</FooterLink>}
            {has("fees") && <FooterLink href="/#fees">Fees & payment</FooterLink>}
            <FooterLink href="/track">Track application</FooterLink>
            {has("faq") && <FooterLink href="/#faq">Questions</FooterLink>}
          </Stack>
          <Stack spacing={1}>
            <Typography sx={{ color: "text.primary", fontWeight: 800, mb: 0.5 }}>Committee</Typography>
            <FooterLink href="/admin/login">Management portal</FooterLink>
            {has("about") && <FooterLink href="/#about">About Purbachal</FooterLink>}
            {has("why") && <FooterLink href="/#why">Why join</FooterLink>}
            {has("gallery") && <FooterLink href="/#gallery">Gallery</FooterLink>}
            {has("committee") && <FooterLink href="/#committee">Executive committee</FooterLink>}
            <FooterLink href="/news">News & notices</FooterLink>
            <FooterLink href="/documents">Documents</FooterLink>
          </Stack>
        </Box>
        <Box sx={{ borderTop: 1, borderColor: "divider", mt: 5, pt: 3, display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            © {new Date().getFullYear()} {site.name}. Made by neighbours, for neighbours.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Your information is used only for membership and kept confidential.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const dark = useTheme().palette.mode === "dark";
  return (
    <MLink component={Link} href={href} underline="hover" sx={{ color: "text.secondary", "&:hover": { color: dark ? "#F4A62A" : "primary.main" } }}>
      {children}
    </MLink>
  );
}
