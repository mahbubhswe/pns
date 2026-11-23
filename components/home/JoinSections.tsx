"use client";

// Home page: How to join steps, fees and FAQ. Minimal by design: each section
// shows only its title; items keep one short line (clamped to two lines).
import React from "react";
import Link from "next/link";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Card, Container, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import FolderSharedRounded from "@mui/icons-material/FolderSharedRounded";
import PaymentsRounded from "@mui/icons-material/PaymentsRounded";
import EditNoteRounded from "@mui/icons-material/EditNoteRounded";
import TaskAltRounded from "@mui/icons-material/TaskAltRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import HomeWorkRounded from "@mui/icons-material/HomeWorkRounded";
import FamilyRestroomRounded from "@mui/icons-material/FamilyRestroomRounded";
import { Paragraphs, SectionTitle, bdt, clamp2, reveal } from "@/components/home/parts";
import { MEMBER_TYPE_LABELS } from "@/lib/shared/membership";
import LazyScene from "@/components/landing/LazyScene";
import { renderTemplate, stripStepNumber, type SiteSettings } from "@/lib/shared/settings";

/** Illustration per step (township scenes): welcome gate · golden sunrise · neighbourhood market. */
const STEP_SCENES = [2, 7, 12];
const STEP_ICONS = [<FolderSharedRounded key="f" />, <EditNoteRounded key="e" />, <PaymentsRounded key="p" />, <TaskAltRounded key="t" />];



export function StepsSection({ settings }: { settings: SiteSettings }) {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const { home, registration } = settings;
  const t = (text: string) => renderTemplate(text, settings);
  const cols = Math.min(Math.max(home.steps.length, 1), 4);
  return (
    <Box id="join" sx={{ py: { xs: 8, md: 11 }, scrollMarginTop: 80 }}>
      <Container maxWidth="lg">
        <SectionTitle center title={t(home.stepsTitle)} />
        <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: `repeat(${cols}, 1fr)` } }}>
          {home.steps.map((s, i) => (
            <motion.div key={`${i}-${s.title}`} {...reveal} transition={{ ...reveal.transition, delay: (i % 4) * 0.08 }} style={{ height: "100%" }}>
              {/* Illustration on top with the step number, icon overlapping its edge, then title and one line. */}
              <Card
                component="article"
                sx={{
                  p: "5px",
                  pb: 3,
                  height: "100%",
                  textAlign: "center",
                  transition: "transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s ease",
                  "&:hover": { transform: "translateY(-6px)" },
                  "&:hover .step-art .pns-scene": { transform: "scale(1.06)" },
                }}
              >
                <Box
                  className="step-art"
                  sx={{
                    position: "relative",
                    aspectRatio: "16 / 9",
                    borderRadius: "25px",
                    overflow: "hidden",
                    isolation: "isolate",
                    "& .pns-scene": { position: "absolute", inset: 0, width: "100%", height: "100%", transition: "transform .8s cubic-bezier(.22,1,.36,1)" },
                  }}
                >
                  <LazyScene index={STEP_SCENES[i % STEP_SCENES.length]} />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      px: 1.25,
                      py: 0.4,
                      borderRadius: 999,
                      bgcolor: "rgba(255,255,255,.92)",
                      color: "primary.dark",
                      fontSize: 12.5,
                      fontWeight: 800,
                      letterSpacing: ".04em",
                      boxShadow: "0 4px 12px rgba(0,0,0,.12)",
                    }}
                  >
                    STEP {i + 1}
                  </Box>
                </Box>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    mx: "auto",
                    mt: "-30px",
                    position: "relative",
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 55%, ${theme.palette.primary.dark} 100%)`,
                    border: `4px solid ${theme.palette.background.paper}`,
                    boxShadow: dark ? "0 8px 18px rgba(0,0,0,.4)" : "0 8px 18px rgba(20,20,43,.14)",
                    "& svg": { fontSize: 26 },
                  }}
                >
                  {STEP_ICONS[i % STEP_ICONS.length]}
                </Box>
                <Typography component="h3" sx={{ fontWeight: 800, fontSize: 19, mt: 1.75, mb: 0.75, px: 2 }}>
                  {stripStepNumber(t(s.title))}
                </Typography>
                <Typography color="text.secondary" sx={{ ...clamp2, fontSize: 14.5, lineHeight: 1.6, px: 2.5, maxWidth: 320, mx: "auto" }} title={t(s.body)}>
                  {t(s.body)}
                </Typography>
              </Card>
            </motion.div>
          ))}
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="center" sx={{ mt: 5 }}>
          {registration.open && (
            <Button component={Link} href="/auth/register" variant="contained" size="large" endIcon={<ArrowForwardRounded />}>
              {t(home.ctaPrimaryLabel) || "Start my application"}
            </Button>
          )}
          <Button component={Link} href="/track" variant="outlined" size="large" startIcon={<SearchRounded />}>
            {t(home.ctaSecondaryLabel) || "Track my application"}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}

/**
 * The "photo" of a fee card: one of the site's own animated neighbourhood
 * illustrations, with a tinted shade at the bottom so the fee reads clearly.
 */
function FeeBanner({ scene, tint, icon, label, amount, note }: { scene: number; tint: string; icon: React.ReactNode; label: string; amount: string; note: string }) {
  return (
    <Box
      className="fee-banner"
      sx={{
        position: "relative",
        aspectRatio: "16 / 9",
        borderRadius: "15px",
        overflow: "hidden",
        color: "#fff",
        isolation: "isolate",
        "& .pns-scene": { position: "absolute", inset: 0, width: "100%", height: "100%", transition: "transform .8s cubic-bezier(.22,1,.36,1)" },
      }}
    >
      <LazyScene index={scene} />
      {/* Brand-tinted shade: clear at the top, deep at the bottom where the text sits. */}
      <Box aria-hidden sx={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${tint}00 42%, ${tint}CC 74%, ${tint} 100%)` }} />
      <Box
        sx={{
          position: "absolute",
          top: 12,
          left: 12,
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          pl: 0.75,
          pr: 1.25,
          py: 0.5,
          borderRadius: 999,
          bgcolor: "rgba(255,255,255,.92)",
          color: tint,
          fontSize: 12.5,
          fontWeight: 800,
          boxShadow: "0 4px 12px rgba(0,0,0,.12)",
          "& svg": { fontSize: 18 },
        }}
      >
        {icon}
        {label}
      </Box>
      <Box sx={{ position: "absolute", left: { xs: 16, md: 20 }, right: 16, bottom: { xs: 14, md: 18 } }}>
        <Typography sx={{ fontWeight: 900, fontSize: { xs: 38, md: 46 }, lineHeight: 1, letterSpacing: "-0.03em", textShadow: "0 2px 14px rgba(0,0,0,.25)" }}>{amount}</Typography>
        <Typography sx={{ mt: 0.75, fontSize: 13.5, fontWeight: 600, opacity: 0.95 }}>{note}</Typography>
      </Box>
    </Box>
  );
}

/**
 * Membership fee: one offer-style card per membership type. Payment happens
 * online (gateway), so no account numbers are shown here.
 */
export function FeesSection({ settings }: { settings: SiteSettings }) {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const { home, payment, registration } = settings;
  const t = (text: string) => renderTemplate(text, settings);
  const plans = [
    // Scenes: 3 = Villa Lane (homes, for the plot owner), 4 = Central Park (families).
    { type: "GENERAL" as const, amount: payment.feeBkash, note: "One-time · for the plot owner", icon: <HomeWorkRounded />, scene: 3, tint: "#0A4F3E" },
    { type: "ASSOCIATE" as const, amount: payment.feeBkashAssociate, note: "One-time · for a family member", icon: <FamilyRestroomRounded />, scene: 4, tint: "#C2410C" },
  ];
  return (
    <Box id="fees" sx={{ pb: { xs: 8, md: 11 }, scrollMarginTop: 80 }}>
      <Container maxWidth="md">
        <SectionTitle center title={t(home.feesTitle)} />
        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
          {plans.map((plan, i) => (
            <motion.div key={plan.type} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }} style={{ height: "100%" }}>
              {/* Offer card: glass shell, 5px inset, graphic on top, pill button below. */}
              <Box
                component="article"
                sx={{
                  height: "100%",
                  p: "5px",
                  pb: 2.5,
                  borderRadius: "20px",
                  border: dark ? "1px solid rgba(255,255,255,.09)" : "1px solid #FFFFFF",
                  backgroundImage: dark
                    ? "linear-gradient(118deg, rgba(255,255,255,.07) -5%, rgba(255,255,255,.025) 65%, rgba(255,255,255,.07) 112%)"
                    : "linear-gradient(118deg, rgba(255,243,233,.7) -5%, rgba(255,255,255,.7) 65%, rgba(255,243,233,.7) 112%)",
                  backdropFilter: "blur(30px)",
                  boxShadow: dark ? "0 2px 14px rgba(0,0,0,.28)" : "0 2px 14px rgba(78,75,102,.12)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transition: "transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s ease",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: dark ? "0 10px 26px rgba(0,0,0,.4)" : "0 10px 26px rgba(78,75,102,.18)" },
                  "&:hover .fee-banner .pns-scene": { transform: "scale(1.06)" },
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <FeeBanner
                    scene={plan.scene}
                    tint={plan.tint}
                    icon={plan.icon}
                    label={`${MEMBER_TYPE_LABELS[plan.type].label} membership`}
                    amount={`৳${bdt(plan.amount)}`}
                    note={plan.note}
                  />
                </Box>
                {registration.open && (
                  <Button
                    component={Link}
                    href="/auth/register"
                    variant="contained"
                    color={i === 0 ? "primary" : "secondary"}
                    sx={{ mt: 2.5, px: 4, py: 1.1, borderRadius: 999, fontWeight: 800 }}
                  >
                    Apply &amp; pay online
                  </Button>
                )}
              </Box>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

/** Hover-capable pointer (mouse/trackpad); touch screens open answers by tapping instead. */
function useCanHover(): boolean {
  const [can, setCan] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCan(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return can;
}

export function FaqSection({ settings }: { settings: SiteSettings }) {
  const { home } = settings;
  const t = (text: string) => renderTemplate(text, settings);
  const canHover = useCanHover();
  const [open, setOpen] = React.useState<number | null>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // A short delay before closing, so moving between questions doesn't flicker.
  const hoverOpen = (i: number) => {
    if (!canHover) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(i);
  };
  const hoverClose = () => {
    if (!canHover) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 180);
  };
  React.useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  return (
    <Box id="faq" sx={{ py: { xs: 8, md: 11 }, scrollMarginTop: 80 }}>
      <Container maxWidth="md">
        <SectionTitle center title={t(home.faqTitle)} />
        {/* Answers open smoothly on hover (or tap on touch screens). */}
        {home.faqs.map((f, i) => (
          <Accordion
            key={`${i}-${f.question}`}
            disableGutters
            expanded={open === i}
            onChange={(_, isOpen) => setOpen(isOpen ? i : null)}
            onMouseEnter={() => hoverOpen(i)}
            onMouseLeave={hoverClose}
            slotProps={{ transition: { timeout: 380, easing: "cubic-bezier(.22,1,.36,1)" } }}
            sx={{
              mb: 1,
              "&::before": { display: "none" },
              transition: "transform .3s ease, box-shadow .3s ease",
              ...(open === i && { transform: "translateY(-2px)" }),
              "& .MuiAccordionSummary-expandIconWrapper": { transition: "transform .38s cubic-bezier(.22,1,.36,1), color .2s ease" },
              "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": { color: "primary.main" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreRounded />} sx={{ px: 3, py: 0.5 }}>
              <Typography sx={{ fontWeight: 750, fontSize: 16.5, transition: "color .2s ease", color: open === i ? "primary.main" : "text.primary" }}>
                {t(f.question)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
              <Paragraphs text={t(f.answer)} sx={{ color: "text.secondary", lineHeight: 1.7 }} />
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
}
