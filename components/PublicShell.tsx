"use client";

import { Box, Container, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { publicCards } from "@/components/home/parts";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import type { HomeSection, SiteSettings } from "@/lib/shared/settings";

/** Header/footer data every public page loads from settings on the server. */
export type PublicChrome = { site: SiteSettings["site"]; sections: HomeSection[]; registrationOpen: boolean };

/** Standard frame for public pages: header, main area, footer. */
export default function PublicShell({ site, sections, registrationOpen, children }: PublicChrome & { children: React.ReactNode }) {
  const dark = useTheme().palette.mode === "dark";
  return (
    <>
      <PublicHeader site={site} sections={sections} registrationOpen={registrationOpen} />
      <Box component="main" sx={{ minHeight: "60vh", py: { xs: 5, md: 8 }, ...publicCards(dark) }}>
        {children}
      </Box>
      <PublicFooter site={site} sections={sections} />
    </>
  );
}

/** Page heading used by the public list pages. */
export function PublicPageTitle({ title, intro, maxWidth = "lg" }: { title: string; intro?: string; maxWidth?: "sm" | "md" | "lg" }) {
  return (
    <Container maxWidth={maxWidth} sx={{ mb: 4 }}>
      <Typography variant="h3" sx={{ fontSize: { xs: 30, md: 42 }, mb: 1 }}>
        {title}
      </Typography>
      {intro && (
        <Typography color="text.secondary" sx={{ maxWidth: 680 }}>
          {intro}
        </Typography>
      )}
    </Container>
  );
}
