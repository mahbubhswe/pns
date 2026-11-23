"use client";

// A collapsible settings block (Landing page editor). Click the header to open
// or close it; `EditorSections` adds "Expand all / Collapse all".
import React, { createContext, useContext, useState } from "react";
import { Box, Button, ButtonBase, Card, Collapse, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import UnfoldMoreRounded from "@mui/icons-material/UnfoldMoreRounded";
import UnfoldLessRounded from "@mui/icons-material/UnfoldLessRounded";

/** Broadcast from "Expand all / Collapse all": the latest command and a counter so repeats still apply. */
const AllCtx = createContext<{ open: boolean; n: number }>({ open: false, n: 0 });

export function EditorSections({ children }: { children: React.ReactNode }) {
  const [all, setAll] = useState({ open: false, n: 0 });
  return (
    <AllCtx.Provider value={all}>
      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mb: -1 }}>
        <Button size="small" color="inherit" startIcon={<UnfoldMoreRounded />} onClick={() => setAll(a => ({ open: true, n: a.n + 1 }))} sx={{ color: "text.secondary" }}>
          Expand all
        </Button>
        <Button size="small" color="inherit" startIcon={<UnfoldLessRounded />} onClick={() => setAll(a => ({ open: false, n: a.n + 1 }))} sx={{ color: "text.secondary" }}>
          Collapse all
        </Button>
      </Stack>
      {children}
    </AllCtx.Provider>
  );
}

export default function EditorSection({
  title,
  subheader,
  defaultOpen = false,
  children,
}: {
  title: string;
  subheader?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const all = useContext(AllCtx);
  // Own toggle, stamped with the "all" command it was made after: a newer
  // "Expand all / Collapse all" wins, a newer click wins over that.
  const [own, setOwn] = useState({ open: defaultOpen, n: 0 });
  const open = all.n > own.n ? all.open : own.open;
  const setOpen = (fn: (o: boolean) => boolean) => setOwn({ open: fn(open), n: all.n });

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, overflow: "hidden", transition: "box-shadow .2s ease", ...(open && { boxShadow: `0 10px 28px -18px ${alpha(theme.palette.primary.main, 0.45)}` }) }}>
      <ButtonBase
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        sx={{
          width: "100%",
          textAlign: "left",
          px: 2.5,
          py: 1.75,
          display: "flex",
          alignItems: "center",
          gap: 2,
          justifyContent: "space-between",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 750, fontSize: "1.05rem" }}>{title}</Typography>
          {subheader && (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: ".85rem" }}>
              {subheader}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 32,
            height: 32,
            flexShrink: 0,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: open ? alpha(theme.palette.primary.main, 0.12) : "action.hover",
            color: open ? "primary.main" : "text.secondary",
            transition: "transform .3s cubic-bezier(.22,1,.36,1), background-color .2s ease",
            transform: open ? "rotate(180deg)" : "none",
          }}
        >
          <ExpandMoreRounded fontSize="small" />
        </Box>
      </ButtonBase>
      <Collapse in={open} timeout={{ enter: 320, exit: 220 }} easing={{ enter: "cubic-bezier(.22,1,.36,1)", exit: "cubic-bezier(.4,0,.2,1)" }} unmountOnExit={false}>
        <Box sx={{ px: 2.5, pb: 2.5, pt: 0.5, borderTop: 1, borderColor: "divider" }}>
          <Box sx={{ pt: 2 }}>{children}</Box>
        </Box>
      </Collapse>
    </Card>
  );
}
