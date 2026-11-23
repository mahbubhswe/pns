"use client";

// Public /committee page: a leadership carousel. The member in the middle is
// shown larger and highlighted; arrows, dots, swipe and ← → move it. Each card
// has a "Biography" button that opens the member's bio and contact details.
import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Alert, Box, Button, Container, Dialog, DialogContent, IconButton, Stack, Typography, useMediaQuery } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import MailRounded from "@mui/icons-material/MailRounded";
import PhoneRounded from "@mui/icons-material/PhoneRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import PublicShell, { PublicPageTitle, type PublicChrome } from "@/components/PublicShell";
import type { CommitteeMemberDto } from "@/types/api";

/** Line-drawn person, shown when a member has no photo yet. */
function Silhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 200" width="70%" height="70%" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M100 30c-17 0-29 13-29 31 0 20 13 37 29 37s29-17 29-37c0-18-12-31-29-31Z" />
      <path d="M86 96l-2 14M114 96l2 14" />
      <path d="M40 200c2-40 18-64 46-72l14 22 14-22c28 8 44 32 46 72" />
      <path d="M86 128l14 34 14-34" />
      <path d="M62 170c12-6 26-8 38-8s26 2 38 8" />
    </svg>
  );
}

function MemberCard({ m, focused, onBio }: { m: CommitteeMemberDto; focused: boolean; onBio: () => void }) {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const primary = theme.palette.primary.main;
  return (
    <Box
      component="article"
      sx={{
        borderRadius: "22px",
        overflow: "hidden",
        bgcolor: "background.paper",
        border: `2px solid ${focused ? primary : "transparent"}`,
        boxShadow: focused
          ? `0 18px 40px -12px ${alpha(primary, dark ? 0.5 : 0.35)}`
          : dark
            ? "0 6px 18px rgba(0,0,0,.35)"
            : "0 6px 18px rgba(20,20,43,.08)",
        transition: "border-color .35s ease, box-shadow .35s ease",
      }}
    >
      <Box sx={{ position: "relative", aspectRatio: "1 / 1", bgcolor: dark ? "#16261F" : "#F4F6F4", display: "grid", placeItems: "center" }}>
        {m.photoUrl ? (
          <Image src={m.photoUrl} alt={m.name} fill sizes="(max-width: 600px) 90vw, 340px" style={{ objectFit: "cover", objectPosition: "top" }} unoptimized />
        ) : (
          <Silhouette color={dark ? "rgba(234,242,238,.55)" : "rgba(18,36,29,.7)"} />
        )}
      </Box>
      <Box sx={{ px: 2, pt: 1.75, pb: 2, textAlign: "center", bgcolor: dark ? "rgba(255,255,255,.04)" : "#EFF2EF" }}>
        <Typography component="h3" sx={{ fontWeight: 800, fontSize: focused ? 20 : 18, color: "primary.main", lineHeight: 1.25, transition: "font-size .3s ease" }}>
          {m.name}
        </Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: "text.secondary", mt: 0.25 }}>{m.position}</Typography>
        <Button
          size="small"
          variant={focused ? "contained" : "contained"}
          color={focused ? "primary" : "inherit"}
          onClick={onBio}
          sx={{
            mt: 1.5,
            px: 2,
            py: 0.4,
            borderRadius: "8px",
            fontSize: 12.5,
            fontWeight: 800,
            ...(!focused && { bgcolor: dark ? "rgba(255,255,255,.14)" : "#6B7280", color: "#fff", "&:hover": { bgcolor: dark ? "rgba(255,255,255,.22)" : "#4B5563" } }),
          }}
        >
          Biography
        </Button>
      </Box>
    </Box>
  );
}

function BioDialog({ m, onClose }: { m: CommitteeMemberDto | null; onClose: () => void }) {
  const theme = useTheme();
  return (
    <Dialog open={!!m} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "22px" } }}>
      {m && (
        <DialogContent sx={{ p: { xs: 2.5, md: 3.5 }, position: "relative" }}>
          <IconButton onClick={onClose} aria-label="Close" sx={{ position: "absolute", top: 10, right: 10 }}>
            <CloseRounded />
          </IconButton>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} alignItems={{ xs: "center", sm: "flex-start" }}>
            <Box sx={{ position: "relative", width: 120, height: 120, flexShrink: 0, borderRadius: "18px", overflow: "hidden", bgcolor: alpha(theme.palette.primary.main, 0.08), display: "grid", placeItems: "center" }}>
              {m.photoUrl ? (
                <Image src={m.photoUrl} alt={m.name} fill sizes="120px" style={{ objectFit: "cover", objectPosition: "top" }} unoptimized />
              ) : (
                <Silhouette color={theme.palette.text.secondary} />
              )}
            </Box>
            <Box sx={{ minWidth: 0, textAlign: { xs: "center", sm: "left" } }}>
              <Typography sx={{ fontWeight: 800, fontSize: 22, color: "primary.main", lineHeight: 1.25 }}>{m.name}</Typography>
              <Typography sx={{ fontWeight: 600, color: "text.secondary" }}>{m.position}</Typography>
              {(m.phone || m.email) && (
                <Stack spacing={0.5} sx={{ mt: 1.25, color: "text.secondary", alignItems: { xs: "center", sm: "flex-start" } }}>
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
          </Stack>
          <Typography sx={{ mt: 2.5, lineHeight: 1.75, whiteSpace: "pre-line", color: m.bio ? "text.primary" : "text.secondary" }}>
            {m.bio || "A biography will be added soon."}
          </Typography>
        </DialogContent>
      )}
    </Dialog>
  );
}

/** Carousel: three cards on wide screens (middle one focused), one on phones. */
function LeaderCarousel({ members, onBio }: { members: CommitteeMemberDto[]; onBio: (m: CommitteeMemberDto) => void }) {
  const theme = useTheme();
  const wide = useMediaQuery(theme.breakpoints.up("md"));
  const n = members.length;
  const [index, setIndex] = useState(0);
  const go = useCallback((d: number) => setIndex(i => (i + d + n) % n), [n]);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /input|textarea/i.test(e.target.tagName)) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // Offsets shown around the focused card: -1, 0, +1 on wide screens (only when there are enough members).
  const offsets = wide && n >= 3 ? [-1, 0, 1] : wide && n === 2 ? [0, 1] : [0];
  const arrowSx = {
    width: 44,
    height: 44,
    bgcolor: "background.paper",
    boxShadow: theme.palette.mode === "dark" ? "0 4px 12px rgba(0,0,0,.4)" : "0 4px 12px rgba(20,20,43,.10)",
    "&:hover": { bgcolor: "background.paper", color: "primary.main" },
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 2.5 }} justifyContent="center">
        {n > 1 && (
          <IconButton aria-label="Previous member" onClick={() => go(-1)} sx={arrowSx}>
            <ChevronLeftRounded />
          </IconButton>
        )}
        <Box
          onTouchStart={e => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={e => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
          sx={{ display: "grid", gridTemplateColumns: `repeat(${offsets.length}, minmax(0, 1fr))`, alignItems: "center", gap: { xs: 0, md: 3 }, width: { xs: "100%", md: offsets.length === 3 ? 900 : offsets.length === 2 ? 620 : 340 }, maxWidth: "100%" }}
        >
          {offsets.map(off => {
            const i = (index + off + n) % n;
            const m = members[i];
            const focused = off === 0;
            return (
              <Box
                key={m.id}
                onClick={() => !focused && setIndex(i)}
                sx={{
                  cursor: focused ? "default" : "pointer",
                  // Side cards: a little smaller, fully opaque (like the reference); the middle one is focused.
                  transform: focused ? "scale(1)" : "scale(.88)",
                  transition: "transform .45s cubic-bezier(.22,1,.36,1)",
                }}
              >
                <MemberCard m={m} focused={focused} onBio={() => onBio(m)} />
              </Box>
            );
          })}
        </Box>
        {n > 1 && (
          <IconButton aria-label="Next member" onClick={() => go(1)} sx={arrowSx}>
            <ChevronRightRounded />
          </IconButton>
        )}
      </Stack>
      {n > 1 && (
        <Stack direction="row" spacing={0.75} justifyContent="center" sx={{ mt: 3 }}>
          {members.map((m, i) => (
            <Box
              key={m.id}
              component="button"
              type="button"
              aria-label={`Show ${m.name}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              sx={{ appearance: "none", border: 0, p: 0, cursor: "pointer", height: 8, width: i === index ? 24 : 8, borderRadius: 999, bgcolor: i === index ? "primary.main" : "divider", transition: "all .25s ease" }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

/** Public /committee page: the executive committee as a leadership carousel. */
export default function CommitteeView({ members, ...chrome }: PublicChrome & { members: CommitteeMemberDto[] }) {
  const [bio, setBio] = useState<CommitteeMemberDto | null>(null);
  return (
    <PublicShell {...chrome}>
      <PublicPageTitle title="Governance & Leadership" intro={`The elected executive committee of ${chrome.site.name}.`} />
      <Container maxWidth="lg">
        {members.length === 0 ? (
          <Alert severity="info">The committee list will be published here soon.</Alert>
        ) : (
          <LeaderCarousel members={members} onBio={setBio} />
        )}
      </Container>
      <BioDialog m={bio} onClose={() => setBio(null)} />
    </PublicShell>
  );
}
