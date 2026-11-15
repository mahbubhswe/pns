"use client";

import Image from "next/image";
import { Alert, Box, Card, Container, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import MailRounded from "@mui/icons-material/MailRounded";
import PhoneRounded from "@mui/icons-material/PhoneRounded";
import PublicShell, { PublicPageTitle, type PublicChrome } from "@/components/PublicShell";
import { initials } from "@/lib/format";
import type { CommitteeMemberDto } from "@/types/api";

function MemberCard({ m }: { m: CommitteeMemberDto }) {
  const theme = useTheme();
  return (
    <Card sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <Box sx={{ position: "relative", aspectRatio: "4 / 4.2", bgcolor: alpha(theme.palette.primary.main, 0.1), display: "grid", placeItems: "center" }}>
        {m.photoUrl ? (
          <Image src={m.photoUrl} alt={m.name} fill sizes="(max-width: 600px) 100vw, 320px" style={{ objectFit: "cover", objectPosition: "top" }} unoptimized />
        ) : (
          <Typography sx={{ fontSize: 56, fontWeight: 800, color: "primary.main", opacity: 0.6 }}>{initials(m.name)}</Typography>
        )}
      </Box>
      <Box sx={{ p: 2.5, flex: 1 }}>
        <Typography variant="overline" color="secondary.main" sx={{ lineHeight: 1.4, display: "block" }}>
          {m.position}
        </Typography>
        <Typography sx={{ fontWeight: 800, fontSize: 19, lineHeight: 1.25, mb: 0.75 }}>{m.name}</Typography>
        {m.bio && (
          <Typography color="text.secondary" sx={{ fontSize: 14.5, lineHeight: 1.6, whiteSpace: "pre-line" }}>
            {m.bio}
          </Typography>
        )}
        {(m.phone || m.email) && (
          <Stack spacing={0.5} sx={{ mt: 1.5, color: "text.secondary" }}>
            {m.phone && (
              <Stack direction="row" spacing={0.75} alignItems="center">
                <PhoneRounded sx={{ fontSize: 16 }} />
                <Typography variant="body2" component="a" href={`tel:${m.phone.replace(/[^\d+]/g, "")}`} sx={{ color: "inherit" }}>
                  {m.phone}
                </Typography>
              </Stack>
            )}
            {m.email && (
              <Stack direction="row" spacing={0.75} alignItems="center">
                <MailRounded sx={{ fontSize: 16 }} />
                <Typography variant="body2" component="a" href={`mailto:${m.email}`} sx={{ color: "inherit", wordBreak: "break-all" }}>
                  {m.email}
                </Typography>
              </Stack>
            )}
          </Stack>
        )}
      </Box>
    </Card>
  );
}

/** Public /committee page: photo, position and short bio of each EC member. */
export default function CommitteeView({ members, ...chrome }: PublicChrome & { members: CommitteeMemberDto[] }) {
  return (
    <PublicShell {...chrome}>
      <PublicPageTitle
        eyebrow="Executive committee"
        title="The people serving our society"
        intro={`Meet the elected executive committee of ${chrome.site.name}.`}
      />
      <Container maxWidth="lg">
        {members.length === 0 ? (
          <Alert severity="info">The committee list will be published here soon.</Alert>
        ) : (
          <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" } }}>
            {members.map(m => (
              <MemberCard key={m.id} m={m} />
            ))}
          </Box>
        )}
      </Container>
    </PublicShell>
  );
}
