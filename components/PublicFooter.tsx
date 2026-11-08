// components/PublicFooter.tsx
import React from "react";
import Link from "next/link";
import { Box, Container, Link as MLink, Stack, Typography } from "@mui/material";
import BrandLogo from "@/components/BrandLogo";

export default function PublicFooter() {
  return (
    <Box component="footer" sx={{ bgcolor: "#0B1A14", color: "rgba(255,255,255,.82)", pt: { xs: 6, md: 8 }, pb: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: "grid", gap: 4, gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr 1fr" } }}>
          <Box>
            <BrandLogo light size={44} />
            <Typography sx={{ mt: 2, maxWidth: 380, lineHeight: 1.7 }}>
              A volunteer-run community of plot owners in Purbachal New Town, working together for a safer, greener and better-planned neighbourhood.
            </Typography>
            <Typography sx={{ mt: 1, fontFamily: '"Hind Siliguri", sans-serif', opacity: 0.8 }}>পূর্বাচল নিউটাউন সোসাইটি — প্রতিবেশীদের নিয়ে গড়ে ওঠা সমাজ।</Typography>
          </Box>
          <Stack spacing={1}>
            <Typography sx={{ color: "#fff", fontWeight: 800, mb: 0.5 }}>Members</Typography>
            <FooterLink href="/auth/register">Apply for membership</FooterLink>
            <FooterLink href="/auth/login">Member login</FooterLink>
            <FooterLink href="/#fees">Fees & payment</FooterLink>
            <FooterLink href="/#faq">Questions</FooterLink>
          </Stack>
          <Stack spacing={1}>
            <Typography sx={{ color: "#fff", fontWeight: 800, mb: 0.5 }}>Committee</Typography>
            <FooterLink href="/admin/login">Management portal</FooterLink>
            <FooterLink href="/#about">About Purbachal</FooterLink>
            <FooterLink href="/#why">Why join</FooterLink>
          </Stack>
        </Box>
        <Box sx={{ borderTop: "1px solid rgba(255,255,255,.12)", mt: 5, pt: 3, display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            © {new Date().getFullYear()} Purbachal Newtown Society. Made by neighbours, for neighbours.
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
