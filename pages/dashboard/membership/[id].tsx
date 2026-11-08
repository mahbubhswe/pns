import React from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import Swal from "sweetalert2";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import HighlightOffRounded from "@mui/icons-material/HighlightOffRounded";
import HourglassTopRounded from "@mui/icons-material/HourglassTopRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import PhoneRounded from "@mui/icons-material/PhoneRounded";
import MailRounded from "@mui/icons-material/MailRounded";
import ReceiptLongRounded from "@mui/icons-material/ReceiptLongRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import DescriptionRounded from "@mui/icons-material/DescriptionRounded";
import DashboardLayout from "@/components/dashboard/Layout";
import { PageHeader, SectionCard, StatusChip } from "@/components/dashboard/ui";
import { getJSON } from "@/lib/api";
import { useAdmin } from "@/lib/useAdmin";
import { formatDate, initials, money } from "@/lib/format";

type Member = {
  id: number;
  sectorNumber: string;
  roadNumber: string;
  plotNumber: string;
  plotSize: string;
  ownershipProofType: string;
  ownershipProofFile?: string | null;
  ownerNameEnglish: string;
  ownerNameBangla: string;
  contactNumber: string;
  nidNumber: string;
  presentAddress: string;
  permanentAddress: string;
  email: string;
  ownerPhoto?: string | null;
  paymentMethod: string;
  bkashTransactionId?: string | null;
  bkashAccountNumber?: string | null;
  bankAccountNumberFrom?: string | null;
  paymentReceipt?: string | null;
  membershipFee: number;
  agreeDataUse: boolean;
  status: string; // raw enum: APPROVED | PENDING | REJECTED
  createdAt: string;
  updatedAt: string;
};

const PROOF: Record<string, string> = {
  LD_TAX_RECEIPT: "LD tax receipt",
  MUTATION_PAPER: "Mutation paper",
  BDS_KHATIAN: "BDS khatian",
};

// GET /api/memberships/[id] returns the DB enum; PATCH expects the UI words.
const ENUM_TO_UI: Record<string, "active" | "pending" | "inactive"> = { APPROVED: "active", PENDING: "pending", REJECTED: "inactive" };

export default function MemberDetailPage() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = router.query;
  const { can } = useAdmin();
  const { data, isLoading, error, mutate } = useSWR<{ member: Member }>(id ? `/api/memberships/${id}` : null, getJSON);
  const p = data?.member;
  const uiStatus = p ? ENUM_TO_UI[p.status] || "pending" : "pending";
  const { data: fees } = useSWR<{ vouchers: Array<{ id: number; voucherNo: string; amount: number; date: string; status: string; accountName: string }> }>(
    p && can("accounting.view") ? `/api/accounting/vouchers?memberId=${p.id}` : null,
    getJSON
  );

  async function setStatus(next: "active" | "pending" | "inactive") {
    const words = { active: "approve", inactive: "reject", pending: "move back to pending" }[next];
    const result = await Swal.fire({
      title: `${words[0].toUpperCase()}${words.slice(1)} ${p?.ownerNameEnglish}?`,
      text:
        next === "active"
          ? "They will become an approved member of the society."
          : next === "inactive"
            ? "The application will be marked as rejected. You can change this later."
            : "The application goes back to the review queue.",
      icon: next === "inactive" ? "warning" : "question",
      showCancelButton: true,
      confirmButtonText: `Yes, ${words}`,
      confirmButtonColor: next === "inactive" ? "#D23B3B" : "#0F6E56",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/memberships/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Could not update status");
      await mutate();
      Swal.fire({ icon: "success", title: "Status updated", timer: 1200, showConfirmButton: false });
    } catch (e: any) {
      Swal.fire({ icon: "error", title: "Failed", text: e?.message || "Could not update status" });
    }
  }

  async function onDelete() {
    const result = await Swal.fire({
      title: "Delete this member record?",
      text: "This permanently removes the application and cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      confirmButtonColor: "#D23B3B",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/memberships/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Could not delete member.");
      await Swal.fire({ title: "Deleted", icon: "success", timer: 1200, showConfirmButton: false });
      router.push("/dashboard/membership");
    } catch (e: any) {
      Swal.fire({ title: "Failed", text: e?.message || "Could not delete member.", icon: "error" });
    }
  }

  return (
    <DashboardLayout title={p?.ownerNameEnglish || "Member"} permission="members.view">
      <PageHeader
        crumbs={[{ label: "Members", href: "/dashboard/membership" }, { label: p?.ownerNameEnglish || "Member" }]}
        title="Member profile"
        subtitle="Check the plot, documents and payment, then record your decision."
      />
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error || !p ? (
        <Alert severity="warning">We couldn&apos;t load this member. They may have been removed.</Alert>
      ) : (
        <Stack spacing={2.5}>
          {/* Identity + decision */}
          <Card sx={{ p: { xs: 2, md: 3 } }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "flex-start", md: "center" }}>
              <Avatar
                src={p.ownerPhoto || undefined}
                variant="rounded"
                sx={{ width: 96, height: 96, borderRadius: 4, fontSize: 32, bgcolor: alpha(theme.palette.primary.main, 0.12), color: "primary.main" }}
              >
                {initials(p.ownerNameEnglish)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography variant="h5">{p.ownerNameEnglish}</Typography>
                  <StatusChip status={p.status} size="medium" />
                </Stack>
                {p.ownerNameBangla && (
                  <Typography sx={{ fontFamily: '"Hind Siliguri", sans-serif', fontSize: 18, mt: 0.25 }} color="text.secondary">
                    {p.ownerNameBangla}
                  </Typography>
                )}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0.5, sm: 2.5 }} sx={{ mt: 1.25, color: "text.secondary" }}>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <MailRounded fontSize="small" />
                    <Typography variant="body2" component="a" href={`mailto:${p.email}`} sx={{ color: "inherit" }}>
                      {p.email}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <PhoneRounded fontSize="small" />
                    <Typography variant="body2" component="a" href={`tel:${p.contactNumber}`} sx={{ color: "inherit" }}>
                      {p.contactNumber}
                    </Typography>
                  </Stack>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  Applied {formatDate(p.createdAt, "long")} · last updated {formatDate(p.updatedAt)}
                </Typography>
              </Box>
              {can("members.manage") && (
                <Stack direction={{ xs: "row", md: "column" }} spacing={1} useFlexGap flexWrap="wrap" sx={{ minWidth: { md: 200 } }}>
                  {uiStatus !== "active" && (
                    <Button variant="contained" startIcon={<CheckCircleRounded />} onClick={() => setStatus("active")}>
                      Approve
                    </Button>
                  )}
                  {uiStatus !== "inactive" && (
                    <Button variant="outlined" color="error" startIcon={<HighlightOffRounded />} onClick={() => setStatus("inactive")}>
                      Reject
                    </Button>
                  )}
                  {uiStatus !== "pending" && (
                    <Button color="inherit" startIcon={<HourglassTopRounded />} onClick={() => setStatus("pending")}>
                      Back to pending
                    </Button>
                  )}
                </Stack>
              )}
            </Stack>
          </Card>

          <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" } }}>
            <SectionCard title="Plot in Purbachal">
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1.5 }}>
                {[
                  ["Sector", p.sectorNumber],
                  ["Road", p.roadNumber],
                  ["Plot", p.plotNumber],
                  ["Size", p.plotSize ? `${p.plotSize} katha` : "—"],
                ].map(([k, v]) => (
                  <Box key={k} sx={{ p: 1.5, borderRadius: 2.5, bgcolor: "action.hover", textAlign: "center" }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      {k}
                    </Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: 18 }}>{v}</Typography>
                  </Box>
                ))}
              </Box>
              <Divider sx={{ my: 2 }} />
              <KV label="Ownership proof" value={PROOF[p.ownershipProofType] || p.ownershipProofType} />
            </SectionCard>

            <SectionCard title="Payment">
              <Typography sx={{ fontSize: 28, fontWeight: 800 }}>{money(p.membershipFee, { decimals: false })}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Paid via {p.paymentMethod === "BKASH" ? "bKash" : "bank transfer"}
              </Typography>
              {p.paymentMethod === "BKASH" ? (
                <>
                  <KV label="bKash transaction ID" value={p.bkashTransactionId || "—"} mono />
                  <KV label="Sent from (bKash no.)" value={p.bkashAccountNumber || "—"} mono />
                </>
              ) : (
                <KV label="Sender bank account" value={p.bankAccountNumberFrom || "—"} mono />
              )}
              {can("accounting.view") && (
                <Box sx={{ mt: 2, p: 1.5, borderRadius: 2.5, border: `1px dashed ${theme.palette.divider}` }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <ReceiptLongRounded fontSize="small" color="primary" />
                    <Typography sx={{ fontWeight: 700, fontSize: 14 }}>In the society&apos;s books</Typography>
                  </Stack>
                  {fees && fees.vouchers.length > 0 ? (
                    fees.vouchers.map(v => (
                      <Typography key={v.id} variant="body2">
                        <Link href={`/dashboard/accounting/vouchers/${v.id}`}>{v.voucherNo}</Link> · {money(v.amount)} into {v.accountName} on {formatDate(v.date)}
                        {v.status === "VOID" ? " (void)" : ""}
                      </Typography>
                    ))
                  ) : (
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }} justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        This fee hasn&apos;t been recorded as income yet.
                      </Typography>
                      {can("accounting.entry") && (
                        <Button
                          size="small"
                          startIcon={<AddRounded />}
                          component={Link}
                          href={`/dashboard/accounting/vouchers?new=INCOME&memberId=${p.id}&amount=${p.membershipFee}&party=${encodeURIComponent(p.ownerNameEnglish)}&ref=${encodeURIComponent(p.bkashTransactionId || p.bankAccountNumberFrom || "")}`}
                        >
                          Record fee
                        </Button>
                      )}
                    </Stack>
                  )}
                </Box>
              )}
            </SectionCard>

            <SectionCard title="Owner details">
              <KV label="National ID" value={p.nidNumber} mono />
              <KV label="Present address" value={p.presentAddress} />
              <KV label="Permanent address" value={p.permanentAddress} />
              <KV label="Agreed to data use" value={p.agreeDataUse ? "Yes" : "No"} />
            </SectionCard>

            <SectionCard title="Documents" subtitle="Open each file to verify before approving">
              <Stack spacing={1}>
                <DocLink label="Owner photo" url={p.ownerPhoto} />
                <DocLink label={PROOF[p.ownershipProofType] || "Ownership proof"} url={p.ownershipProofFile} />
                <DocLink label="Payment receipt" url={p.paymentReceipt} />
              </Stack>
            </SectionCard>
          </Box>

          {can("members.delete") && (
            <Card sx={{ p: 2.5, borderColor: alpha(theme.palette.error.main, 0.3) }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} justifyContent="space-between">
                <Box>
                  <Typography sx={{ fontWeight: 750 }}>Delete this record</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Only for duplicates or test entries. Rejecting keeps a history; deleting does not.
                  </Typography>
                </Box>
                <Button color="error" variant="outlined" startIcon={<DeleteOutlineRounded />} onClick={onDelete}>
                  Delete member
                </Button>
              </Stack>
            </Card>
          )}
        </Stack>
      )}
    </DashboardLayout>
  );
}

function KV({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0, sm: 2 }} sx={{ py: 0.9, borderBottom: t => `1px solid ${t.palette.divider}`, "&:last-child": { borderBottom: 0 } }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 190, fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: "break-word", ...(mono && { fontVariantNumeric: "tabular-nums", letterSpacing: ".02em" }) }}>
        {value ?? "—"}
      </Typography>
    </Stack>
  );
}

function DocLink({ label, url }: { label: string; url?: string | null }) {
  const isImage = url && /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url);
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.25, borderRadius: 2.5, bgcolor: "action.hover" }}>
      <Box sx={{ width: 48, height: 48, borderRadius: 2, overflow: "hidden", bgcolor: "background.paper", display: "grid", placeItems: "center", flexShrink: 0 }}>
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url!} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <DescriptionRounded color="action" />
        )}
      </Box>
      <Typography sx={{ flex: 1, fontWeight: 600 }}>{label}</Typography>
      {url ? (
        <Button size="small" endIcon={<OpenInNewRounded fontSize="small" />} component="a" href={url} target="_blank" rel="noreferrer">
          Open
        </Button>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Not uploaded
        </Typography>
      )}
    </Stack>
  );
}
