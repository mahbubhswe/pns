"use client";

// components/dashboard/Layout.tsx — responsive admin shell: grouped sidebar and top bar.
// Rendered once by app/dashboard/layout.tsx; pages gate themselves with <PageGate>.
import React, { PropsWithChildren, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import MenuRounded from "@mui/icons-material/MenuRounded";
import KeyboardDoubleArrowLeftRounded from "@mui/icons-material/KeyboardDoubleArrowLeftRounded";
import KeyboardDoubleArrowRightRounded from "@mui/icons-material/KeyboardDoubleArrowRightRounded";
import SpaceDashboardRounded from "@mui/icons-material/SpaceDashboardRounded";
import Groups2Rounded from "@mui/icons-material/Groups2Rounded";
import ArticleRounded from "@mui/icons-material/ArticleRounded";
import PictureAsPdfRounded from "@mui/icons-material/PictureAsPdfRounded";
import AccountBalanceWalletRounded from "@mui/icons-material/AccountBalanceWalletRounded";
import ReceiptLongRounded from "@mui/icons-material/ReceiptLongRounded";
import AssessmentRounded from "@mui/icons-material/AssessmentRounded";
import CategoryRounded from "@mui/icons-material/CategoryRounded";
import AccountBalanceRounded from "@mui/icons-material/AccountBalanceRounded";
import BadgeRounded from "@mui/icons-material/BadgeRounded";
import AdminPanelSettingsRounded from "@mui/icons-material/AdminPanelSettingsRounded";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import TuneRounded from "@mui/icons-material/TuneRounded";
import WebRounded from "@mui/icons-material/WebRounded";
import SupervisorAccountRounded from "@mui/icons-material/SupervisorAccountRounded";
import LanguageRounded from "@mui/icons-material/LanguageRounded";
import SettingsRounded from "@mui/icons-material/SettingsRounded";
import SidebarSection from "@/components/dashboard/SidebarSection";
import Diversity3Rounded from "@mui/icons-material/Diversity3Rounded";
import FolderRounded from "@mui/icons-material/FolderRounded";
import ThemeToggle from "@/components/ThemeToggle";
import BrandLogo, { BrandMark } from "@/components/BrandLogo";
import { useAdmin } from "@/lib/useAdmin";
import { initials } from "@/lib/format";
import { apiPost } from "@/lib/api";
import { returnToOwnAccount } from "@/lib/impersonate";
import type { Permission } from "@/lib/shared/permissions";

const DRAWER = 272;
const MINI = 84;

type NavItem = { label: string; href: string; icon: React.ReactNode; perm: Permission | Permission[]; exact?: boolean };

/**
 * Sidebar sections. A section with one visible page shows as a plain link; a
 * section with several opens a flyout on hover (desktop) or expands in place
 * (mobile). Items the user has no permission for are hidden.
 */
export const navGroups: Array<{ title: string; icon: React.ReactNode; items: NavItem[] }> = [
  {
    title: "Dashboard",
    icon: <SpaceDashboardRounded />,
    items: [{ label: "Dashboard", href: "/dashboard", icon: <SpaceDashboardRounded />, perm: "dashboard.view", exact: true }],
  },
  {
    title: "Members",
    icon: <Groups2Rounded />,
    items: [{ label: "Members", href: "/dashboard/membership", icon: <Groups2Rounded />, perm: "members.view" }],
  },
  {
    title: "Website",
    icon: <LanguageRounded />,
    items: [
      { label: "Landing page", href: "/dashboard/landing", icon: <WebRounded />, perm: "settings.manage" },
      { label: "Posts", href: "/dashboard/posts", icon: <ArticleRounded />, perm: ["posts.view", "posts.manage"] },
      { label: "Committee", href: "/dashboard/committee", icon: <Diversity3Rounded />, perm: "committee.manage" },
      { label: "Documents", href: "/dashboard/documents", icon: <FolderRounded />, perm: "documents.manage" },
      { label: "Registration guideline", href: "/dashboard/add-preview", icon: <PictureAsPdfRounded />, perm: "guideline.manage" },
    ],
  },
  {
    title: "Accounts",
    icon: <AccountBalanceWalletRounded />,
    items: [
      { label: "Accounts overview", href: "/dashboard/accounting", icon: <AccountBalanceWalletRounded />, perm: ["accounting.view", "accounting.reports"], exact: true },
      { label: "Vouchers", href: "/dashboard/accounting/vouchers", icon: <ReceiptLongRounded />, perm: ["accounting.view", "accounting.entry"] },
      { label: "Reports", href: "/dashboard/accounting/reports", icon: <AssessmentRounded />, perm: "accounting.reports" },
      { label: "Ledger heads", href: "/dashboard/accounting/heads", icon: <CategoryRounded />, perm: ["accounting.setup", "accounting.view"] },
      { label: "Cash & bank accounts", href: "/dashboard/accounting/accounts", icon: <AccountBalanceRounded />, perm: ["accounting.setup", "accounting.view"] },
    ],
  },
  {
    title: "Administration",
    icon: <SettingsRounded />,
    items: [
      { label: "Staff users", href: "/dashboard/users", icon: <BadgeRounded />, perm: ["users.view", "users.manage"] },
      { label: "Roles & permissions", href: "/dashboard/roles", icon: <AdminPanelSettingsRounded />, perm: "roles.manage" },
      { label: "Site settings", href: "/dashboard/settings", icon: <TuneRounded />, perm: "settings.manage" },
    ],
  },
];

export default function DashboardLayout({ children }: PropsWithChildren) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname() || "/dashboard";
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [menuEl, setMenuEl] = useState<HTMLElement | null>(null);
  const { admin, loading, signedOut, can } = useAdmin();

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("pns-sidebar") === "mini");
    } catch {}
  }, []);

  useEffect(() => {
    if (signedOut) router.replace("/admin/login");
  }, [signedOut, router]);

  const toggleCollapsed = () => {
    setCollapsed(c => {
      try {
        localStorage.setItem("pns-sidebar", c ? "full" : "mini");
      } catch {}
      return !c;
    });
  };

  const mini = isDesktop && collapsed;
  const width = mini ? MINI : DRAWER;

  const groups = useMemo(
    () => navGroups.map(g => ({ ...g, items: g.items.filter(i => can(i.perm)) })).filter(g => g.items.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [admin?.permissions]
  );

  const isSelected = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");

  // Sidebar accordion: one section open at a time. Resting state = the section of the current page.
  const activeSection = groups.find(g => g.items.length > 1 && g.items.some(isSelected))?.title ?? null;
  const [openSection, setOpenSection] = useState<string | null>(activeSection);
  const navTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearNavTimer = () => {
    if (navTimer.current) clearTimeout(navTimer.current);
  };
  // After navigating, rest on the new page's section.
  useEffect(() => {
    clearNavTimer();
    setOpenSection(activeSection);
  }, [activeSection]);
  useEffect(() => clearNavTimer, []);
  // Hover intent: open only if the pointer stays on the header a moment (passing over does nothing).
  const hoverSection = (title: string) => {
    if (!isDesktop) return;
    clearNavTimer();
    navTimer.current = setTimeout(() => setOpenSection(title), 140);
  };
  const leaveSectionHeader = () => {
    if (!isDesktop) return;
    clearNavTimer();
  };
  // Pointer left the whole menu: go back to the current page's section.
  const leaveNav = () => {
    if (!isDesktop) return;
    clearNavTimer();
    navTimer.current = setTimeout(() => setOpenSection(activeSection), 400);
  };
  const toggleSection = (title: string) => {
    clearNavTimer();
    setOpenSection(o => (o === title ? null : title));
  };

  const logout = async () => {
    try {
      await apiPost("/api/admin/logout");
    } catch {}
    window.location.assign("/admin/login");
  };

  const drawer = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar sx={{ px: mini ? 2.5 : 2.5, minHeight: { xs: 68 }, gap: 1 }}>
        {mini ? <BrandMark size={36} /> : <BrandLogo href="/dashboard" size={38} subtitle="Management portal" />}
      </Toolbar>
      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", px: 1.5, pb: 2 }}>
        {loading && !admin ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={22} />
          </Box>
        ) : (
          <List dense sx={{ pt: 1 }} onMouseEnter={clearNavTimer} onMouseLeave={leaveNav}>
            {groups.map(group => {
              // Several pages → a section with an inner menu.
              if (group.items.length > 1) {
                return (
                  <SidebarSection
                    key={group.title}
                    title={group.title}
                    icon={group.icon}
                    hover={isDesktop}
                    expanded={openSection === group.title}
                    onHeaderEnter={() => hoverSection(group.title)}
                    onHeaderLeave={leaveSectionHeader}
                    onToggle={() => toggleSection(group.title)}
                    mini={mini}
                    onNavigate={() => setMobileOpen(false)}
                    items={group.items.map(i => ({ label: i.label, href: i.href, icon: i.icon, selected: isSelected(i) }))}
                  />
                );
              }
              // One page → a plain link.
              const item = group.items[0];
              const selected = isSelected(item);
              const btn = (
                <ListItemButton
                  key={item.href}
                  component={Link}
                  href={item.href}
                  selected={selected}
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    mb: 0.5,
                    py: 1,
                    px: mini ? 0 : 1.5,
                    justifyContent: mini ? "center" : "flex-start",
                    position: "relative",
                    "&.Mui-selected::before": {
                      content: '""',
                      position: "absolute",
                      left: -12,
                      top: 8,
                      bottom: 8,
                      width: 4,
                      borderRadius: 4,
                      bgcolor: "primary.main",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: mini ? 0 : 38, color: selected ? "primary.main" : "text.secondary" }}>{group.icon}</ListItemIcon>
                  {!mini && <ListItemText primary={group.title} primaryTypographyProps={{ fontWeight: selected ? 750 : 600, fontSize: 14.5 }} />}
                </ListItemButton>
              );
              return mini ? (
                <Tooltip key={item.href} title={group.title} placement="right" arrow>
                  {btn}
                </Tooltip>
              ) : (
                btn
              );
            })}
          </List>
        )}
      </Box>
      {!mini && admin && (
        <Box sx={{ p: 2, m: 1.5, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.07), border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`, display: "none", "@media (min-height: 1020px)": { display: "block" } }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Serving the neighbourhood
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
            Every approval and every receipt here helps a neighbour. Thank you, {admin.name.split(" ")[0]}.
          </Typography>
        </Box>
      )}
      {isDesktop && (
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          <Button
            fullWidth
            size="small"
            color="inherit"
            onClick={toggleCollapsed}
            startIcon={mini ? undefined : <KeyboardDoubleArrowLeftRounded />}
            sx={{ color: "text.secondary", justifyContent: mini ? "center" : "flex-start", minWidth: 0 }}
            aria-label={mini ? "Expand sidebar" : "Collapse sidebar"}
          >
            {mini ? <KeyboardDoubleArrowRightRounded /> : "Collapse"}
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        className="no-print"
        sx={{
          width: { lg: `calc(100% - ${width}px)` },
          ml: { lg: `${width}px` },
          bgcolor: alpha(theme.palette.background.default, 0.82),
          backdropFilter: "saturate(180%) blur(14px)",
          borderBottom: `1px solid ${theme.palette.divider}`,
          transition: "width .25s ease, margin .25s ease",
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, md: 68 }, gap: 1 }}>
          <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Open menu" sx={{ display: { lg: "none" } }}>
            <MenuRounded />
          </IconButton>
          <Box sx={{ display: { xs: "flex", lg: "none" } }}>
            <BrandLogo href="/dashboard" size={32} compact />
          </Box>
          <Box sx={{ flex: 1 }} />
          <Tooltip title="Open public website">
            <Button
              component={Link}
              href="/"
              target="_blank"
              size="small"
              color="inherit"
              endIcon={<OpenInNewRounded fontSize="small" />}
              sx={{ display: { xs: "none", sm: "inline-flex" }, color: "text.secondary" }}
            >
              View site
            </Button>
          </Tooltip>
          <ThemeToggle />
          <Button
            color="inherit"
            onClick={e => setMenuEl(e.currentTarget)}
            sx={{ pl: 0.75, pr: { xs: 0.75, sm: 1.5 }, py: 0.5, borderRadius: 999, gap: 1, minWidth: 0 }}
            aria-label="Account menu"
          >
            <Avatar src={admin?.photoUrl || undefined} sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: 14 }}>
              {initials(admin?.name)}
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "left", lineHeight: 1.1 }}>
              <Typography sx={{ fontSize: 13.5, fontWeight: 750 }} noWrap>
                {admin?.name || "…"}
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: "text.secondary", fontWeight: 600 }} noWrap>
                {admin?.roleName || ""}
              </Typography>
            </Box>
          </Button>
          <Menu
            anchorEl={menuEl}
            open={Boolean(menuEl)}
            onClose={() => setMenuEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{ paper: { sx: { mt: 1, minWidth: 240, borderRadius: 3, border: `1px solid ${theme.palette.divider}` } } }}
          >
            <Box sx={{ px: 2, py: 1.25 }}>
              <Typography sx={{ fontWeight: 750 }}>{admin?.name}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {admin?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem component={Link} href="/" onClick={() => setMenuEl(null)}>
              <ListItemIcon>
                <OpenInNewRounded fontSize="small" />
              </ListItemIcon>
              Public website
            </MenuItem>
            <MenuItem onClick={logout}>
              <ListItemIcon>
                <LogoutRounded fontSize="small" />
              </ListItemIcon>
              Sign out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" className="no-print" sx={{ width: { lg: width }, flexShrink: { lg: 0 }, transition: "width .25s ease" }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: "block", lg: "none" }, "& .MuiDrawer-paper": { width: DRAWER, boxSizing: "border-box" } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", lg: "block" },
            "& .MuiDrawer-paper": { width, boxSizing: "border-box", transition: "width .25s ease", overflowX: "hidden" },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { lg: `calc(100% - ${width}px)` },
          pt: { xs: 10, md: 11 },
          pb: { xs: 4, md: 6 },
          px: { xs: 2, sm: 3, md: 4 },
          "@media print": { p: 0, width: "100%" },
        }}
      >
        <Box sx={{ maxWidth: 1440, mx: "auto" }}>
          {admin?.impersonatedBy && (
            <Alert
              severity="warning"
              icon={<SupervisorAccountRounded />}
              className="no-print"
              sx={{ mb: 2.5, borderRadius: 3, alignItems: "center", fontWeight: 600 }}
              action={
                <Button color="inherit" size="small" variant="outlined" onClick={returnToOwnAccount} sx={{ fontWeight: 750 }}>
                  Return to my account
                </Button>
              }
            >
              You ({admin.impersonatedBy.name}) are logged in as <b>{admin.name}</b> · {admin.roleName}. Everything you do is
              done as them.
            </Alert>
          )}
          {children}
        </Box>
      </Box>
    </Box>
  );
}
