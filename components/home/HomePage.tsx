"use client";

// Landing page (client component). All copy, fees and sections come from site
// settings (dashboard → Settings → Landing page); only layout, icons and the
// animated scenes live here. In text, `*words*` are highlighted and a new line
// starts a new paragraph (Bangla lines get the Bangla font automatically).
import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  Container,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import LoginRounded from "@mui/icons-material/LoginRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import MapRounded from "@mui/icons-material/MapRounded";
import PlaceRounded from "@mui/icons-material/PlaceRounded";
import AltRouteRounded from "@mui/icons-material/AltRouteRounded";
import ApartmentRounded from "@mui/icons-material/ApartmentRounded";
import CampaignRounded from "@mui/icons-material/CampaignRounded";
import NotificationsActiveRounded from "@mui/icons-material/NotificationsActiveRounded";
import Diversity3Rounded from "@mui/icons-material/Diversity3Rounded";
import ShieldRounded from "@mui/icons-material/ShieldRounded";
import ParkRounded from "@mui/icons-material/ParkRounded";
import ReceiptLongRounded from "@mui/icons-material/ReceiptLongRounded";
import FolderSharedRounded from "@mui/icons-material/FolderSharedRounded";
import PaymentsRounded from "@mui/icons-material/PaymentsRounded";
import EditNoteRounded from "@mui/icons-material/EditNoteRounded";
import TaskAltRounded from "@mui/icons-material/TaskAltRounded";
import LockRounded from "@mui/icons-material/LockRounded";
import PhoneIphoneRounded from "@mui/icons-material/PhoneIphoneRounded";
import AccountBalanceRounded from "@mui/icons-material/AccountBalanceRounded";
import HeroScenes from "@/components/landing/HeroScenes";
import { SceneSvg } from "@/components/landing/scenes";
import { SCENE_CSS, SceneDefs } from "@/components/landing/scene-kit";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { renderTemplate, stripStepNumber, type HeroSlide, type SiteSettings } from "@/lib/shared/settings";

type Props = { settings: SiteSettings };

const ABOUT_ICONS = [<MapRounded key="m" />, <PlaceRounded key="p" />, <AltRouteRounded key="a" />, <ApartmentRounded key="b" />];
const BENEFIT_ICONS = [
  <CampaignRounded key="c" />,
  <NotificationsActiveRounded key="n" />,
  <Diversity3Rounded key="d" />,
  <ShieldRounded key="s" />,
  <ParkRounded key="p" />,
  <ReceiptLongRounded key="r" />,
];
const STEP_ICONS = [<FolderSharedRounded key="f" />, <PaymentsRounded key="p" />, <EditNoteRounded key="e" />, <TaskAltRounded key="t" />];
const iconAt = (icons: React.ReactNode[], i: number) => icons[i % icons.length];

const HERO_HEIGHT = { xs: "max(640px, 92svh)", md: "min(max(680px, 92vh), 920px)" };
const HERO_WASH = {
  xs: "linear-gradient(180deg, rgba(8,20,16,.55) 0%, rgba(8,20,16,.15) 28%, rgba(8,20,16,.25) 55%, rgba(8,20,16,.88) 100%)",
  md: "linear-gradient(90deg, rgba(8,20,16,.80) 0%, rgba(8,20,16,.55) 32%, rgba(8,20,16,.08) 62%, rgba(8,20,16,0) 100%), linear-gradient(180deg, rgba(8,20,16,.45) 0%, rgba(8,20,16,0) 22%, rgba(8,20,16,0) 70%, rgba(8,20,16,.55) 100%)",
};
const BANGLA = /[ঀ-৿]/;
const BANGLA_FONT = '"Hind Siliguri", sans-serif';

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

const bdt = (n: number) => n.toLocaleString("en-IN");

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="span"
      sx={{
        position: "relative",
        whiteSpace: "nowrap",
        zIndex: 0,
        "&::after": {
          content: '""',
          position: "absolute",
          left: "-2%",
          right: "-2%",
          bottom: "0.08em",
          height: "0.34em",
          bgcolor: "#F4A62A",
          opacity: 0.85,
          borderRadius: "4px",
          zIndex: -1,
          transform: "skewX(-8deg)",
        },
      }}
    >
      {children}
    </Box>
  );
}

/** Render `*highlighted*` parts; with `lastWord`, highlight the final word when nothing is marked. */
function RichText({ text, lastWord = false }: { text: string; lastWord?: boolean }) {
  if (!text.includes("*") && lastWord) {
    const m = text.match(/^([\s\S]*\s)(\S+)$/);
    if (m) {
      return (
        <>
          {m[1]}
          <Highlight>{m[2]}</Highlight>
        </>
      );
    }
  }
  const parts = text.split(/\*([^*]+)\*/g);
  return <>{parts.map((part, i) => (i % 2 ? <Highlight key={i}>{part}</Highlight> : <React.Fragment key={i}>{part}</React.Fragment>))}</>;
}

/** One Typography per line; Bangla lines use the Bangla font. */
function Paragraphs({ text, sx, banglaSx }: { text: string; sx?: object; banglaSx?: object }) {
  const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);
  return (
    <>
      {lines.map((line, i) => (
        <Typography key={i} sx={{ ...sx, ...(i > 0 && { mt: 1 }), ...(BANGLA.test(line) && { fontFamily: BANGLA_FONT, ...banglaSx }) }}>
          {line}
        </Typography>
      ))}
    </>
  );
}

function SectionTitle({ eyebrow, title, sub, center }: { eyebrow: string; title: string; sub?: string; center?: boolean }) {
  return (
    <Box sx={{ textAlign: center ? "center" : "left", maxWidth: center ? 760 : 640, mx: center ? "auto" : 0, mb: { xs: 4, md: 6 } }}>
      <Typography variant="overline" color="secondary" sx={{ display: "block", mb: 1 }}>
        {eyebrow}
      </Typography>
      {title && (
        <Typography variant="h2" sx={{ fontSize: { xs: 30, sm: 38, md: 46 } }}>
          <RichText text={title} />
        </Typography>
      )}
      {sub && (
        <Box sx={{ mt: 2 }}>
          <Paragraphs text={sub} sx={{ color: "text.secondary", fontSize: { md: 18 }, lineHeight: 1.7 }} />
        </Box>
      )}
    </Box>
  );
}

function CopyLine({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false);
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 1, borderBottom: t => `1px dashed ${t.palette.divider}`, "&:last-of-type": { borderBottom: 0 } }}>
      <Typography variant="body2" color="text.secondary" sx={{ flex: "0 0 120px", fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography sx={{ flex: 1, fontWeight: 750, fontVariantNumeric: "tabular-nums", letterSpacing: ".02em", wordBreak: "break-word" }}>{value}</Typography>
      <Tooltip title={done ? "Copied" : "Copy"}>
        <IconButton
          size="small"
          aria-label={`Copy ${label}`}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setDone(true);
              setTimeout(() => setDone(false), 1600);
            } catch {}
          }}
        >
          {done ? <CheckRounded fontSize="small" color="success" /> : <ContentCopyRounded fontSize="small" />}
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

/** Photo slider used when Settings → Landing page → Hero style is "Photos". */
function PhotoHero({ slides, fallbackAlt, children }: { slides: HeroSlide[]; fallbackAlt: string; children: React.ReactNode }) {
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const reduce = useReducedMotion();
  const n = slides.length;
  const go = (i: number) => setIndex(((i % n) + n) % n);

  useEffect(() => {
    if (n <= 1 || hovering || reduce) return;
    const t = setTimeout(() => setIndex(i => (i + 1) % n), 6500);
    return () => clearTimeout(t);
  }, [index, n, hovering, reduce]);

  const slide = slides[Math.min(index, n - 1)];

  return (
    <Box component="section" aria-roledescription="carousel" aria-label="Photos of Purbachal New Town" sx={{ position: "relative", height: HERO_HEIGHT, overflow: "hidden", bgcolor: "#0B1A14", isolation: "isolate" }}>
      <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }} onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
        <AnimatePresence initial={false}>
          <motion.div key={`${index}-${slide.src}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.1 }} style={{ position: "absolute", inset: 0 }}>
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                animation: reduce ? "none" : "pns-kenburns 9s ease-out forwards",
                "@keyframes pns-kenburns": { from: { transform: "scale(1.12) translate3d(-1%, 1%, 0)" }, to: { transform: "scale(1) translate3d(0, 0, 0)" } },
              }}
            >
              {/* `unoptimized` so admins may use images from any host. */}
              <Image src={slide.src} alt={slide.alt || fallbackAlt} fill priority={index === 0} unoptimized sizes="100vw" style={{ objectFit: "cover" }} />
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>
      <Box aria-hidden sx={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: HERO_WASH }} />
      <Box sx={{ position: "relative", zIndex: 2, height: "100%" }}>{children}</Box>
      {n > 1 && (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ position: "absolute", zIndex: 3, right: { xs: 16, md: 40 }, bottom: { xs: 16, md: 40 } }}>
          <Stack direction="row" spacing={0.75} sx={{ mr: 1 }}>
            {slides.map((s, i) => (
              <Box
                key={`${i}-${s.src}`}
                component="button"
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
                sx={{ appearance: "none", border: 0, p: 0, cursor: "pointer", width: i === index ? 22 : 8, height: 8, borderRadius: 999, transition: "all .25s", bgcolor: i === index ? "#F4A62A" : "rgba(255,255,255,.55)" }}
              />
            ))}
          </Stack>
          {[
            { label: "Previous photo", icon: <ChevronLeftRounded />, to: index - 1 },
            { label: "Next photo", icon: <ChevronRightRounded />, to: index + 1 },
          ].map(b => (
            <IconButton
              key={b.label}
              aria-label={b.label}
              onClick={() => go(b.to)}
              sx={{ color: "#fff", width: 44, height: 44, borderRadius: 3, bgcolor: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.25)", backdropFilter: "blur(8px)", "&:hover": { bgcolor: "rgba(255,255,255,.22)" } }}
            >
              {b.icon}
            </IconButton>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default function HomePage({ settings }: Props) {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const { home, site, payment, registration } = settings;
  const t = (text: string) => renderTemplate(text, settings);
  const open = registration.open;
  const usePhotos = home.heroStyle === "photos" && home.slides.length > 0;
  const hasBkash = Boolean(payment.bkashNumber);
  const hasBank = Boolean(payment.bankAccountNumber);

  const heroCopy = (
    <Container maxWidth="lg" sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: { xs: "flex-end", md: "center" }, pb: { xs: 14, md: 16 }, pt: { xs: 9, md: 8 } }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
        <Box sx={{ maxWidth: 660, color: "#fff" }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ display: "inline-flex", px: 1.5, py: 0.75, borderRadius: 999, bgcolor: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.25)", backdropFilter: "blur(10px)", mb: 2.5 }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: open ? "#4ADE95" : "#F4A62A",
                ...(open && {
                  boxShadow: "0 0 0 0 rgba(74,222,149,.7)",
                  animation: "pns-ping 1.8s infinite",
                  "@keyframes pns-ping": { "70%": { boxShadow: "0 0 0 10px rgba(74,222,149,0)" }, "100%": { boxShadow: "0 0 0 0 rgba(74,222,149,0)" } },
                }),
              }}
            />
            <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>
              {open ? "Membership open" : "Registration closed for now"}
              <Box component="span" sx={{ fontFamily: BANGLA_FONT, fontWeight: 600, opacity: 0.85, ml: 1 }}>
                {open ? "· সদস্যপদ চলছে" : "· নিবন্ধন সাময়িক বন্ধ"}
              </Box>
            </Typography>
          </Stack>
          <Typography component="h1" sx={{ fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.02, fontSize: { xs: 36, sm: 54, md: 68 }, textShadow: "0 2px 30px rgba(0,0,0,.25)" }}>
            <RichText text={t(home.heroTitle)} lastWord />
          </Typography>
          {home.heroSubtitle && (
            <Box sx={{ mt: { xs: 1.5, md: 2.5 }, maxWidth: 560 }}>
              <Paragraphs text={t(home.heroSubtitle)} sx={{ fontSize: { xs: 15, md: 19 }, lineHeight: 1.6, opacity: 0.92 }} banglaSx={{ fontSize: { xs: 16, md: 18 }, opacity: 0.85 }} />
            </Box>
          )}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ mt: { xs: 2.5, md: 4 } }}>
            {open && (
              <Button component={Link} href="/auth/register" size="large" variant="contained" color="warning" endIcon={<ArrowForwardRounded />} sx={{ color: "#2B1A00", px: 3.5, py: { xs: 1.25, md: 1.6 }, fontSize: 16.5 }}>
                Become a member
              </Button>
            )}
            <Button
              component={Link}
              href="/auth/login"
              size="large"
              variant="outlined"
              startIcon={<LoginRounded />}
              sx={{ color: "#fff", borderColor: "rgba(255,255,255,.55)", px: 3, py: { xs: 1.25, md: 1.6 }, fontSize: 16, backdropFilter: "blur(6px)", "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,.08)" } }}
            >
              Member login
            </Button>
          </Stack>
          {!open && registration.closedMessage && <Typography sx={{ mt: 2, opacity: 0.9, maxWidth: 520 }}>{registration.closedMessage}</Typography>}
          <Stack direction="row" spacing={{ xs: 2, sm: 3 }} useFlexGap flexWrap="wrap" sx={{ mt: 3.5, opacity: 0.9, display: { xs: "none", sm: "flex" } }}>
            {[
              { i: <PaymentsRounded fontSize="small" />, t: `One-time fee ৳${bdt(payment.feeBkash)}` },
              { i: <PhoneIphoneRounded fontSize="small" />, t: "Apply from your phone" },
              { i: <LockRounded fontSize="small" />, t: "Your data stays private" },
            ].map(x => (
              <Stack key={x.t} direction="row" spacing={0.75} alignItems="center">
                {x.i}
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{x.t}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </motion.div>
    </Container>
  );

  const stats = [
    { n: "30", l: "Planned sectors", s: "in Purbachal New Town" },
    { n: `৳${bdt(payment.feeBkash)}`, l: "One-time fee", s: "paid once when you apply" },
    ...(home.steps.length ? [{ n: String(home.steps.length), l: "Simple steps", s: "documents, payment, form" }] : []),
    { n: "100%", l: "Online", s: "apply & track from anywhere" },
  ];

  const stepCols = Math.min(Math.max(home.steps.length, 1), 3);

  return (
    <>
      <PublicHeader overlay site={site} registrationOpen={open} />

      <main>
        {/* Scene CSS + gradients are supplied by HeroScenes; add them for the photo hero too. */}
        {usePhotos && (
          <>
            <style>{SCENE_CSS}</style>
            <SceneDefs />
          </>
        )}

        {/* HERO */}
        {usePhotos ? (
          <PhotoHero slides={home.slides} fallbackAlt={site.name}>
            {heroCopy}
          </PhotoHero>
        ) : (
          <HeroScenes>{heroCopy}</HeroScenes>
        )}

        {/* STAT BAND */}
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 4, mt: { xs: 3, md: -6 } }}>
          <Card sx={{ p: { xs: 1, md: 1.5 }, display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: `repeat(${stats.length}, 1fr)` }, boxShadow: dark ? "none" : "0 30px 60px -30px rgba(18,36,29,.35)" }}>
            {stats.map((x, i) => (
              <Box key={x.l} sx={{ p: { xs: 2, md: 3 }, borderLeft: { md: i ? `1px solid ${theme.palette.divider}` : 0 }, borderTop: { xs: i > 1 ? `1px solid ${theme.palette.divider}` : 0, md: 0 } }}>
                <Typography sx={{ fontSize: { xs: 30, md: 40 }, fontWeight: 800, letterSpacing: "-0.03em", color: "primary.main", lineHeight: 1 }}>{x.n}</Typography>
                <Typography sx={{ fontWeight: 750, mt: 1 }}>{x.l}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {x.s}
                </Typography>
              </Box>
            ))}
          </Card>
        </Container>

        {/* ABOUT */}
        {(home.aboutTitle || home.aboutIntro || home.aboutPoints.length > 0) && (
          <Box id="about" sx={{ py: { xs: 8, md: 13 }, scrollMarginTop: 80 }}>
            <Container maxWidth="lg">
              <Box sx={{ display: "grid", gap: { xs: 5, md: 8 }, gridTemplateColumns: { xs: "1fr", md: "1fr 1.1fr" }, alignItems: "center" }}>
                <motion.div {...reveal}>
                  <SectionTitle eyebrow="About Purbachal" title={t(home.aboutTitle)} sub={t(home.aboutIntro)} />
                  <Stack spacing={2.5}>
                    {home.aboutPoints.map((f, i) => (
                      <Stack key={`${i}-${f.title}`} direction="row" spacing={2}>
                        <Box sx={{ width: 48, height: 48, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main", flexShrink: 0 }}>{iconAt(ABOUT_ICONS, i)}</Box>
                        <Box>
                          <Typography sx={{ fontWeight: 750, fontSize: 17 }}>{t(f.title)}</Typography>
                          <Typography color="text.secondary">{t(f.body)}</Typography>
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                </motion.div>
                <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }}>
                  <Box sx={{ borderRadius: 6, overflow: "hidden", aspectRatio: "16 / 11", boxShadow: "0 40px 80px -40px rgba(18,36,29,.55)", border: `1px solid ${theme.palette.divider}` }}>
                    <SceneSvg index={18} />
                  </Box>
                </motion.div>
              </Box>
            </Container>
          </Box>
        )}

        {/* WHY JOIN */}
        {home.benefits.length > 0 && (
          <Box id="why" sx={{ py: { xs: 8, md: 12 }, bgcolor: dark ? "#0E1C17" : "#EFEBE2", scrollMarginTop: 80 }}>
            <Container maxWidth="lg">
              <motion.div {...reveal}>
                <SectionTitle center eyebrow={`Why join ${site.shortName}`} title={t(home.benefitsTitle)} sub={t(home.benefitsIntro)} />
              </motion.div>
              <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" } }}>
                {home.benefits.map((b, i) => (
                  <motion.div key={`${i}-${b.title}`} {...reveal} transition={{ ...reveal.transition, delay: (i % 6) * 0.06 }}>
                    <Card
                      sx={{
                        p: 3,
                        height: "100%",
                        transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease",
                        "&:hover": { transform: "translateY(-4px)", borderColor: alpha(theme.palette.primary.main, 0.4), boxShadow: dark ? "none" : "0 24px 40px -24px rgba(18,36,29,.35)" },
                      }}
                    >
                      <Box sx={{ width: 52, height: 52, borderRadius: 3.5, display: "grid", placeItems: "center", bgcolor: i % 2 ? alpha(theme.palette.secondary.main, 0.12) : alpha(theme.palette.primary.main, 0.12), color: i % 2 ? "secondary.main" : "primary.main", mb: 2 }}>
                        {iconAt(BENEFIT_ICONS, i)}
                      </Box>
                      <Typography sx={{ fontWeight: 800, fontSize: 19, mb: 0.75 }}>{t(b.title)}</Typography>
                      <Typography color="text.secondary" sx={{ lineHeight: 1.65 }}>
                        {t(b.body)}
                      </Typography>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            </Container>
          </Box>
        )}

        {/* HOW TO JOIN */}
        {home.steps.length > 0 && (
          <Box id="join" sx={{ py: { xs: 8, md: 13 }, scrollMarginTop: 80 }}>
            <Container maxWidth="lg">
              <motion.div {...reveal}>
                <SectionTitle eyebrow="How to join" title={t(home.stepsTitle)} />
              </motion.div>
              <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: `repeat(${stepCols}, 1fr)` }, position: "relative" }}>
                {home.steps.length > 1 && home.steps.length <= 3 && (
                  <Box aria-hidden sx={{ display: { xs: "none", md: "block" }, position: "absolute", top: 34, left: "12%", right: "12%", height: 2, background: `repeating-linear-gradient(90deg, ${theme.palette.divider} 0 10px, transparent 10px 18px)` }} />
                )}
                {home.steps.map((s, i) => (
                  <motion.div key={`${i}-${s.title}`} {...reveal} transition={{ ...reveal.transition, delay: (i % 3) * 0.1 }}>
                    <Box sx={{ position: "relative" }}>
                      <Box sx={{ width: 68, height: 68, borderRadius: 5, display: "grid", placeItems: "center", bgcolor: "primary.main", color: "primary.contrastText", position: "relative", boxShadow: `0 14px 30px -14px ${theme.palette.primary.main}` }}>
                        {iconAt(STEP_ICONS, i)}
                        <Box sx={{ position: "absolute", top: -8, right: -8, width: 26, height: 26, borderRadius: "50%", bgcolor: "warning.main", color: "#2B1A00", fontWeight: 900, fontSize: 13, display: "grid", placeItems: "center", border: `3px solid ${theme.palette.background.default}` }}>{i + 1}</Box>
                      </Box>
                      <Typography sx={{ fontWeight: 800, fontSize: 20, mt: 2.5, mb: 1 }}>{stripStepNumber(t(s.title))}</Typography>
                      <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {t(s.body)}
                      </Typography>
                    </Box>
                  </motion.div>
                ))}
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 6 }}>
                {open && (
                  <Button component={Link} href="/auth/register" variant="contained" size="large" endIcon={<ArrowForwardRounded />}>
                    Start my application
                  </Button>
                )}
                {home.faqs.length > 0 && (
                  <Button component="a" href="#faq" variant="outlined" size="large">
                    Read the FAQ
                  </Button>
                )}
              </Stack>
            </Container>
          </Box>
        )}

        {/* FEES */}
        {(hasBkash || hasBank) && (
          <Box id="fees" sx={{ pb: { xs: 8, md: 12 }, pt: home.steps.length ? 0 : { xs: 8, md: 12 }, scrollMarginTop: 80 }}>
            <Container maxWidth="lg">
              <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", md: hasBkash && hasBank ? "1fr 1fr" : "1fr" } }}>
                {hasBkash && (
                  <motion.div {...reveal}>
                    <Card sx={{ p: { xs: 2.5, md: 3.5 }, height: "100%", position: "relative", overflow: "hidden" }}>
                      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, bgcolor: "#D12053" }} />
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: alpha("#D12053", 0.12), color: "#D12053", flexShrink: 0 }}>
                          <PhoneIphoneRounded />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: 19 }}>Pay with bKash</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Send Money from any bKash account
                          </Typography>
                        </Box>
                        <Typography sx={{ ml: "auto !important", fontWeight: 900, fontSize: 26 }}>৳{bdt(payment.feeBkash)}</Typography>
                      </Stack>
                      <CopyLine label="bKash number" value={payment.bkashNumber} />
                      <CopyLine label="Reference" value="Your full name" />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Keep the 10-character transaction ID from the bKash SMS — the form asks for it.
                      </Typography>
                    </Card>
                  </motion.div>
                )}
                {hasBank && (
                  <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }}>
                    <Card sx={{ p: { xs: 2.5, md: 3.5 }, height: "100%", position: "relative", overflow: "hidden" }}>
                      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, bgcolor: "primary.main" }} />
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: alpha(theme.palette.primary.main, 0.12), color: "primary.main", flexShrink: 0 }}>
                          <AccountBalanceRounded />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: 19 }}>Bank deposit or transfer</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {payment.bankName}
                          </Typography>
                        </Box>
                        <Typography sx={{ ml: "auto !important", fontWeight: 900, fontSize: 26 }}>৳{bdt(payment.feeBank)}</Typography>
                      </Stack>
                      {payment.bankAccountName && <CopyLine label="Account name" value={payment.bankAccountName} />}
                      <CopyLine label="Account no." value={payment.bankAccountNumber} />
                      {payment.bankRoutingNumber && <CopyLine label="Routing no." value={payment.bankRoutingNumber} />}
                    </Card>
                  </motion.div>
                )}
              </Box>
            </Container>
          </Box>
        )}

        {/* FAQ */}
        {home.faqs.length > 0 && (
          <Box id="faq" sx={{ py: { xs: 8, md: 12 }, bgcolor: dark ? "#0E1C17" : "#EFEBE2", scrollMarginTop: 80 }}>
            <Container maxWidth="md">
              <motion.div {...reveal}>
                <SectionTitle center eyebrow="Questions" title={t(home.faqTitle)} />
              </motion.div>
              {home.faqs.map((f, i) => (
                <motion.div key={`${i}-${f.question}`} {...reveal} transition={{ ...reveal.transition, delay: (i % 8) * 0.04 }}>
                  <Accordion defaultExpanded={i === 0} sx={{ bgcolor: "background.paper" }}>
                    <AccordionSummary expandIcon={<ExpandMoreRounded />} sx={{ px: 3, py: 0.5 }}>
                      <Typography sx={{ fontWeight: 750, fontSize: 17 }}>{t(f.question)}</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                      <Paragraphs text={t(f.answer)} sx={{ color: "text.secondary", lineHeight: 1.7 }} />
                    </AccordionDetails>
                  </Accordion>
                </motion.div>
              ))}
            </Container>
          </Box>
        )}

        {/* CTA */}
        {(home.ctaTitle || home.ctaBody) && (
          <Box sx={{ py: { xs: 8, md: 12 } }}>
            <Container maxWidth="lg">
              <motion.div {...reveal}>
                <Card sx={{ position: "relative", overflow: "hidden", border: 0, minHeight: { xs: 420, md: 380 }, display: "flex", alignItems: "center" }}>
                  <Box sx={{ position: "absolute", inset: 0 }}>
                    <SceneSvg index={17} />
                  </Box>
                  <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(8,20,16,.88) 0%, rgba(8,20,16,.6) 50%, rgba(8,20,16,.2) 100%)" }} />
                  <Box sx={{ position: "relative", p: { xs: 3, md: 7 }, color: "#fff", maxWidth: 640 }}>
                    {home.ctaTitle && (
                      <Typography variant="h3" sx={{ fontSize: { xs: 30, md: 42 } }}>
                        <RichText text={t(home.ctaTitle)} />
                      </Typography>
                    )}
                    {home.ctaBody && (
                      <Box sx={{ mt: 1.5 }}>
                        <Paragraphs text={t(home.ctaBody)} sx={{ opacity: 0.9, fontSize: { md: 18 } }} banglaSx={{ opacity: 0.85, fontSize: { md: 17 } }} />
                      </Box>
                    )}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3.5 }}>
                      {open ? (
                        <Button component={Link} href="/auth/register" variant="contained" color="warning" size="large" endIcon={<ArrowForwardRounded />} sx={{ color: "#2B1A00" }}>
                          Start registration
                        </Button>
                      ) : (
                        <Typography sx={{ color: "#F4A62A", fontWeight: 700, alignSelf: "center" }}>{registration.closedMessage}</Typography>
                      )}
                      <Button component={Link} href="/auth/login" size="large" sx={{ color: "#fff" }}>
                        I already applied
                      </Button>
                    </Stack>
                  </Box>
                </Card>
              </motion.div>
            </Container>
          </Box>
        )}
      </main>

      <PublicFooter site={site} />
    </>
  );
}
