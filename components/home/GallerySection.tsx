"use client";

// Home page photo gallery (photos uploaded from Dashboard → Landing page → Gallery).
// A frosted-glass panel holding a photo grid, the first photo shown large;
// clicking a photo opens it full size with previous / next.
import { Reveal } from "@/components/home/motion";
import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Box, Container, Dialog, IconButton, Typography } from "@mui/material";
import CloseRounded from "@mui/icons-material/CloseRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import { SectionTitle } from "@/components/home/parts";

type Photo = { src: string; caption: string };

export default function GallerySection({ title, items }: { title: string; items: Photo[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const n = items.length;
  const go = useCallback((d: number) => setOpen(i => (i === null ? i : (i + d + n) % n)), [n]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  const shown = items.slice(0, 9);
  const current = open === null ? null : items[open];

  // The first photo is large (2 × 2) once there are 3+ photos. The last photo
  // stretches over whatever is left of its row, so the grid never has a hole.
  const big = shown.length >= 3;
  const fill = (cols: number) => {
    const cells = (big ? 4 : 0) + shown.length - (big ? 1 : 0);
    const rem = cells % cols;
    return rem === 0 ? 1 : cols - rem + 1;
  };
  const lastSpan = { xs: fill(2), md: fill(4) };

  return (
    <Box id="gallery" sx={{ py: { xs: 8, md: 11 }, scrollMarginTop: 80 }}>
      <Container maxWidth="lg">
        <SectionTitle center title={title} />
        <Reveal>
          {/* Same frosted-glass panel as the cards. */}
          <Box
            sx={theme => ({
              p: { xs: 1, md: 1.25 },
              borderRadius: "30px",
              border: theme.palette.mode === "dark" ? "1px solid rgba(255,255,255,.09)" : "1px solid #FFFFFF",
              backgroundImage:
                theme.palette.mode === "dark"
                  ? "linear-gradient(118deg, rgba(255,255,255,.07) -5%, rgba(255,255,255,.025) 65%, rgba(255,255,255,.07) 112%)"
                  : "linear-gradient(118deg, rgba(255,243,233,.7) -5%, rgba(255,255,255,.7) 65%, rgba(255,243,233,.7) 112%)",
              backdropFilter: "blur(30px)",
              boxShadow: theme.palette.mode === "dark" ? "0 2px 14px rgba(0,0,0,.28)" : "0 2px 14px rgba(78,75,102,.10)",
            })}
          >
            <Box
              sx={{
                display: "grid",
                gap: { xs: 1, md: 1.25 },
                gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
                gridAutoRows: { xs: 150, sm: 190, md: 210 },
              }}
            >
              {shown.map((p, i) => (
                <Box
                  key={`${i}-${p.src}`}
                  component="button"
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-label={p.caption ? `Open photo: ${p.caption}` : `Open photo ${i + 1}`}
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: "22px",
                    border: 0,
                    p: 0,
                    cursor: "zoom-in",
                    bgcolor: "action.hover",
                    ...(i === 0 && big && { gridColumn: "span 2", gridRow: "span 2" }),
                    ...(i === shown.length - 1 && !(i === 0 && big) && { gridColumn: { xs: `span ${lastSpan.xs}`, md: `span ${lastSpan.md}` } }),
                    "& img": { transition: "transform .6s cubic-bezier(.22,1,.36,1)" },
                    "&:hover img": { transform: "scale(1.05)" },
                    "&:hover .cap, &:focus-visible .cap": { opacity: 1, transform: "none" },
                  }}
                >
                  <Image src={p.src} alt={p.caption || title} fill unoptimized sizes="(min-width: 900px) 25vw, 50vw" style={{ objectFit: "cover" }} />
                  {p.caption && (
                    <Box
                      className="cap"
                      sx={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        p: 1.5,
                        pt: 4,
                        textAlign: "left",
                        color: "#fff",
                        fontWeight: 650,
                        fontSize: 14,
                        background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.6) 100%)",
                        opacity: { xs: 1, md: 0 },
                        transform: { xs: "none", md: "translateY(6px)" },
                        transition: "opacity .25s ease, transform .25s ease",
                      }}
                    >
                      {p.caption}
                    </Box>
                  )}
                  {/* "+N more" on the last tile when there are more photos than shown. */}
                  {i === shown.length - 1 && n > shown.length && (
                    <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", bgcolor: "rgba(0,0,0,.45)", color: "#fff", fontWeight: 800, fontSize: 22 }}>
                      +{n - shown.length} more
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Reveal>
      </Container>

      {/* Full-size viewer */}
      <Dialog
        open={current !== null}
        onClose={() => setOpen(null)}
        maxWidth={false}
        PaperProps={{ sx: { bgcolor: "transparent", boxShadow: "none", border: 0, m: { xs: 1, md: 4 }, overflow: "visible" } }}
        slotProps={{ backdrop: { sx: { bgcolor: "rgba(0,0,0,.85)" } } }}
      >
        {current && (
          <Box sx={{ position: "relative", width: "min(92vw, 1200px)", height: "min(80vh, 800px)" }}>
            <Image src={current.src} alt={current.caption || title} fill unoptimized sizes="92vw" style={{ objectFit: "contain" }} />
            {current.caption && (
              <Typography sx={{ position: "absolute", left: 0, right: 0, bottom: -40, textAlign: "center", color: "#fff", fontWeight: 600 }}>{current.caption}</Typography>
            )}
            <IconButton onClick={() => setOpen(null)} aria-label="Close" sx={{ position: "absolute", top: -6, right: -6, color: "#fff", bgcolor: "rgba(255,255,255,.14)", "&:hover": { bgcolor: "rgba(255,255,255,.24)" } }}>
              <CloseRounded />
            </IconButton>
            {n > 1 && (
              <>
                <IconButton onClick={() => go(-1)} aria-label="Previous photo" sx={{ position: "absolute", left: { xs: 4, md: -60 }, top: "50%", transform: "translateY(-50%)", color: "#fff", bgcolor: "rgba(255,255,255,.14)", "&:hover": { bgcolor: "rgba(255,255,255,.24)" } }}>
                  <ChevronLeftRounded />
                </IconButton>
                <IconButton onClick={() => go(1)} aria-label="Next photo" sx={{ position: "absolute", right: { xs: 4, md: -60 }, top: "50%", transform: "translateY(-50%)", color: "#fff", bgcolor: "rgba(255,255,255,.14)", "&:hover": { bgcolor: "rgba(255,255,255,.24)" } }}>
                  <ChevronRightRounded />
                </IconButton>
              </>
            )}
          </Box>
        )}
      </Dialog>
    </Box>
  );
}
