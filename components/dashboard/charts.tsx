"use client";

// components/dashboard/charts.tsx — themed bar charts (validated income/expense pair, legend + tooltip).
import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useTheme, type Theme } from "@mui/material/styles";
import { BarChart } from "@mui/x-charts/BarChart";
import { moneyCompact, money } from "@/lib/format";

/** Income/expense hues, validated for CVD separation & contrast in each mode (dataviz validator). */
export function useFinanceColors() {
  const theme = useTheme();
  return theme.palette.mode === "light"
    ? { income: "#1E8E6E", expense: "#E2553C", single: "#1E8E6E" }
    : { income: "#2AA982", expense: "#E45F41", single: "#2AA982" };
}

function chartSx(theme: Theme) {
  const muted = theme.palette.text.secondary;
  return {
    "& .MuiChartsAxis-line, & .MuiChartsAxis-tick": { stroke: theme.palette.divider },
    "& .MuiChartsAxis-tickLabel": { fill: muted, fontSize: 12, fontWeight: 600 },
    "& .MuiChartsGrid-line": { stroke: theme.palette.divider, strokeDasharray: "none" },
    "& .MuiChartsLegend-label": { fill: theme.palette.text.primary, fontWeight: 600, fontSize: 13 },
  };
}

export function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Box sx={{ width: 10, height: 10, borderRadius: "3px", bgcolor: color }} />
      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{label}</Typography>
    </Stack>
  );
}

export function IncomeExpenseChart({
  data,
  height = 300,
}: {
  data: Array<{ label: string; income: number; expense: number }>;
  height?: number;
}) {
  const theme = useTheme();
  const c = useFinanceColors();
  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
        <LegendDot color={c.income} label="Income" />
        <LegendDot color={c.expense} label="Expenditure" />
      </Stack>
      <BarChart
        dataset={data as any}
        height={height}
        borderRadius={4}
        grid={{ horizontal: true }}
        margin={{ left: 56, right: 8, top: 12, bottom: 28 }}
        xAxis={[{ scaleType: "band", dataKey: "label", categoryGapRatio: 0.42, barGapRatio: 0.12, disableLine: true, disableTicks: true } as any]}
        yAxis={[{ valueFormatter: (v: number) => moneyCompact(v), disableLine: true, disableTicks: true } as any]}
        series={[
          { dataKey: "income", label: "Income", color: c.income, valueFormatter: v => money(v ?? 0, { decimals: false }) },
          { dataKey: "expense", label: "Expenditure", color: c.expense, valueFormatter: v => money(v ?? 0, { decimals: false }) },
        ]}
        slotProps={{ legend: { hidden: true } }}
        sx={chartSx(theme)}
      />
    </Box>
  );
}

export function SingleBarChart({
  data,
  height = 240,
  label,
  format = "count",
}: {
  data: Array<{ label: string; value: number }>;
  height?: number;
  label: string;
  format?: "count" | "money";
}) {
  const theme = useTheme();
  const c = useFinanceColors();
  const fmt = (v: number | null) => (format === "money" ? money(v ?? 0, { decimals: false }) : String(v ?? 0));
  return (
    <BarChart
      dataset={data as any}
      height={height}
      borderRadius={4}
      grid={{ horizontal: true }}
      margin={{ left: format === "money" ? 56 : 36, right: 8, top: 12, bottom: 28 }}
      xAxis={[{ scaleType: "band", dataKey: "label", categoryGapRatio: 0.5, disableLine: true, disableTicks: true } as any]}
      yAxis={[{ valueFormatter: (v: number) => (format === "money" ? moneyCompact(v) : String(v)), disableLine: true, disableTicks: true, tickMinStep: 1 } as any]}
      series={[{ dataKey: "value", label, color: c.single, valueFormatter: fmt }]}
      slotProps={{ legend: { hidden: true } }}
      sx={chartSx(theme)}
    />
  );
}

/** Horizontal "share" bars for a ranked list (top expense heads etc.). */
export function RankBars({ rows, color }: { rows: Array<{ name: string; amount: number }>; color?: string }) {
  const c = useFinanceColors();
  const max = Math.max(1, ...rows.map(r => r.amount));
  return (
    <Stack spacing={1.5}>
      {rows.map(r => (
        <Box key={r.name}>
          <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {r.name}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
              {money(r.amount, { decimals: false })}
            </Typography>
          </Stack>
          <Box sx={{ height: 8, borderRadius: 4, bgcolor: "action.hover", overflow: "hidden" }}>
            <Box sx={{ width: `${(r.amount / max) * 100}%`, height: "100%", borderRadius: 4, bgcolor: color || c.expense, transition: "width .6s ease" }} />
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
