"use client";

// Shared building blocks for the public landing pages (home, how to join).
// In settings text, `*words*` are highlighted and a new line starts a new
// paragraph (Bangla lines get the Bangla font automatically).
import React, { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";

export const BANGLA = /[ঀ-৿]/;
export const BANGLA_FONT = 'var(--font-hind), sans-serif';

export const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

export const bdt = (n: number) => n.toLocaleString("en-IN");

export function Highlight({ children }: { children: React.ReactNode }) {
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
export function RichText({ text, lastWord = false }: { text: string; lastWord?: boolean }) {
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
export function Paragraphs({ text, sx, banglaSx }: { text: string; sx?: object; banglaSx?: object }) {
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

/** Section heading: the title only (no label above, no intro paragraph). Renders nothing when empty. */
export function SectionTitle({ title, center }: { title: string; center?: boolean }) {
  if (!title) return null;
  return (
    <Box sx={{ textAlign: center ? "center" : "left", maxWidth: center ? 760 : 640, mx: center ? "auto" : 0, mb: { xs: 4, md: 6 } }}>
      <Typography variant="h2" sx={{ fontSize: { xs: 30, sm: 38, md: 46 } }}>
        <RichText text={title} />
      </Typography>
    </Box>
  );
}

export function CopyLine({ label, value }: { label: string; value: string }) {
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

/**
 * Card look for the public pages: frosted glass. A translucent tinted gradient
 * (warm at the corners, white in the middle) with a background blur, a 1px
 * white edge that reads as a highlight against the tint, a large radius and a
 * soft diffuse shadow. Use inside `sx` on a page wrapper:
 * `sx={publicCards(dark)}` styles every MUI Card / Accordion below it.
 */
export function publicCards(dark: boolean) {
  const glass = dark
    ? "linear-gradient(118deg, rgba(255,255,255,.07) -5%, rgba(255,255,255,.025) 65%, rgba(255,255,255,.07) 112%)"
    : "linear-gradient(118deg, rgba(255,243,233,.7) -5%, rgba(255,255,255,.7) 65%, rgba(255,243,233,.7) 112%)";
  const edge = dark ? "1px solid rgba(255,255,255,.09)" : "1px solid #FFFFFF";
  // Kept light: a faint, wide shadow just to lift the card off the page.
  const shadow = dark ? "0 2px 14px rgba(0,0,0,.28)" : "0 2px 14px rgba(78,75,102,.10)";
  const hover = dark ? "0 6px 20px rgba(0,0,0,.36)" : "0 6px 20px rgba(78,75,102,.16)";
  const surface = {
    backgroundColor: "transparent",
    backgroundImage: glass,
    backdropFilter: "blur(30px)",
    WebkitBackdropFilter: "blur(30px)",
  };
  return {
    "& .MuiCard-root": {
      ...surface,
      border: edge,
      borderRadius: "30px",
      boxShadow: shadow,
      transition: "transform .25s ease, box-shadow .25s ease",
    },
    "& a.MuiCard-root:hover, & .MuiCard-root:hover": { boxShadow: hover },
    "& .MuiAccordion-root": {
      ...surface,
      border: `${edge} !important`,
      borderRadius: "22px !important",
      boxShadow: `${shadow} !important`,
    },
  } as const;
}

/**
 * Count a figure up from 0 when it scrolls into view, keeping any prefix,
 * suffix and thousands separators: "৳1,020" → ৳0 … ৳1,020, "100%" → 0% … 100%.
 * Text without a number is shown as is. The server renders the final value
 * (no layout shift, readable without JavaScript).
 */
export function CountUp({ text, duration = 1.6 }: { text: string; duration?: number }) {
  const m = text.match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)([\s\S]*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();

  const parts = m
    ? { prefix: m[1], suffix: m[3], target: Number(m[2].replace(/,/g, "")), decimals: m[2].includes(".") ? m[2].split(".")[1].length : 0, grouped: m[2].includes(",") }
    : null;
  const format = (n: number) => {
    if (!parts) return text;
    const fixed = n.toFixed(parts.decimals);
    const body = parts.grouped ? Number(fixed).toLocaleString("en-IN", { minimumFractionDigits: parts.decimals, maximumFractionDigits: parts.decimals }) : fixed;
    return parts.prefix + body + parts.suffix;
  };
  // Server and first client render both start at 0 (no flash of the final value, no hydration mismatch).
  const [shown, setShown] = useState(() => format(0));

  useEffect(() => {
    if (!parts) return;
    if (reduce) {
      setShown(text);
      return;
    }
    if (!inView) return;
    const controls = animate(0, parts.target, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: v => setShown(format(v)) });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, text]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>
      {shown}
    </span>
  );
}

/** One short line under an item title; longer text is cut at two lines. */
export const clamp2 = { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as const;
