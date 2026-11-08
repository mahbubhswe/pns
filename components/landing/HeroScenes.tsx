// components/landing/HeroScenes.tsx — autoplaying slider of the 20 animated neighbourhood scenes.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import PauseRounded from "@mui/icons-material/PauseRounded";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SCENES, SceneSvg } from "./scenes";
import { SCENE_CSS, SceneDefs } from "./scene-kit";

const SLIDE_MS = 7500;

export default function HeroScenes({ children }: { children?: React.ReactNode }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(true);
  const [tick, setTick] = useState(0);
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const n = SCENES.length;

  const go = useCallback(
    (next: number, d: 1 | -1) => {
      setDir(d);
      setIndex(((next % n) + n) % n);
      setTick(t => t + 1);
    },
    [n]
  );

  // Pause the whole thing when the hero is off-screen or the tab is hidden (saves battery).
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const paused = userPaused || hovering || !visible || Boolean(reduce);

  // Autoplay that remembers how much of the current slide has already played across pauses.
  const elapsed = useRef(0);
  const startedAt = useRef<number | null>(null);
  useEffect(() => {
    elapsed.current = 0;
  }, [index, tick]);
  useEffect(() => {
    if (paused) return;
    startedAt.current = performance.now();
    const t = setTimeout(() => go(index + 1, 1), Math.max(0, SLIDE_MS - elapsed.current));
    return () => {
      clearTimeout(t);
      if (startedAt.current !== null) elapsed.current += performance.now() - startedAt.current;
      startedAt.current = null;
    };
  }, [index, paused, go, tick]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(index + 1, 1);
    if (e.key === "ArrowLeft") go(index - 1, -1);
  };

  const scene = SCENES[index];

  return (
    <Box
      ref={rootRef}
      component="section"
      aria-roledescription="carousel"
      aria-label="Life in Purbachal New Town"
      tabIndex={0}
      onKeyDown={onKey}
      sx={{
        position: "relative",
        height: { xs: "max(640px, 92svh)", md: "min(max(680px, 92vh), 920px)" },
        overflow: "hidden",
        bgcolor: "#0B1A14",
        outline: "none",
        isolation: "isolate",
      }}
    >
      <style>{SCENE_CSS}</style>
      <SceneDefs />

      {/* Scenes */}
      <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }} onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={scene.key}
            custom={dir}
            initial={{ opacity: 0, scale: 1.06, x: dir * 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 1.02, x: dir * -40 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "absolute", inset: 0 }}
          >
            <SceneSvg index={index} paused={!visible} />
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Legibility washes */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background: {
            xs: "linear-gradient(180deg, rgba(8,20,16,.55) 0%, rgba(8,20,16,.15) 28%, rgba(8,20,16,.25) 55%, rgba(8,20,16,.88) 100%)",
            md: "linear-gradient(90deg, rgba(8,20,16,.80) 0%, rgba(8,20,16,.55) 32%, rgba(8,20,16,.08) 62%, rgba(8,20,16,0) 100%), linear-gradient(180deg, rgba(8,20,16,.45) 0%, rgba(8,20,16,0) 22%, rgba(8,20,16,0) 70%, rgba(8,20,16,.55) 100%)",
          },
        }}
      />

      {/* Hero copy supplied by the page */}
      <Box sx={{ position: "relative", zIndex: 2, height: "100%" }}>{children}</Box>

      {/* Scene caption + controls */}
      <Box
        sx={{
          position: "absolute",
          zIndex: 3,
          left: 0,
          right: 0,
          bottom: 0,
          px: { xs: 2, md: 5 },
          pb: { xs: 2, md: 9 },
        }}
      >
        <Stack direction="row" alignItems="flex-end" spacing={2} sx={{ maxWidth: 1360, mx: "auto" }}>
          <Box sx={{ flex: 1, minWidth: 0, color: "#fff", display: { xs: "none", sm: "block" } }}>
            <AnimatePresence mode="wait">
              <motion.div key={scene.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.4 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", opacity: 0.75 }}>
                  Scene {String(index + 1).padStart(2, "0")} / {n}
                </Typography>
                <Typography sx={{ fontWeight: 800, fontSize: 18 }}>
                  {scene.title}
                  <Box component="span" sx={{ fontFamily: '"Hind Siliguri", sans-serif', fontWeight: 600, opacity: 0.85, ml: 1.25, fontSize: 16 }}>
                    · {scene.bn}
                  </Box>
                </Typography>
                <Typography sx={{ opacity: 0.85, fontSize: 14 }}>{scene.caption}</Typography>
              </motion.div>
            </AnimatePresence>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: "auto" }}>
            <Typography sx={{ color: "#fff", fontWeight: 800, fontVariantNumeric: "tabular-nums", display: { sm: "none" }, mr: 0.5 }}>
              {String(index + 1).padStart(2, "0")}/{n}
            </Typography>
            <CtrlButton label="Previous scene" onClick={() => go(index - 1, -1)}>
              <ChevronLeftRounded />
            </CtrlButton>
            <CtrlButton label={userPaused ? "Play" : "Pause"} onClick={() => setUserPaused(p => !p)}>
              {userPaused ? <PlayArrowRounded /> : <PauseRounded />}
            </CtrlButton>
            <CtrlButton label="Next scene" onClick={() => go(index + 1, 1)}>
              <ChevronRightRounded />
            </CtrlButton>
          </Stack>
        </Stack>

        {/* Segmented progress: one segment per scene */}
        <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${n}, 1fr)`, gap: { xs: "3px", md: "5px" }, mt: 1.75, maxWidth: 1360, mx: "auto" }}>
          {SCENES.map((s, i) => (
            <Tooltip key={s.key} title={s.title} placement="top" arrow>
              <Box
                component="button"
                aria-label={`Show scene ${i + 1}: ${s.title}`}
                aria-current={i === index}
                onClick={() => go(i, i >= index ? 1 : -1)}
                sx={{
                  appearance: "none",
                  border: 0,
                  p: 0,
                  py: 1,
                  bgcolor: "transparent",
                  cursor: "pointer",
                  "&:focus-visible > span": { outline: "2px solid #F4A62A", outlineOffset: 2 },
                }}
              >
                <Box component="span" sx={{ display: "block", height: 4, borderRadius: 4, bgcolor: "rgba(255,255,255,.28)", overflow: "hidden", position: "relative" }}>
                  <Box
                    key={i === index ? `run-${tick}` : "idle"}
                    component="span"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 4,
                      bgcolor: i < index ? "rgba(255,255,255,.85)" : "#F4A62A",
                      transformOrigin: "left",
                      transform: i < index ? "scaleX(1)" : "scaleX(0)",
                      ...(i === index && {
                        animation: `pns-progress ${SLIDE_MS}ms linear forwards`,
                        animationPlayState: paused ? "paused" : "running",
                        "@keyframes pns-progress": { from: { transform: "scaleX(0)" }, to: { transform: "scaleX(1)" } },
                      }),
                    }}
                  />
                </Box>
              </Box>
            </Tooltip>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function CtrlButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        onClick={onClick}
        sx={{
          color: "#fff",
          width: 44,
          height: 44,
          borderRadius: 3,
          bgcolor: "rgba(255,255,255,.12)",
          border: "1px solid rgba(255,255,255,.25)",
          backdropFilter: "blur(8px)",
          "&:hover": { bgcolor: "rgba(255,255,255,.22)" },
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}
