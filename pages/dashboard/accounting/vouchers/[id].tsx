import React from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import Link from "next/link";
import { Alert, Box, Button, Card, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import PrintRounded from "@mui/icons-material/PrintRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import AttachFileRounded from "@mui/icons-material/AttachFileRounded";
import DashboardLayout from "@/components/dashboard/Layout";
import { PageHeader, StatusChip, TYPE_META } from "@/components/dashboard/ui";
import { BrandMark } from "@/components/BrandLogo";
import type { Voucher } from "@/components/accounting/data";
import { getJSON } from "@/lib/api";
import { amountInWords, formatDate, money } from "@/lib/format";

const TITLE: Record<string, string> = { INCOME: "Money Receipt", EXPENSE: "Payment Voucher", TRANSFER: "Contra (Transfer) Voucher" };

export default function VoucherDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data, error, isLoading } = useSWR<{ voucher: Voucher }>(id ? `/api/accounting/vouchers/${id}` : null, getJSON);
  const v = data?.voucher;

  return (
    <DashboardLayout title={v?.voucherNo || "Voucher"} permission={["accounting.view", "accounting.entry"]}>
      <Box className="no-print">
        <PageHeader
          crumbs={[{ label: "Vouchers", href: "/dashboard/accounting/vouchers" }, { label: v?.voucherNo || "…" }]}
          title={v ? `${TYPE_META[v.type].short} voucher` : "Voucher"}
          actions={
            <>
              <Button component={Link} href="/dashboard/accounting/vouchers" startIcon={<ArrowBackRounded />} color="inherit">
                Back
              </Button>
              <Button variant="contained" startIcon={<PrintRounded />} onClick={() => window.print()} disabled={!v}>
                Print
              </Button>
            </>
          }
        />
      </Box>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error || !v ? (
        <Alert severity="warning">Voucher not found.</Alert>
      ) : (
        <Card sx={{ maxWidth: 820, mx: "auto", p: { xs: 2.5, md: 5 }, position: "relative", overflow: "hidden", "@media print": { border: 0, boxShadow: "none", p: 0, maxWidth: "100%" } }}>
          {v.status === "VOID" && (
            <Typography
              aria-hidden
              sx={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%) rotate(-18deg)", fontSize: { xs: 72, md: 120 }, fontWeight: 900, color: "error.main", opacity: 0.12, pointerEvents: "none" }}
            >
              VOID
            </Typography>
          )}
          <Stack direction="row" spacing={2} alignItems="center">
            <BrandMark size={52} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 800, fontSize: 20 }}>Purbachal Newtown Society</Typography>
              <Typography variant="body2" color="text.secondary">
                Purbachal New Town, Dhaka · পূর্বাচল নিউটাউন সোসাইটি
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontWeight: 800, fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase", color: TYPE_META[v.type].color }}>{TITLE[v.type]}</Typography>
              <Typography sx={{ fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>{v.voucherNo}</Typography>
            </Box>
          </Stack>
          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
            <Field label="Date" value={formatDate(v.date, "long")} />
            <Field label="Status" value={<StatusChip status={v.status} />} />
            {v.type === "TRANSFER" ? (
              <>
                <Field label="From account" value={v.accountName} />
                <Field label="To account" value={v.toAccountName} />
              </>
            ) : (
              <>
                <Field label={v.type === "INCOME" ? "Received from" : "Paid to"} value={v.partyName || v.memberName || "—"} />
                <Field label="Head of account" value={`${v.headCode ? v.headCode + " · " : ""}${v.headName}`} />
                <Field label={v.type === "INCOME" ? "Received into" : "Paid from"} value={v.accountName} />
              </>
            )}
            <Field label="Reference" value={v.reference || "—"} />
          </Box>

          <Box sx={{ my: 3, p: 2.5, borderRadius: 3, bgcolor: "action.hover", border: t => `1px solid ${t.palette.divider}` }}>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1}>
              <Typography sx={{ fontStyle: "italic" }}>{amountInWords(v.amount)}</Typography>
              <Typography sx={{ fontSize: 30, fontWeight: 900, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{money(v.amount)}</Typography>
            </Stack>
          </Box>

          {v.description && <Field label="Notes" value={v.description} />}
          {v.attachmentUrl && (
            <Button className="no-print" sx={{ mt: 2 }} size="small" startIcon={<AttachFileRounded />} component="a" href={v.attachmentUrl} target="_blank" rel="noreferrer">
              View attached receipt / bill
            </Button>
          )}
          {v.status === "VOID" && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Voided {v.voidedAt ? formatDate(v.voidedAt) : ""} by {v.voidedBy || "—"}: {v.voidReason}
            </Alert>
          )}

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: { xs: 2, md: 5 }, mt: { xs: 6, md: 9 } }}>
            {[v.type === "INCOME" ? "Received by" : "Prepared by", "Treasurer", v.type === "INCOME" ? "Payer" : "Approved by"].map(l => (
              <Box key={l} sx={{ textAlign: "center" }}>
                <Box sx={{ borderTop: t => `1.5px solid ${t.palette.text.primary}`, pt: 0.75 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {l}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 4, textAlign: "center" }}>
            Entered by {v.createdBy || "—"} on {formatDate(v.createdAt)} · This is a computer-generated voucher from the PNS management portal.
          </Typography>
        </Card>
      )}
    </DashboardLayout>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>
        {label}
      </Typography>
      <Box sx={{ fontWeight: 650, mt: 0.25 }}>{value}</Box>
    </Box>
  );
}
