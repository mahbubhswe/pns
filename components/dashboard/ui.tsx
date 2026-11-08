// components/dashboard/ui.tsx — small building blocks shared by admin pages.
import React from "react";
import Link from "next/link";
import { Box, Breadcrumbs, Card, CardContent, Chip, Link as MLink, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import NavigateNextRounded from "@mui/icons-material/NavigateNextRounded";

export function PageHeader({
  title,
  subtitle,
  actions,
  crumbs,
  eyebrow,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  crumbs?: Array<{ label: string; href?: string }>;
  eyebrow?: React.ReactNode;
}) {
  return (
    <Box sx={{ mb: { xs: 2.5, md: 3.5 } }}>
      {crumbs && crumbs.length > 0 && (
        <Breadcrumbs separator={<NavigateNextRounded fontSize="small" />} sx={{ mb: 1, fontSize: 13 }} className="no-print">
          {crumbs.map((c, i) =>
            c.href ? (
              <MLink key={i} component={Link} href={c.href} underline="hover" color="text.secondary" sx={{ fontWeight: 600 }}>
                {c.label}
              </MLink>
            ) : (
              <Typography key={i} color="text.primary" sx={{ fontSize: 13, fontWeight: 700 }}>
                {c.label}
              </Typography>
            )
          )}
        </Breadcrumbs>
      )}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "flex-end" }} justifyContent="space-between">
        <Box sx={{ minWidth: 0 }}>
          {eyebrow && (
            <Typography variant="overline" color="primary" sx={{ display: "block", lineHeight: 1.6 }}>
              {eyebrow}
            </Typography>
          )}
          <Typography variant="h4" component="h1" sx={{ fontSize: { xs: 26, md: 32 } }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 720 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && (
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" className="no-print" sx={{ flexShrink: 0 }}>
            {actions}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

type Tone = "primary" | "secondary" | "success" | "warning" | "error" | "info";

export function StatCard({
  label,
  value,
  icon,
  tone = "primary",
  hint,
  href,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  tone?: Tone;
  hint?: React.ReactNode;
  href?: string;
}) {
  const theme = useTheme();
  const c = theme.palette[tone].main;
  const body = (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
        ...(href && { "&:hover": { transform: "translateY(-2px)", borderColor: alpha(c, 0.45) } }),
        "&::after": {
          content: '""',
          position: "absolute",
          inset: "auto -30px -50px auto",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: alpha(c, theme.palette.mode === "light" ? 0.07 : 0.12),
        },
      }}
    >
      <CardContent sx={{ p: { xs: 1.75, sm: 2.5 }, "&:last-child": { pb: { xs: 1.75, sm: 2.5 } } }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1, sm: 1.5 }} alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mb: { xs: 1, sm: 1.5 } }}>
          {icon && (
            <Box sx={{ width: { xs: 34, sm: 40 }, height: { xs: 34, sm: 40 }, borderRadius: 2.5, display: "grid", placeItems: "center", bgcolor: alpha(c, 0.12), color: c, flexShrink: 0, "& svg": { fontSize: { xs: 20, sm: 24 } } }}>
              {icon}
            </Box>
          )}
          <Typography sx={{ fontSize: { xs: 12.5, sm: 13.5 }, fontWeight: 700, color: "text.secondary", lineHeight: 1.3 }}>{label}</Typography>
        </Stack>
        <Typography sx={{ fontSize: { xs: 21, sm: 26, md: 30 }, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, fontVariantNumeric: "tabular-nums", wordBreak: "break-word" }}>
          {value}
        </Typography>
        {hint && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, position: "relative", zIndex: 1, fontSize: { xs: 12, sm: 14 } }}>
            {hint}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
  return href ? (
    <Box component={Link} href={href} sx={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}>
      {body}
    </Box>
  ) : (
    body
  );
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  noPad,
  sx,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  noPad?: boolean;
  sx?: any;
}) {
  return (
    <Card sx={{ height: "100%", ...sx }}>
      {(title || action) && (
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2} sx={{ px: 2.5, pt: 2.25, pb: noPad ? 1.5 : 0 }}>
          <Box sx={{ minWidth: 0 }}>
            {title && <Typography sx={{ fontWeight: 750, fontSize: 16.5 }}>{title}</Typography>}
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action && <Box className="no-print" sx={{ flexShrink: 0 }}>{action}</Box>}
        </Stack>
      )}
      {noPad ? children : <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>{children}</CardContent>}
    </Card>
  );
}

export function EmptyState({ icon, title, body, action }: { icon?: React.ReactNode; title: string; body?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Stack alignItems="center" spacing={1.25} sx={{ py: 6, px: 2, textAlign: "center" }}>
      {icon && (
        <Box sx={{ width: 56, height: 56, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: "action.hover", color: "text.secondary" }}>
          {icon}
        </Box>
      )}
      <Typography sx={{ fontWeight: 750 }}>{title}</Typography>
      {body && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {body}
        </Typography>
      )}
      {action}
    </Stack>
  );
}

const STATUS: Record<string, { label: string; color: "success" | "warning" | "default" | "error" | "info" }> = {
  active: { label: "Approved", color: "success" },
  APPROVED: { label: "Approved", color: "success" },
  pending: { label: "Pending review", color: "warning" },
  PENDING: { label: "Pending review", color: "warning" },
  inactive: { label: "Rejected", color: "default" },
  REJECTED: { label: "Rejected", color: "default" },
  POSTED: { label: "Posted", color: "success" },
  VOID: { label: "Void", color: "error" },
};

export function StatusChip({ status, size = "small" }: { status: string; size?: "small" | "medium" }) {
  const s = STATUS[status] || { label: status, color: "default" as const };
  return (
    <Chip
      size={size}
      label={s.label}
      color={s.color}
      variant={s.color === "default" ? "outlined" : "filled"}
      sx={{ fontWeight: 700, ...(s.color === "warning" && { color: "#3B2600" }) }}
    />
  );
}

export const TYPE_META: Record<string, { label: string; short: string; color: string }> = {
  INCOME: { label: "Income (receipt)", short: "Income", color: "#1E8E6E" },
  EXPENSE: { label: "Expense (payment)", short: "Expense", color: "#E2553C" },
  TRANSFER: { label: "Transfer (contra)", short: "Transfer", color: "#2F6FDE" },
};

export function TypeChip({ type }: { type: string }) {
  const m = TYPE_META[type] || { short: type, color: "#888" };
  return (
    <Chip
      size="small"
      label={m.short}
      sx={{ fontWeight: 700, bgcolor: alpha(m.color, 0.12), color: m.color, border: `1px solid ${alpha(m.color, 0.3)}` }}
    />
  );
}

/** Responsive card grid; stat tiles sit two-up on phones. */
export function Grid({ min = 240, gap = 2, phoneCols = 2, children, sx }: { min?: number; gap?: number; phoneCols?: 1 | 2; children: React.ReactNode; sx?: any }) {
  return (
    <Box sx={{ display: "grid", gap: { xs: 1.5, sm: gap }, gridTemplateColumns: { xs: `repeat(${phoneCols}, minmax(0, 1fr))`, sm: `repeat(auto-fill, minmax(${min}px, 1fr))` }, ...sx }}>
      {children}
    </Box>
  );
}
