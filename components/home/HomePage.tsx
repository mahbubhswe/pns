"use client";

// Landing page (client component). All copy, slides and sections come from
// site settings (dashboard → Settings → Landing page). Nothing here is
// hardcoded except layout and animation.
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LoginIcon from "@mui/icons-material/Login";
import PaymentsIcon from "@mui/icons-material/Payments";
import SecurityIcon from "@mui/icons-material/Security";
import ArticleIcon from "@mui/icons-material/Article";
import InfoIcon from "@mui/icons-material/Info";
import ArrowBackIosNew from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { keyframes } from "@mui/system";
import { renderTemplate, type SiteSettings } from "@/lib/shared/settings";

type Props = { settings: SiteSettings };

// ---------- HeroBanner-like animation tuning ----------
const DRIFT_DURATION = 16;
const ZOOM_DURATION = 6;
const SCALE_MIN = 1.0;
const SCALE_MAX = 1.06;
const SLIDE_INTERVAL_MS = 4500;
const MASK =
  "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.50) 45%, rgba(0,0,0,0.16) 70%, rgba(0,0,0,0) 100%)";

const driftUp = keyframes`
  from { transform: translateY(10px); }
  to   { transform: translateY(-10px); }
`;
const zoomInOut = keyframes`
  0%   { transform: scale(${SCALE_MIN}); }
  50%  { transform: scale(${SCALE_MAX}); }
  100% { transform: scale(${SCALE_MIN}); }
`;

export default function HomePage({ settings }: Props) {
  const { home, site, payment, registration } = settings;
  const t = (text: string) => renderTemplate(text, settings);
  const slides = home.slides.length ? home.slides : [{ src: "/hero.png", alt: site.name }];

  // --- Slider state & autoplay ---
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const len = slides.length;
  const reduce = useReducedMotion();

  const go = useCallback(
    (next: number, direction: 1 | -1) => {
      setDir(direction);
      setIndex(((next % len) + len) % len);
    },
    [len]
  );

  useEffect(() => {
    if (len <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => go(index + 1, 1), SLIDE_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [index, len, go]);

  const pause = () => timerRef.current && clearInterval(timerRef.current);
  const resume = () => {
    if (len <= 1) return;
    timerRef.current = setInterval(() => go(index + 1, 1), SLIDE_INTERVAL_MS);
  };

  const slide = slides[Math.min(index, len - 1)];

  return (
    <>

      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
        {/* HERO SLIDER */}
        <Box
          sx={{
            position: "relative",
            height: { xs: "auto", md: 720 },
            minHeight: { xs: 680, md: 720 },
            overflow: "hidden",
          }}
        >
          <AnimatePresence initial={false} custom={dir}>
            <motion.div
              key={`${index}-${slide.src}`}
              custom={dir}
              initial={{ opacity: 0, scale: 1.04, x: dir > 0 ? 40 : -40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 1.02, x: dir > 0 ? -40 : 40 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ position: "absolute", inset: 0 }}
              onMouseEnter={pause}
              onMouseLeave={resume}
            >
              <Box
                aria-hidden
                sx={{ position: "absolute", inset: 0, WebkitMaskImage: MASK, maskImage: MASK, pointerEvents: "none" }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    transformOrigin: "center bottom",
                    willChange: "transform",
                    animation: reduce ? "none" : `${driftUp} ${DRIFT_DURATION}s ease-in-out infinite alternate`,
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      transformOrigin: "center 85%",
                      willChange: "transform",
                      animation: reduce ? "none" : `${zoomInOut} ${ZOOM_DURATION}s ease-in-out infinite`,
                    }}
                  >
                    {/* `unoptimized` so admins may use images from any host. */}
                    <Image
                      src={slide.src}
                      alt={slide.alt || site.name}
                      fill
                      priority
                      unoptimized
                      sizes="100vw"
                      style={{ objectFit: "cover", filter: "brightness(0.85)" }}
                    />
                  </Box>
                </Box>
              </Box>
            </motion.div>
          </AnimatePresence>

          {/* overlay gradient for text readability */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.55) 100%)",
              pointerEvents: "none",
            }}
          />

          {/* HERO CONTENT (glass) */}
          <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, height: "100%" }}>
            <Stack justifyContent="center" alignItems="center" sx={{ height: "100%" }} spacing={2}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  maxWidth: 820,
                  width: { xs: "calc(100% - 32px)", sm: "min(100%, 820px)" },
                  boxSizing: "border-box",
                  mx: { xs: "auto", sm: 0 },
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.14)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.28)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Typography variant="h3" fontWeight={800} lineHeight={1.1} gutterBottom>
                  {t(home.heroTitle)}
                </Typography>
                {home.heroSubtitle && (
                  <Typography variant="h6" sx={{ opacity: 0.95, mb: 2 }}>
                    {t(home.heroSubtitle)}
                  </Typography>
                )}

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  {registration.open && (
                    <Button
                      component={Link}
                      href="/auth/register"
                      size="large"
                      variant="contained"
                      color="primary"
                      startIcon={<CheckCircleOutlineIcon />}
                    >
                      Register Now
                    </Button>
                  )}
                  <Button
                    component={Link}
                    href="/auth/login"
                    size="large"
                    variant="outlined"
                    color="inherit"
                    startIcon={<LoginIcon />}
                  >
                    Login
                  </Button>
                  {home.aboutTitle && (
                    <Button component="a" href="#about" size="large" variant="outlined" color="inherit">
                      {home.aboutTitle}
                    </Button>
                  )}
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
                  <Chip icon={<PaymentsIcon />} label={`Membership Fee: BDT ${payment.feeBkash}`} />
                  <Chip icon={<SecurityIcon />} label="Your data stays private" variant="outlined" />
                  <Chip icon={<ArticleIcon />} label="Simple paperwork" variant="outlined" />
                </Stack>
              </Paper>
            </Stack>
          </Container>

          {len > 1 && (
            <>
              {/* ARROWS */}
              <IconButton
                aria-label="Previous"
                onClick={() => go(index - 1, -1)}
                onMouseEnter={pause}
                onMouseLeave={resume}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 12,
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(0,0,0,0.35)",
                  color: "#fff",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.55)" },
                  zIndex: 2,
                }}
              >
                <ArrowBackIosNew fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="Next"
                onClick={() => go(index + 1, 1)}
                onMouseEnter={pause}
                onMouseLeave={resume}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: 12,
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(0,0,0,0.35)",
                  color: "#fff",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.55)" },
                  zIndex: 2,
                }}
              >
                <ArrowForwardIos fontSize="small" />
              </IconButton>

              {/* DOTS */}
              <Stack
                direction="row"
                spacing={1}
                sx={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", zIndex: 2 }}
              >
                {slides.map((_, i) => (
                  <Box
                    key={i}
                    onClick={() => go(i, i > index ? 1 : -1)}
                    onMouseEnter={pause}
                    onMouseLeave={resume}
                    sx={{
                      width: i === index ? 18 : 8,
                      height: 8,
                      borderRadius: 999,
                      transition: "all .25s",
                      cursor: "pointer",
                      bgcolor: i === index ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)",
                    }}
                  />
                ))}
              </Stack>
            </>
          )}
        </Box>

        {/* ABOUT */}
        {(home.aboutTitle || home.aboutIntro || home.aboutPoints.length > 0) && (
          <Container id="about" maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}>
              <Stack spacing={2} sx={{ mb: 1 }}>
                {home.aboutTitle && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <InfoIcon color="primary" />
                    <Typography variant="h5" fontWeight={800}>
                      {t(home.aboutTitle)}
                    </Typography>
                  </Stack>
                )}
                {home.aboutIntro && <Typography color="text.secondary">{t(home.aboutIntro)}</Typography>}
              </Stack>

              {home.aboutPoints.length > 0 && (
                <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
                  <List dense>
                    {home.aboutPoints.map((point, i) => (
                      <ListItem key={i}>
                        <ListItemText primary={t(point.title)} secondary={t(point.body)} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </motion.div>
          </Container>
        )}

        {/* HOW TO JOIN */}
        {home.steps.length > 0 && (
          <Box sx={{ backgroundColor: theme => theme.palette.background.paper, py: { xs: 6, md: 8 } }}>
            <Container maxWidth="lg">
              <Stack spacing={4}>
                {home.stepsTitle && (
                  <Typography variant="h5" fontWeight={800}>
                    {t(home.stepsTitle)}
                  </Typography>
                )}
                {home.steps.map((step, i) => (
                  <motion.div key={i} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}>
                    <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {t(step.title)}
                      </Typography>
                      <Typography color="text.secondary">{t(step.body)}</Typography>
                      {i === home.steps.length - 1 && (
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
                          {registration.open && (
                            <Button component={Link} href="/auth/register" variant="contained" size="large">
                              Go to Registration
                            </Button>
                          )}
                          {home.faqs.length > 0 && (
                            <Button component="a" href="#faq" variant="outlined" size="large">
                              Read FAQs
                            </Button>
                          )}
                        </Stack>
                      )}
                    </Paper>
                  </motion.div>
                ))}
              </Stack>
            </Container>
          </Box>
        )}

        {/* FAQ */}
        {home.faqs.length > 0 && (
          <Container id="faq" maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
              <Stack spacing={3}>
                {home.faqTitle && (
                  <Typography variant="h5" fontWeight={800}>
                    {t(home.faqTitle)}
                  </Typography>
                )}
                {home.faqs.map((faq, i) => (
                  <Paper key={i} variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                      {t(faq.question)}
                    </Typography>
                    <Typography color="text.secondary">{t(faq.answer)}</Typography>
                  </Paper>
                ))}
              </Stack>
            </motion.div>
          </Container>
        )}

        {/* Final CTA */}
        {(home.ctaTitle || home.ctaBody) && (
          <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: theme => theme.palette.background.paper }}>
            <Container maxWidth="lg">
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
                <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, textAlign: "center" }}>
                  {home.ctaTitle && (
                    <Typography variant="h5" fontWeight={800} gutterBottom>
                      {t(home.ctaTitle)}
                    </Typography>
                  )}
                  {home.ctaBody && (
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                      {t(home.ctaBody)}
                    </Typography>
                  )}
                  {registration.open ? (
                    <Button component={Link} href="/auth/register" size="large" variant="contained">
                      Start Registration
                    </Button>
                  ) : (
                    <Typography color="warning.main" fontWeight={600}>
                      {registration.closedMessage}
                    </Typography>
                  )}
                </Paper>
              </motion.div>
            </Container>
          </Box>
        )}
      </motion.main>
    </>
  );
}
