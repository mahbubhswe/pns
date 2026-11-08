"use client";

// components/PublicFooter.tsx — dark footer for the public pages; organisation details come from site settings.
import React from "react";
import Link from "next/link";
import { Box, Container, Link as MLink, Stack, Typography } from "@mui/material";
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
  const has = (s: HomeSection) => !sections || sections.includes(s);
  const contacts = [
    site.contactEmail && { icon: <EmailRounded fontSize="small" />, text: site.contactEmail, href: `mailto:${site.contactEmail}` },
    site.contactPhone && { icon: <PhoneRounded fontSize="small" />, text: site.contactPhone, href: `tel:${site.contactPhone.replace(/[^\d+]/g, "")}` },
    site.address && { icon: <PlaceRounded fontSize="small" />, text: site.address },
  ].filter(Boolean) as Array<{ icon: React.ReactNode; text: string; href?: string }>;
  const tagline = site.tagline.trim() || "A volunteer-run community of plot owners in Purbachal New Town.";
  const lead = /[.!?।]$/.test(tagline) ? tagline : `${tagline}.`;

  return (
    <Box component="footer" sx={{ bgcolor: "#0B1A14", color: "rgba(255,255,255,.82)", pt: { xs: 6, md: 8 }, pb: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: "grid", gap: 4, gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr 1fr" } }}>
          <Box>
            <BrandLogo light size={44} name={site.shortName} subtitle={site.name} />
            <Typography sx={{ mt: 2, maxWidth: 380, lineHeight: 1.7 }}>
              {lead} Working together for a safer, greener and better-planned neighbourhood.
            </Typography>
            <Typography sx={{ mt: 1, fontFamily: '"Hind Siliguri", sans-serif', opacity: 0.8 }}>প্রতিবেশীদের নিয়ে গড়ে ওঠা সমাজ।</Typography>
            {contacts.length > 0 && (
              <Stack spacing={0.75} sx={{ mt: 2.5 }}>
                {contacts.map(c => (
                  <Stack key={c.text} direction="row" spacing={1} alignItems="flex-start">
                    <Box sx={{ color: "#F4A62A", mt: "2px", display: "flex" }}>{c.icon}</Box>
                    {c.href ? (
                      <MLink href={c.href} underline="hover" sx={{ color: "rgba(255,255,255,.82)", "&:hover": { color: "#F4A62A" } }}>
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
            <Typography sx={{ color: "#fff", fontWeight: 800, mb: 0.5 }}>Members</Typography>
            <FooterLink href="/auth/register">Apply for membership</FooterLink>
            <FooterLink href="/auth/login">Member login</FooterLink>
            {has("fees") && <FooterLink href="/#fees">Fees & payment</FooterLink>}
            {has("faq") && <FooterLink href="/#faq">Questions</FooterLink>}
          </Stack>
          <Stack spacing={1}>
            <Typography sx={{ color: "#fff", fontWeight: 800, mb: 0.5 }}>Committee</Typography>
            <FooterLink href="/admin/login">Management portal</FooterLink>
            {has("about") && <FooterLink href="/#about">About Purbachal</FooterLink>}
            {has("why") && <FooterLink href="/#why">Why join</FooterLink>}
          </Stack>
        </Box>
        <Box sx={{ borderTop: "1px solid rgba(255,255,255,.12)", mt: 5, pt: 3, display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "space-between" }}>
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
  return (
    <MLink component={Link} href={href} underline="hover" sx={{ color: "rgba(255,255,255,.78)", "&:hover": { color: "#F4A62A" } }}>
      {children}
    </MLink>
  );
}
