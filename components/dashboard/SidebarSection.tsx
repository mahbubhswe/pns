"use client";

// One sidebar section. Its pages open right below it (accordion: the sidebar
// keeps one section open, see Layout). In the collapsed (icon-only) sidebar
// there is no room below, so the pages open in a flyout on hover instead.
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Box,
  ClickAwayListener,
  Collapse,
  Divider,
  Grow,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";

export type SidebarLink = { label: string; href: string; icon: React.ReactNode; selected: boolean };

type Props = {
  title: string;
  icon: React.ReactNode;
  items: SidebarLink[];
  /** Pointer can hover (desktop): the mini flyout opens on hover. */
  hover: boolean;
  /** Accordion state, owned by the sidebar. */
  expanded: boolean;
  /** Pointer entered / left the section's header row (hover intent is handled by the sidebar). */
  onHeaderEnter: () => void;
  onHeaderLeave: () => void;
  /** Click / tap on the header: open or close. */
  onToggle: () => void;
  /** Collapsed (icon-only) sidebar. */
  mini: boolean;
  onNavigate: () => void;
};

const ICON_BOX = 36;

export default function SidebarSection({ title, icon, items, hover, mini, expanded, onHeaderEnter, onHeaderLeave, onToggle, onNavigate }: Props) {
  const flyout = mini;
  const theme = useTheme();
  const active = items.some(i => i.selected);
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
  };
  // Mini flyout only.
  const show = () => {
    if (!hover) return;
    cancel();
    setOpen(true);
  };
  const hide = () => {
    if (!hover) return;
    cancel();
    timer.current = setTimeout(() => setOpen(false), 160);
  };
  useEffect(() => cancel, []);

  const go = () => {
    setOpen(false);
    onNavigate();
  };

  const row = (
    <ListItemButton
      ref={setAnchorEl}
      onClick={() => (flyout ? setOpen(o => !o) : onToggle())}
      onMouseEnter={flyout ? undefined : onHeaderEnter}
      onMouseLeave={flyout ? undefined : onHeaderLeave}
      aria-haspopup={flyout ? "menu" : undefined}
      aria-expanded={flyout ? open : expanded}
      sx={{
        mb: 0.5,
        py: 1,
        px: mini ? 0 : 1.5,
        justifyContent: mini ? "center" : "flex-start",
        position: "relative",
        bgcolor: open ? "action.hover" : undefined,
        ...(active && {
          color: "primary.main",
          "&::before": { content: '""', position: "absolute", left: -12, top: 8, bottom: 8, width: 4, borderRadius: 4, bgcolor: "primary.main" },
        }),
      }}
    >
      <ListItemIcon sx={{ minWidth: mini ? 0 : 38, color: active ? "primary.main" : "text.secondary" }}>{icon}</ListItemIcon>
      {!mini && (
        <>
          <ListItemText primary={title} primaryTypographyProps={{ fontWeight: active ? 750 : 600, fontSize: 14.5 }} />
          <ExpandMoreRounded fontSize="small" sx={{ color: "text.secondary", transition: "transform .3s cubic-bezier(.22,1,.36,1)", transform: expanded ? "rotate(180deg)" : "none" }} />
        </>
      )}
    </ListItemButton>
  );

  if (!flyout) {
    return (
      <Box>
        {row}
        <Collapse
          in={expanded}
          timeout={{ enter: 320, exit: 240 }}
          easing={{ enter: "cubic-bezier(.22,1,.36,1)", exit: "cubic-bezier(.4,0,.2,1)" }}
          sx={{ "& .sub-list": { transition: "opacity .25s ease, transform .3s cubic-bezier(.22,1,.36,1)", opacity: expanded ? 1 : 0, transform: expanded ? "none" : "translateY(-4px)" } }}
        >
          {/* A thin guide line ties the pages to their section. */}
          <List
            className="sub-list"
            dense
            disablePadding
            sx={{
              position: "relative",
              ml: 3.25,
              pl: 1.5,
              mb: 0.75,
              "&::before": { content: '""', position: "absolute", left: 0, top: 4, bottom: 4, width: "1.5px", borderRadius: 2, bgcolor: "divider" },
            }}
          >
            {items.map(item => (
              <ListItemButton
                key={item.href}
                component={Link}
                href={item.href}
                selected={item.selected}
                onClick={go}
                sx={{ py: 0.7, mb: 0.25, borderRadius: "10px", "&:hover .sub-icon": { color: "primary.main" } }}
              >
                <ListItemIcon className="sub-icon" sx={{ minWidth: 32, color: item.selected ? "primary.main" : "text.secondary", transition: "color .2s", "& svg": { fontSize: 19 } }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: item.selected ? 750 : 600, fontSize: 13.75 }} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      </Box>
    );
  }

  return (
    <Box onMouseEnter={show} onMouseLeave={hide}>
      {row}
      <Popper open={open} anchorEl={anchorEl} placement="right-start" transition sx={{ zIndex: theme.zIndex.drawer + 2 }}>
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: "left top" }} timeout={200}>
            {/* Transparent left padding bridges the gap so moving into the menu keeps it open. */}
            <Box sx={{ pl: 1.25 }} onMouseEnter={show} onMouseLeave={hide}>
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <Paper
                  sx={{
                    width: 270,
                    p: 0.75,
                    borderRadius: "18px",
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.palette.mode === "dark" ? "0 12px 32px rgba(0,0,0,.5)" : "0 12px 32px rgba(18,36,29,.16)",
                  }}
                >
                  <Typography sx={{ px: 1.5, pt: 0.75, pb: 0.5, fontSize: 11, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "text.secondary" }}>
                    {title}
                  </Typography>
                  <MenuList disablePadding autoFocusItem={false} onKeyDown={e => e.key === "Escape" && setOpen(false)}>
                    {items.flatMap((item, i) => [
                      ...(i > 0
                        ? [<Divider key={`d-${item.href}`} component="li" aria-hidden sx={{ my: "2px !important", ml: `calc(${theme.spacing(1.5)} + ${ICON_BOX}px + ${theme.spacing(1.25)})`, mr: 1.5 }} />]
                        : []),
                      <MenuItem
                        key={item.href}
                        component={Link}
                        href={item.href}
                        selected={item.selected}
                        onClick={go}
                        sx={{ px: 1.5, py: 0.9, gap: 1.25, borderRadius: "12px", "&:hover .side-icon": { bgcolor: "primary.main", color: "primary.contrastText" } }}
                      >
                        <Box
                          className="side-icon"
                          sx={{
                            width: ICON_BOX,
                            height: ICON_BOX,
                            flexShrink: 0,
                            borderRadius: "10px",
                            display: "grid",
                            placeItems: "center",
                            bgcolor: item.selected ? "primary.main" : alpha(theme.palette.primary.main, 0.1),
                            color: item.selected ? "primary.contrastText" : "primary.main",
                            transition: "background-color .2s ease, color .2s ease",
                            "& svg": { fontSize: 20 },
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Typography sx={{ fontWeight: item.selected ? 750 : 600, fontSize: 14.5 }}>{item.label}</Typography>
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
