"use client";

// "More ▾" in the public header: opens on hover (and on click / keyboard),
// with an icon per link and dividers that start after the icon column.
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Box, Button, ClickAwayListener, Divider, Grow, MenuItem, MenuList, Paper, Popper, Typography } from "@mui/material";
import { alpha, useTheme, type SxProps, type Theme } from "@mui/material/styles";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";

export type MoreLink = { label: string; hint: string; href: string; icon: React.ReactNode };

const ICON_BOX = 40; // icon tile size; dividers start right after it
const ITEM_PX = 1.5; // horizontal padding of an item (theme spacing)

export default function MoreMenu({ label = "More", items, sx }: { label?: string; items: MoreLink[]; sx?: SxProps<Theme> }) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
  };
  const show = () => {
    cancel();
    setOpen(true);
  };
  // Small delay so moving the pointer from the button into the menu doesn't close it.
  const hide = () => {
    cancel();
    timer.current = setTimeout(() => setOpen(false), 160);
  };
  useEffect(() => cancel, []);

  return (
    <Box onMouseEnter={show} onMouseLeave={hide} sx={{ display: "flex" }}>
      <Button
        ref={setAnchorEl}
        color="inherit"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        endIcon={<ExpandMoreRounded sx={{ transition: "transform .25s ease", transform: open ? "rotate(180deg)" : "none" }} />}
        sx={[{ "& .MuiButton-endIcon": { ml: 0.25 } }, ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {label}
      </Button>
      <Popper open={open} anchorEl={anchorEl} placement="bottom-end" transition disablePortal={false} sx={{ zIndex: theme.zIndex.appBar + 1 }}>
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: "right top" }} timeout={220}>
            {/* Invisible top padding bridges the gap between button and menu, so hover isn't lost. */}
            <Box sx={{ pt: 1.25 }} onMouseEnter={show} onMouseLeave={hide}>
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <Paper
                  sx={{
                    width: 300,
                    p: 0.75,
                    borderRadius: "22px",
                    border: theme.palette.mode === "dark" ? "1px solid rgba(255,255,255,.08)" : "1px solid #FFFFFF",
                    boxShadow: theme.palette.mode === "dark" ? "0 12px 32px rgba(0,0,0,.5)" : "0 12px 32px rgba(78,75,102,.18)",
                    backgroundImage: "none",
                  }}
                >
                  <MenuList autoFocusItem={false} disablePadding onKeyDown={e => e.key === "Escape" && setOpen(false)}>
                    {items.flatMap((item, i) => [
                      ...(i > 0
                        ? [
                            <Divider
                              key={`d-${item.href}`}
                              component="li"
                              aria-hidden
                              // starts after the icon column: item padding + icon tile + gap
                              sx={{ my: "2px !important", ml: `calc(${theme.spacing(ITEM_PX)} + ${ICON_BOX}px + ${theme.spacing(1.5)})`, mr: ITEM_PX }}
                            />,
                          ]
                        : []),
                      <MenuItem
                        key={item.href}
                        component={Link}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        sx={{
                          px: ITEM_PX,
                          py: 1.1,
                          gap: 1.5,
                          borderRadius: "14px",
                          alignItems: "center",
                          "&:hover .more-icon": { bgcolor: "primary.main", color: "primary.contrastText" },
                        }}
                      >
                        <Box
                          className="more-icon"
                          sx={{
                            width: ICON_BOX,
                            height: ICON_BOX,
                            flexShrink: 0,
                            borderRadius: "12px",
                            display: "grid",
                            placeItems: "center",
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: "primary.main",
                            transition: "background-color .2s ease, color .2s ease",
                            "& svg": { fontSize: 22 },
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.3 }}>{item.label}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12.5, lineHeight: 1.35 }}>
                            {item.hint}
                          </Typography>
                        </Box>
                      </MenuItem>,
                    ])}
                  </MenuList>
                </Paper>
              </ClickAwayListener>
            </Box>
          </Grow>
        )}
      </Popper>
    </Box>
  );
}
