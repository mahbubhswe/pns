// pages/index.tsx — public landing page
import Head from "next/head";
import Link from "next/link";
import React, { useState } from "react";
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
import { motion } from "framer-motion";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import LoginRounded from "@mui/icons-material/LoginRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import MapRounded from "@mui/icons-material/MapRounded";
import PlaceRounded from "@mui/icons-material/PlaceRounded";
import AltRouteRounded from "@mui/icons-material/AltRouteRounded";
import CampaignRounded from "@mui/icons-material/CampaignRounded";
import NotificationsActiveRounded from "@mui/icons-material/NotificationsActiveRounded";
import Diversity3Rounded from "@mui/icons-material/Diversity3Rounded";
import ShieldRounded from "@mui/icons-material/ShieldRounded";
import ParkRounded from "@mui/icons-material/ParkRounded";
import ReceiptLongRounded from "@mui/icons-material/ReceiptLongRounded";
import FolderSharedRounded from "@mui/icons-material/FolderSharedRounded";
import PaymentsRounded from "@mui/icons-material/PaymentsRounded";
import EditNoteRounded from "@mui/icons-material/EditNoteRounded";
import LockRounded from "@mui/icons-material/LockRounded";
import PhoneIphoneRounded from "@mui/icons-material/PhoneIphoneRounded";
import AccountBalanceRounded from "@mui/icons-material/AccountBalanceRounded";
import HeroScenes from "@/components/landing/HeroScenes";
import { SceneSvg } from "@/components/landing/scenes";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

// --- Membership constants (also hardcoded in components/RegisterForm.tsx — change both) ---
const MEMBERSHIP_FEE = 1020; // BDT via bKash
const BANK_FEE = 1000; // BDT via bank
const BKASH_NUMBER = "01625358082";
const BANK = {
  name: "Sonali Bank Limited, Dhaka University",
  accountName: "Purbachal Newtown Society",
  accountNumber: "4405702001730",
  routingNumber: "200271750",
};

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

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

function SectionTitle({ eyebrow, title, sub, center }: { eyebrow: string; title: React.ReactNode; sub?: React.ReactNode; center?: boolean }) {
  return (
    <Box sx={{ textAlign: center ? "center" : "left", maxWidth: center ? 760 : 640, mx: center ? "auto" : 0, mb: { xs: 4, md: 6 } }}>
      <Typography variant="overline" color="secondary" sx={{ display: "block", mb: 1 }}>
        {eyebrow}
      </Typography>
      <Typography variant="h2" sx={{ fontSize: { xs: 30, sm: 38, md: 46 } }}>
        {title}
      </Typography>
      {sub && (
        <Typography color="text.secondary" sx={{ mt: 2, fontSize: { md: 18 }, lineHeight: 1.7 }}>
          {sub}
        </Typography>
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

export default function HomePage() {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";

  const benefits = [
    { icon: <CampaignRounded />, title: "One united voice", body: "Plot owners speak to RAJUK and other authorities together, instead of one by one." },
    { icon: <NotificationsActiveRounded />, title: "Stay in the loop", body: "Notices about roads, utilities, allotments and meetings — straight from the committee." },
    { icon: <Diversity3Rounded />, title: "Know your neighbours", body: "Meet the families you'll share a street with long before the houses are built." },
    { icon: <ShieldRounded />, title: "Safer together", body: "Coordinated security, lighting and maintenance for the sectors we live in." },
    { icon: <ParkRounded />, title: "Greener township", body: "Push for parks, trees, lakes and footpaths that keep Purbachal liveable." },
    { icon: <ReceiptLongRounded />, title: "Open accounts", body: "Every taka received and spent is recorded in the society's books." },
  ];

  const steps = [
    {
      icon: <FolderSharedRounded />,
      title: "Prepare your documents",
      body: "One proof of land ownership — LD tax receipt with plot details, mutation paper or BDS khatian — plus the owner's NID number and a recent photo.",
    },
    {
      icon: <PaymentsRounded />,
      title: `Pay the one-time fee`,
      body: `BDT ${MEMBERSHIP_FEE.toLocaleString("en-IN")} by bKash Send Money to ${BKASH_NUMBER} (reference: your full name), or BDT ${BANK_FEE.toLocaleString("en-IN")} to the society's bank account.`,
    },
    {
      icon: <EditNoteRounded />,
      title: "Fill in the online form",
      body: "Plot details, owner information and payment reference. Upload your documents — you'll get your application PDF by email right away.",
    },
  ];

  const faqs = [
    { q: "Who can become a member?", a: "Any owner of a plot in Purbachal New Town can apply online with their plot details and one proof of ownership." },
    { q: "What documents do I need?", a: "One ownership proof (LD tax receipt with plot details, mutation paper or BDS khatian), the owner's NID number, a recent photo and your payment receipt or transaction ID." },
    { q: "How do I know my application was received?", a: "Right after you submit, we email you a PDF copy of your application. You can also log in to your member profile at any time to see whether it is pending or approved." },
    { q: "Is PNS officially registered?", a: "PNS is in the process of obtaining legal registration and will launch its official website soon." },
    { q: "How is my data handled?", a: "Your information is used only for membership registration, identity verification and administration, and is kept confidential and secure." },
    { q: "Where does the membership fee go?", a: "Every fee is recorded as income in the society's books, alongside every expense, so the committee can prepare clear financial reports." },
  ];

  return (
    <>
      <Head>
        <title>Purbachal Newtown Society — Join your neighbours</title>
        <meta name="description" content="Join PNS — a community of Purbachal New Town plot owners building a safer, greener, better-planned neighbourhood together." />
        <meta property="og:title" content="Purbachal Newtown Society" />
        <meta property="og:description" content="A neighbourhood is built by its neighbours. Apply for membership online." />
      </Head>

      <PublicHeader overlay />

      <main>
        {/* HERO */}
        <HeroScenes>
          <Container maxWidth="lg" sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: { xs: "flex-end", md: "center" }, pb: { xs: 14, md: 16 }, pt: { xs: 9, md: 8 } }}>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
              <Box sx={{ maxWidth: 660, color: "#fff" }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ display: "inline-flex", px: 1.5, py: 0.75, borderRadius: 999, bgcolor: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.25)", backdropFilter: "blur(10px)", mb: 2.5 }}
                >
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#4ADE95", boxShadow: "0 0 0 0 rgba(74,222,149,.7)", animation: "pns-ping 1.8s infinite", "@keyframes pns-ping": { "70%": { boxShadow: "0 0 0 10px rgba(74,222,149,0)" }, "100%": { boxShadow: "0 0 0 0 rgba(74,222,149,0)" } } }} />
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>
                    Membership open
                    <Box component="span" sx={{ fontFamily: '"Hind Siliguri", sans-serif', fontWeight: 600, opacity: 0.85, ml: 1 }}>
                      · সদস্যপদ চলছে
                    </Box>
                  </Typography>
                </Stack>
                <Typography component="h1" sx={{ fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.02, fontSize: { xs: 36, sm: 54, md: 68 }, textShadow: "0 2px 30px rgba(0,0,0,.25)" }}>
                  A neighbourhood is built by its <Highlight>neighbours.</Highlight>
                </Typography>
                <Typography sx={{ mt: { xs: 1.5, md: 2.5 }, fontSize: { xs: 15, md: 19 }, lineHeight: 1.6, opacity: 0.92, maxWidth: 560 }}>
                  Purbachal Newtown Society brings the plot owners of Purbachal New Town together — to speak with one voice, share news, and shape a safer, greener township.
                </Typography>
                <Typography sx={{ mt: 1, fontFamily: '"Hind Siliguri", sans-serif', fontSize: { xs: 16, md: 18 }, opacity: 0.85 }}>
                  পূর্বাচলের প্লট মালিকদের সংগঠন — সদস্য হয়ে উন্নয়নে অংশ নিন।
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ mt: { xs: 2.5, md: 4 } }}>
                  <Button component={Link} href="/auth/register" size="large" variant="contained" color="warning" endIcon={<ArrowForwardRounded />} sx={{ color: "#2B1A00", px: 3.5, py: { xs: 1.25, md: 1.6 }, fontSize: 16.5 }}>
                    Become a member
                  </Button>
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
                <Stack direction="row" spacing={{ xs: 2, sm: 3 }} useFlexGap flexWrap="wrap" sx={{ mt: 3.5, opacity: 0.9, display: { xs: "none", sm: "flex" } }}>
                  {[
                    { i: <PaymentsRounded fontSize="small" />, t: `One-time fee ৳${MEMBERSHIP_FEE.toLocaleString("en-IN")}` },
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
        </HeroScenes>

        {/* STAT BAND */}
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 4, mt: { xs: 3, md: -6 } }}>
          <Card sx={{ p: { xs: 1, md: 1.5 }, display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, boxShadow: dark ? "none" : "0 30px 60px -30px rgba(18,36,29,.35)" }}>
            {[
              { n: "30", l: "Planned sectors", s: "in Purbachal New Town" },
              { n: `৳${MEMBERSHIP_FEE.toLocaleString("en-IN")}`, l: "One-time fee", s: "paid once when you apply" },
              { n: "3", l: "Simple steps", s: "documents, payment, form" },
              { n: "100%", l: "Online", s: "apply & track from anywhere" },
            ].map((x, i) => (
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
        <Box id="about" sx={{ py: { xs: 8, md: 13 }, scrollMarginTop: 80 }}>
          <Container maxWidth="lg">
            <Box sx={{ display: "grid", gap: { xs: 5, md: 8 }, gridTemplateColumns: { xs: "1fr", md: "1fr 1.1fr" }, alignItems: "center" }}>
              <motion.div {...reveal}>
                <SectionTitle
                  eyebrow="About Purbachal"
                  title={
                    <>
                      Bangladesh&apos;s largest planned township — <Highlight>our future home.</Highlight>
                    </>
                  }
                  sub="Planned by RAJUK to the northeast of Dhaka, Purbachal New Town is linked to the city by the ~12.5 km expressway many still call the “300 feet road” (July 36 Expressway)."
                />
                <Stack spacing={2.5}>
                  {[
                    { i: <MapRounded />, t: "Scale & plan", d: "Master-planned sectors and arterial roads, with residential and mixed-use zones." },
                    { i: <PlaceRounded />, t: "Location", d: "Northeast of Dhaka, spanning Rupganj (Narayanganj) and Kaliganj (Gazipur)." },
                    { i: <AltRouteRounded />, t: "Connectivity", d: "A fast link to Kuril Flyover on one side and Kanchan Bridge on the other." },
                  ].map(f => (
                    <Stack key={f.t} direction="row" spacing={2}>
                      <Box sx={{ width: 48, height: 48, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main", flexShrink: 0 }}>{f.i}</Box>
                      <Box>
                        <Typography sx={{ fontWeight: 750, fontSize: 17 }}>{f.t}</Typography>
                        <Typography color="text.secondary">{f.d}</Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </motion.div>
              <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }}>
                <Box sx={{ position: "relative" }}>
                  <Box sx={{ borderRadius: 6, overflow: "hidden", aspectRatio: "16 / 11", boxShadow: "0 40px 80px -40px rgba(18,36,29,.55)", border: `1px solid ${theme.palette.divider}` }}>
                    <SceneSvg index={18} />
                  </Box>
                  <Card sx={{ position: "absolute", left: { xs: 12, md: -28 }, bottom: { xs: -24, md: -28 }, p: 2, maxWidth: 260 }}>
                    <Typography sx={{ fontWeight: 800 }}>Planned, not improvised</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sectors, avenues, parks and lakes laid out before the first house goes up.
                    </Typography>
                  </Card>
                </Box>
              </motion.div>
            </Box>
          </Container>
        </Box>

        {/* WHY JOIN */}
        <Box id="why" sx={{ py: { xs: 8, md: 12 }, bgcolor: dark ? "#0E1C17" : "#EFEBE2", scrollMarginTop: 80 }}>
          <Container maxWidth="lg">
            <motion.div {...reveal}>
              <SectionTitle center eyebrow="Why join PNS" title="Neighbours who look out for each other" sub="We're plot owners just like you — volunteers who want Purbachal to grow into the town we were promised." />
            </motion.div>
            <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" } }}>
              {benefits.map((b, i) => (
                <motion.div key={b.title} {...reveal} transition={{ ...reveal.transition, delay: i * 0.06 }}>
                  <Card
                    sx={{
                      p: 3,
                      height: "100%",
                      transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease",
                      "&:hover": { transform: "translateY(-4px)", borderColor: alpha(theme.palette.primary.main, 0.4), boxShadow: dark ? "none" : "0 24px 40px -24px rgba(18,36,29,.35)" },
                    }}
                  >
                    <Box sx={{ width: 52, height: 52, borderRadius: 3.5, display: "grid", placeItems: "center", bgcolor: i % 2 ? alpha(theme.palette.secondary.main, 0.12) : alpha(theme.palette.primary.main, 0.12), color: i % 2 ? "secondary.main" : "primary.main", mb: 2 }}>
                      {b.icon}
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: 19, mb: 0.75 }}>{b.title}</Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.65 }}>
                      {b.body}
                    </Typography>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </Container>
        </Box>

        {/* HOW TO JOIN */}
        <Box id="join" sx={{ py: { xs: 8, md: 13 }, scrollMarginTop: 80 }}>
          <Container maxWidth="lg">
            <motion.div {...reveal}>
              <SectionTitle eyebrow="How to join" title={<>Three <Highlight>simple</Highlight> steps.</>} sub="Have your documents and payment details ready and the online form takes care of the rest." />
            </motion.div>
            <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, position: "relative" }}>
              <Box aria-hidden sx={{ display: { xs: "none", md: "block" }, position: "absolute", top: 34, left: "12%", right: "12%", height: 2, background: `repeating-linear-gradient(90deg, ${theme.palette.divider} 0 10px, transparent 10px 18px)` }} />
              {steps.map((s, i) => (
                <motion.div key={s.title} {...reveal} transition={{ ...reveal.transition, delay: i * 0.1 }}>
                  <Box sx={{ position: "relative" }}>
                    <Box sx={{ width: 68, height: 68, borderRadius: 5, display: "grid", placeItems: "center", bgcolor: "primary.main", color: "primary.contrastText", position: "relative", boxShadow: `0 14px 30px -14px ${theme.palette.primary.main}` }}>
                      {s.icon}
                      <Box sx={{ position: "absolute", top: -8, right: -8, width: 26, height: 26, borderRadius: "50%", bgcolor: "warning.main", color: "#2B1A00", fontWeight: 900, fontSize: 13, display: "grid", placeItems: "center", border: `3px solid ${theme.palette.background.default}` }}>{i + 1}</Box>
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: 20, mt: 2.5, mb: 1 }}>{s.title}</Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {s.body}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 6 }}>
              <Button component={Link} href="/auth/register" variant="contained" size="large" endIcon={<ArrowForwardRounded />}>
                Start my application
              </Button>
              <Button component="a" href="#faq" variant="outlined" size="large">
                Read the FAQ
              </Button>
            </Stack>
          </Container>
        </Box>

        {/* FEES */}
        <Box id="fees" sx={{ pb: { xs: 8, md: 12 }, scrollMarginTop: 80 }}>
          <Container maxWidth="lg">
            <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
              <motion.div {...reveal}>
                <Card sx={{ p: { xs: 2.5, md: 3.5 }, height: "100%", position: "relative", overflow: "hidden" }}>
                  <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, bgcolor: "#D12053" }} />
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: alpha("#D12053", 0.12), color: "#D12053" }}>
                      <PhoneIphoneRounded />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: 19 }}>Pay with bKash</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Send Money from any bKash account
                      </Typography>
                    </Box>
                    <Typography sx={{ ml: "auto !important", fontWeight: 900, fontSize: 26 }}>৳{MEMBERSHIP_FEE.toLocaleString("en-IN")}</Typography>
                  </Stack>
                  <CopyLine label="bKash number" value={BKASH_NUMBER} />
                  <CopyLine label="Reference" value="Your full name" />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Keep the 10-character transaction ID from the bKash SMS — the form asks for it.
                  </Typography>
                </Card>
              </motion.div>
              <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }}>
                <Card sx={{ p: { xs: 2.5, md: 3.5 }, height: "100%", position: "relative", overflow: "hidden" }}>
                  <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, bgcolor: "primary.main" }} />
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: alpha(theme.palette.primary.main, 0.12), color: "primary.main" }}>
                      <AccountBalanceRounded />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: 19 }}>Bank deposit or transfer</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {BANK.name}
                      </Typography>
                    </Box>
                    <Typography sx={{ ml: "auto !important", fontWeight: 900, fontSize: 26 }}>৳{BANK_FEE.toLocaleString("en-IN")}</Typography>
                  </Stack>
                  <CopyLine label="Account name" value={BANK.accountName} />
                  <CopyLine label="Account no." value={BANK.accountNumber} />
                  <CopyLine label="Routing no." value={BANK.routingNumber} />
                </Card>
              </motion.div>
            </Box>
          </Container>
        </Box>

        {/* FAQ */}
        <Box id="faq" sx={{ py: { xs: 8, md: 12 }, bgcolor: dark ? "#0E1C17" : "#EFEBE2", scrollMarginTop: 80 }}>
          <Container maxWidth="md">
            <motion.div {...reveal}>
              <SectionTitle center eyebrow="Questions" title="Things neighbours usually ask" />
            </motion.div>
            {faqs.map((f, i) => (
              <motion.div key={f.q} {...reveal} transition={{ ...reveal.transition, delay: i * 0.04 }}>
                <Accordion defaultExpanded={i === 0} sx={{ bgcolor: "background.paper" }}>
                  <AccordionSummary expandIcon={<ExpandMoreRounded />} sx={{ px: 3, py: 0.5 }}>
                    <Typography sx={{ fontWeight: 750, fontSize: 17 }}>{f.q}</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {f.a}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </motion.div>
            ))}
          </Container>
        </Box>

        {/* CTA */}
        <Box sx={{ py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <motion.div {...reveal}>
              <Card sx={{ position: "relative", overflow: "hidden", border: 0, minHeight: { xs: 420, md: 380 }, display: "flex", alignItems: "center" }}>
                <Box sx={{ position: "absolute", inset: 0 }}>
                  <SceneSvg index={17} />
                </Box>
                <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(8,20,16,.88) 0%, rgba(8,20,16,.6) 50%, rgba(8,20,16,.2) 100%)" }} />
                <Box sx={{ position: "relative", p: { xs: 3, md: 7 }, color: "#fff", maxWidth: 640 }}>
                  <Typography variant="h3" sx={{ fontSize: { xs: 30, md: 42 } }}>
                    Ready to meet your neighbours?
                  </Typography>
                  <Typography sx={{ mt: 1.5, opacity: 0.9, fontSize: { md: 18 } }}>
                    Pay the fee, keep your documents ready and complete the short online form. We&apos;ll take it from there.
                  </Typography>
                  <Typography sx={{ mt: 1, fontFamily: '"Hind Siliguri", sans-serif', opacity: 0.85 }}>আজই সদস্য হোন — একসাথে গড়ি আমাদের পূর্বাচল।</Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3.5 }}>
                    <Button component={Link} href="/auth/register" variant="contained" color="warning" size="large" endIcon={<ArrowForwardRounded />} sx={{ color: "#2B1A00" }}>
                      Start registration
                    </Button>
                    <Button component={Link} href="/auth/login" size="large" sx={{ color: "#fff" }}>
                      I already applied
                    </Button>
                  </Stack>
                </Box>
              </Card>
            </motion.div>
          </Container>
        </Box>
      </main>

      <PublicFooter />
    </>
  );
}
