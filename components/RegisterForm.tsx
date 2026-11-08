"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import Link from "next/link";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import axios from "axios";
import { DEFAULT_SITE_SETTINGS, visibleHomeSections, type SiteSettings } from "@/lib/shared/settings";
import PublicHeader from "@/components/PublicHeader";
import { SceneStage } from "@/components/AuthShell";

// 🔢 Types
type PaymentMethod = "BKASH" | "BANK";

type FormState = {
  // Plot info
  sectorNumber: string;
  roadNumber: string;
  plotNumber: string;
  plotSize: string;

  // Ownership proof
  ownershipProofType: "MUTATION_PAPER" | "BDS_KHATIAN";
  ownershipProofFile: File | null;

  // Owner info
  ownerNameEnglish: string;
  ownerNameBangla: string;
  contactNumber: string;
  nidNumber: string;
  presentAddress: string;
  permanentAddress: string;
  email: string;
  ownerPhoto: File | null;

  // Payment
  paymentMethod: PaymentMethod;
  bkashTransactionId: string;
  bkashAccountNumber: string;
  bankAccountNumberFrom: string;
  paymentReceipt: File | null; // bKash screenshot OR bank slip

  // 🔑 New field
  password: string;

  // Consent
  agreeDataUse: boolean;
};

const initialState: FormState = {
  sectorNumber: "",
  roadNumber: "",
  plotNumber: "",
  plotSize: "",
  ownershipProofType: "BDS_KHATIAN",
  ownershipProofFile: null,
  ownerNameEnglish: "",
  ownerNameBangla: "",
  contactNumber: "",
  nidNumber: "",
  presentAddress: "",
  permanentAddress: "",
  email: "",
  ownerPhoto: null,
  paymentMethod: "BKASH",
  bkashTransactionId: "",
  bkashAccountNumber: "",
  bankAccountNumberFrom: "",
  paymentReceipt: null,
  password: "",
  agreeDataUse: false,
};

// ---------- Helpers ----------
const TEN_MB = 10 * 1024 * 1024;
const isPdf = (f: File | null) => !!f && f.type === "application/pdf";
const isImage = (f: File | null) => !!f && f.type.startsWith("image/");
const nonEmpty = (s: string) => !!s && s.trim().length > 0;
const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const phoneOk = (s: string) => /^[0-9+\-\s]{11,}$/.test(s);
const nidOk = (s: string) =>
  /^[0-9]{13}$|^[0-9]{17}$/.test(s.replace(/\s/g, ""));
function validateSize(f: File | null) {
  if (!f) return true;
  return f.size <= TEN_MB;
}

// ---------- Layout helpers (TOP-LEVEL!) ----------
type RowProps = { gap?: number; children: React.ReactNode };
const Row: React.FC<RowProps> = ({ children, gap = 2 }) => (
  <Box
    sx={{ display: "flex", flexWrap: "wrap", gap, alignItems: "flex-start" }}
  >
    {children}
  </Box>
);

type ColProps = { basis?: number; children: React.ReactNode };
const Col: React.FC<ColProps> = ({ children, basis = 280 }) => (
  <Box sx={{ flex: `1 1 ${basis}px`, minWidth: basis }}>{children}</Box>
);

// ---------- FilePicker with PDF preview ----------
function FilePicker({
  label,
  onChange,
  accept = "image/*,application/pdf",
  helper,
  required,
  file,
  errorText,
}: {
  label: string;
  accept?: string;
  onChange: (f: File | null) => void;
  helper?: string;
  required?: boolean;
  file: File | null;
  errorText?: string;
}) {
  const [localName, setLocalName] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file && (isPdf(file) || isImage(file))) {
      const obj = URL.createObjectURL(file);
      setUrl(obj);
      return () => URL.revokeObjectURL(obj);
    } else {
      setUrl(null);
    }
  }, [file]);

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          component="label"
          variant="outlined"
          startIcon={<UploadFileIcon />}
          fullWidth
          size="small"
          sx={{ justifyContent: "flex-start" }}
        >
          {file ? `${label}: ${localName || file.name}` : label}
          <input
            type="file"
            hidden
            accept={accept}
            onChange={e => {
              const f = e.target.files?.[0] || null;
              setLocalName(f?.name || "");
              onChange(f);
            }}
          />
        </Button>

        {file && (isPdf(file) || isImage(file)) && url && (
          <Button
            onClick={() => setOpen(true)}
            size="small"
            variant="text"
            sx={{ whiteSpace: "nowrap" }}
          >
            Preview File
          </Button>
        )}
      </Stack>

      {(helper || errorText) && (
        <FormHelperText error={!!errorText} sx={{ ml: 1, mt: 0.5 }}>
          {required ? "* " : ""}
          {errorText || helper}
        </FormHelperText>
      )}

      {/* Preview dialog for PDF or Image */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ pr: 6 }}>
          {localName || file?.name || "Preview"}
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            p: 0,
            height: "80vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {url ? (
            isPdf(file) ? (
              <object
                data={url}
                type="application/pdf"
                width="100%"
                height="100%"
              >
                <Box p={2}>
                  <Typography>
                    PDF preview is not available in this browser. You can
                    download and open it locally.
                  </Typography>
                  <Button
                    href={url}
                    target="_blank"
                    rel="noopener"
                    sx={{ mt: 1 }}
                  >
                    Open PDF in new tab
                  </Button>
                </Box>
              </object>
            ) : isImage(file) ? (
              <Box sx={{ maxWidth: "100%", maxHeight: "100%" }}>
                <img
                  src={url}
                  alt="File preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </Box>
            ) : (
              <Box p={2}>
                <Typography>
                  Preview not supported for this file type.
                </Typography>
              </Box>
            )
          ) : (
            <Box p={2}>No preview available.</Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

// ---------- Labels for error summary ----------
type Key = keyof FormState;
const LABELS: Record<Key, string> = {
  sectorNumber: "Sector number",
  roadNumber: "Road number",
  plotNumber: "Plot number",
  plotSize: "Plot size",
  ownershipProofType: "Document type",
  ownershipProofFile: "Ownership proof file",
  ownerNameEnglish: "Owner name (English)",
  ownerNameBangla: "Owner name (Bangla)",
  contactNumber: "Contact number",
  nidNumber: "NID number",
  presentAddress: "Present address",
  permanentAddress: "Permanent address",
  email: "Email address",
  ownerPhoto: "Owner photo",
  paymentMethod: "Payment method",
  bkashTransactionId: "bKash transaction ID",
  bkashAccountNumber: "bKash account number used",
  bankAccountNumberFrom: "Bank account number (sender)",
  paymentReceipt: "Payment receipt/screenshot",
  agreeDataUse: "Consent to data use",
  password: "Password",
};

// ---------- Validation helpers (per-field + all) ----------
function validateField(key: Key, v: FormState): string | undefined {
  switch (key) {
    case "sectorNumber":
      if (!nonEmpty(v.sectorNumber)) return "Sector number is required";
      return;
    case "roadNumber":
      if (!nonEmpty(v.roadNumber)) return "Road number is required";
      return;
    case "plotNumber":
      if (!nonEmpty(v.plotNumber)) return "Plot number is required";
      return;
    case "plotSize":
      if (!nonEmpty(v.plotSize)) return "Plot size is required";
      const num = parseFloat(v.plotSize);
      if (isNaN(num) || num <= 0)
        return "Plot size must be a number greater than 0";
      if (num < 3) return "Plot size must be at least 3 Katha";
      return;
    case "ownerNameEnglish":
    case "ownerNameBangla":
    case "presentAddress":
      if (!nonEmpty((v as any)[key])) return `${LABELS[key]} is required`;
      return;
    case "password":
      if (!nonEmpty(v.password) || v.password.length < 8)
        return "Password must be at least 8 characters";
      return;
    case "permanentAddress":
      if (!nonEmpty((v as any)[key])) return `${LABELS[key]} is required`;
      return;
    case "contactNumber":
      if (!nonEmpty(v.contactNumber) || !phoneOk(v.contactNumber))
        return "Enter a valid phone number";
      return;
    case "nidNumber":
      if (!nonEmpty(v.nidNumber) || !nidOk(v.nidNumber))
        return "Enter a valid numeric NID (13 or 17 digits)";
      return;
    case "email":
      if (!nonEmpty(v.email) || !emailOk(v.email))
        return "Enter a valid email address";
      return;
    case "ownershipProofFile":
      if (!v.ownershipProofFile) return "Ownership proof file is required";
      if (!validateSize(v.ownershipProofFile))
        return "Ownership proof must be ≤ 10MB";
      return;
    case "ownerPhoto":
      if (!v.ownerPhoto) return "Owner photo is required";
      if (!validateSize(v.ownerPhoto)) return "Photo must be within 10MB";
      if (!isImage(v.ownerPhoto) && !isPdf(v.ownerPhoto))
        return "Photo must be an image or PDF file";
      return;
    case "bkashTransactionId":
      if (v.paymentMethod === "BKASH") {
        if (!nonEmpty(v.bkashTransactionId))
          return "bKash transaction ID is required";
        if (!/^[a-zA-Z0-9]{10}$/.test(v.bkashTransactionId.trim()))
          return "bKash transaction ID must be exactly 10 alphanumeric characters";
      }
      return;
    case "bkashAccountNumber":
      if (v.paymentMethod === "BKASH") {
        if (!nonEmpty(v.bkashAccountNumber))
          return "bKash account number used is required";
        if (!/^[0-9]{11}$/.test(v.bkashAccountNumber.trim()))
          return "bKash account number must be exactly 11 digits";
      }
      return;
    case "bankAccountNumberFrom":
      if (v.paymentMethod === "BANK" && !nonEmpty(v.bankAccountNumberFrom))
        return "Bank account number (sender) is required";
      return;
    case "paymentReceipt":
      if (v.paymentMethod === "BANK" && !v.paymentReceipt)
        return "Payment receipt/screenshot is required";
      if (v.paymentReceipt && !validateSize(v.paymentReceipt))
        return "Receipt must be ≤ 10MB";
      return;
    case "agreeDataUse":
      if (!v.agreeDataUse) return "You must agree to the data use notice";
      return;
    case "paymentMethod":
    case "ownershipProofType":
      // Always valid as they have defaults, but we keep for completeness
      if (!v[key]) return `${LABELS[key]} is required`;
      return;
    default:
      return;
  }
}

const ALL_KEYS: Key[] = [
  "sectorNumber",
  "roadNumber",
  "plotNumber",
  "plotSize",
  "ownershipProofType",
  "ownershipProofFile",
  "ownerNameEnglish",
  "ownerNameBangla",
  "contactNumber",
  "nidNumber",
  "presentAddress",
  "permanentAddress",
  "email",
  "ownerPhoto",
  "paymentMethod",
  "bkashTransactionId",
  "bkashAccountNumber",
  "bankAccountNumberFrom",
  "paymentReceipt",
  "agreeDataUse",
  "password",
];

function validateAll(v: FormState): Partial<Record<Key, string>> {
  const e: Partial<Record<Key, string>> = {};
  for (const k of ALL_KEYS) {
    const msg = validateField(k, v);
    if (msg) e[k] = msg;
  }
  return e;
}

export default function PnsMembershipForm({
  settings = DEFAULT_SITE_SETTINGS,
}: {
  /** Admin-editable site settings (fees, payment details), loaded server-side. */
  settings?: SiteSettings;
}) {
  // 🧾 Payment details come from the database (dashboard → Settings).
  const BKASH_FEE = settings.payment.feeBkash; // BDT
  const BANK_FEE = settings.payment.feeBank; // BDT
  const BKASH_NUMBER = settings.payment.bkashNumber; // Send Money (personal)
  const BANK = {
    name: settings.payment.bankName,
    accountName: settings.payment.bankAccountName,
    accountNumber: settings.payment.bankAccountNumber,
    routingNumber: settings.payment.bankRoutingNumber,
  };
  const SITE_NAME = settings.site.name;
  const registrationOpen = settings.registration.open;

  const [v, setV] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<Key, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<Key, boolean>>>({});
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [locked, setLocked] = useState(false);
  const [showGuidelinePreview, setShowGuidelinePreview] = useState(false);
  const [templatePreviewUrl, setTemplatePreviewUrl] = useState<string | null>(
    null
  );
  const [loadingTemplatePreview, setLoadingTemplatePreview] = useState(false);
  const [templatePreviewError, setTemplatePreviewError] = useState<
    string | null
  >(null);
  // const [doneId, setDoneId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    sev: "success" | "error" | "info" | "warning";
  }>({ open: false, msg: "", sev: "success" });


  // ---- unified setters for live validation ----
  function markTouched<K extends Key>(key: K) {
    setTouched(t => ({ ...t, [key]: true }));
    setErrors(prev => ({ ...prev, [key]: validateField(key, v) }));
  }

  function setField<K extends Key>(key: K, value: FormState[K]) {
    const next = { ...v, [key]: value } as FormState;
    setV(next);
    setTouched(t => ({ ...t, [key]: true }));
    // For dependent logic (e.g., switching payment method), revalidate all
    if (key === "paymentMethod") {
      setErrors(validateAll(next));
    } else {
      const msg = validateField(key, next);
      setErrors(e => ({ ...e, [key]: msg }));
    }
  }

  // ✅ Lightweight readiness check (kept from your logic)
  const canSubmit = useMemo(() => {
    const baseOk =
      nonEmpty(v.sectorNumber) &&
      nonEmpty(v.roadNumber) &&
      nonEmpty(v.plotNumber) &&
      nonEmpty(v.plotSize) &&
      v.ownershipProofFile &&
      nonEmpty(v.ownerNameEnglish) &&
      nonEmpty(v.ownerNameBangla) &&
      nonEmpty(v.contactNumber) &&
      phoneOk(v.contactNumber) &&
      nonEmpty(v.nidNumber) &&
      nidOk(v.nidNumber) &&
      nonEmpty(v.presentAddress) &&
      nonEmpty(v.permanentAddress) &&
      nonEmpty(v.email) &&
      emailOk(v.email) &&
      nonEmpty(v.password) &&
      v.password.length >= 8 &&
      v.ownerPhoto &&
      v.paymentReceipt &&
      v.agreeDataUse &&
      validateSize(v.ownershipProofFile) &&
      validateSize(v.ownerPhoto) &&
      validateSize(v.paymentReceipt);

    const paymentOk =
      v.paymentMethod === "BKASH"
        ? nonEmpty(v.bkashTransactionId) && nonEmpty(v.bkashAccountNumber)
        : nonEmpty(v.bankAccountNumberFrom) && !!v.paymentReceipt;

    return Boolean(baseOk && paymentOk);
  }, [v]);

  // Live “why disabled” reasons
  const liveErrors = validateAll(v);
  const blocking = Object.entries(liveErrors).filter(([, msg]) => !!msg) as [
    Key,
    string
  ][];

  // 👉 Build FormData for API
  function toFormData(data: FormState): FormData {
    const fd = new FormData();
    fd.append("password", data.password.trim());

    // Simple fields
    fd.append("sectorNumber", data.sectorNumber.trim());
    fd.append("roadNumber", data.roadNumber.trim());
    fd.append("plotNumber", data.plotNumber.trim());
    fd.append("plotSize", data.plotSize.trim());

    fd.append("ownershipProofType", data.ownershipProofType);
    fd.append("ownerNameEnglish", data.ownerNameEnglish.trim());
    fd.append("ownerNameBangla", data.ownerNameBangla.trim());
    fd.append("contactNumber", data.contactNumber.trim());
    fd.append("nidNumber", data.nidNumber.trim());
    fd.append("presentAddress", data.presentAddress.trim());
    fd.append("permanentAddress", data.permanentAddress.trim());
    fd.append("email", data.email.trim());

    fd.append("paymentMethod", data.paymentMethod);
    if (data.paymentMethod === "BKASH") {
      fd.append("bkashTransactionId", data.bkashTransactionId.trim());
      fd.append("bkashAccountNumber", data.bkashAccountNumber.trim());
    } else {
      fd.append("bankAccountNumberFrom", data.bankAccountNumberFrom.trim());
    }

    // Files
    if (data.ownershipProofFile)
      fd.append("ownershipProofFile", data.ownershipProofFile);
    if (data.ownerPhoto) fd.append("ownerPhoto", data.ownerPhoto);
    if (data.paymentReceipt) fd.append("paymentReceipt", data.paymentReceipt);

    // Extras (the fee itself is decided server-side from site settings)
    fd.append("agreeDataUse", String(data.agreeDataUse));

    return fd;
  }

  function validateBeforeSubmit(): boolean {
    const e = validateAll(v);
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!registrationOpen) {
      setToast({ open: true, msg: settings.registration.closedMessage, sev: "error" });
      return;
    }
    setSubmittedOnce(true);

    if (!validateBeforeSubmit()) {
      setToast({
        open: true,
        msg: "Please fix the highlighted fields.",
        sev: "error",
      });
      return;
    }

    if (locked) {
      return;
    }

    try {
      setSubmitting(true);
      const formData = toFormData(v);

      const res = await axios.post("/api/auth/register", formData, {
        timeout: 60_000,
      });

      const data = res.data ?? {};
      setToast({
        open: true,
        msg: data.message || "Submitted successfully.",
        sev: "success",
      });

      setErrors({});
      setTouched({});
      setSubmittedOnce(true);
      setLocked(true);
    } catch (err: unknown) {
      const msg = ((): string => {
        if (axios.isAxiosError(err)) {
          const d = err.response?.data as any;
          if (typeof d === "string") return d;
          if (d?.message) return d.message;
          if (d?.error) return d.error;
          return err.message;
        }
        return (err as Error).message;
      })();

      console.error(err);
      setToast({ open: true, msg, sev: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  const paymentInfo = (
    <Box sx={{ borderRadius: 2, p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Membership Registration Fee
      </Typography>
      <Typography variant="body2">
        BDT 1,020 via bKash / BDT 1,000 through bank deposit or bank transfer.
      </Typography>
    </Box>
  );

  // Helper to show error only when touched or after first submit attempt
  const handleGuidelinePreview = async () => {
    const isMobile = (() => {
      if (typeof navigator === "undefined") return false;
      const ua = navigator.userAgent || "";
      const isTouchMac =
        ua.includes("Macintosh") && (navigator.maxTouchPoints || 0) > 1;
      return (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          ua
        ) || isTouchMac
      );
    })();

    setTemplatePreviewError(null);
    setLoadingTemplatePreview(true);
    try {
      const res = await fetch("/api/previews/latest", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to load preview");
      }
      const data = await res.json();
      const nextUrl = `${data.url}?v=${Date.now()}`;
      setTemplatePreviewUrl(nextUrl);

      if (isMobile && typeof window !== "undefined") {
        setShowGuidelinePreview(false);
        window.open(nextUrl, "_blank", "noopener,noreferrer");
        return;
      }

      setShowGuidelinePreview(true);
    } catch (error) {
      setTemplatePreviewUrl(null);
      setTemplatePreviewError((error as Error).message);
      setShowGuidelinePreview(true);
    } finally {
      setLoadingTemplatePreview(false);
    }
  };

  const showErr = (key: Key) =>
    !!errors[key] && (touched[key] || submittedOnce) ? errors[key] : "";

  return (
    <>
      <PublicHeader site={settings.site} registrationOpen={registrationOpen} sections={visibleHomeSections(settings)} />
      {!registrationOpen && (
        <Alert severity="warning" sx={{ borderRadius: 0, justifyContent: "center" }}>
          {settings.registration.closedMessage}
        </Alert>
      )}
      {/* 🔹 Hero with a living neighbourhood scene */}
      <Box sx={{ position: "relative", overflow: "hidden", minHeight: { xs: 280, md: 340 }, display: "flex", alignItems: "flex-end", color: "#fff", bgcolor: "#0B1A14" }}>
        <Box sx={{ position: "absolute", inset: 0 }}>
          <SceneStage index={3} />
        </Box>
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(8,20,16,.88) 0%, rgba(8,20,16,.55) 55%, rgba(8,20,16,.1) 100%)" }} />
        <Container maxWidth="lg" sx={{ position: "relative", py: { xs: 4, md: 6 } }}>
          <Typography variant="overline" sx={{ color: "#F4A62A" }}>
            Membership application · সদস্যপদের আবেদন
          </Typography>
          <Typography variant="h3" sx={{ fontSize: { xs: 30, md: 44 }, mt: 0.5 }}>
            Join {SITE_NAME}
          </Typography>
          <Typography sx={{ opacity: 0.9, mt: 1, maxWidth: 640 }}>
            Fill in your plot and owner details, then upload your documents and payment proof. Your application PDF arrives by email the moment you submit.
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 2.5 }}>
            {[`bKash: ${BKASH_NUMBER}`, `Bank A/C: ${BANK.accountNumber}`].map(label => (
              <Chip key={label} label={label} sx={{ bgcolor: "rgba(255,255,255,.14)", color: "#fff", border: "1px solid rgba(255,255,255,.3)", backdropFilter: "blur(6px)", fontWeight: 700 }} />
            ))}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Stack spacing={2}>
          <Card>
            <CardContent>{paymentInfo}</CardContent>
          </Card>
          <Alert
            severity="info"
            action={
              <Button component={Link} href="/auth/login" size="small" color="inherit" startIcon={<AccountCircleIcon fontSize="small" />}>
                Login
              </Button>
            }
          >
            Fields marked * are required. Already applied? Sign in to check your status.
          </Alert>
        </Stack>
      </Container>

      {/* 🔹 Main form */}
      <Container maxWidth="lg" sx={{ pt: 2, pb: { xs: 4, md: 6 } }}>
        <Box
          component="form"
          noValidate
          sx={{ position: "relative" }}
          onSubmit={handleSubmit}
        >
          {locked && (
            <Box
              sx={theme => ({
                position: "absolute",
                inset: 0,
                zIndex: 50,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(15,15,15,0.92)"
                    : "rgba(255,255,255,0.92)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: 1.5,
                px: 2,
              })}
            >
              <Typography variant="h5" fontWeight="bold">
                Application Locked
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your submission has been recorded and edits are no longer
                allowed.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Need to make a change? Contact the admin team with your
                application details.
              </Typography>
            </Box>
          )}
          <Stack spacing={3} sx={{ opacity: locked ? 0.4 : 1 }}>
            {/* Plot Information */}
            <Card>
              <CardHeader
                title="Plot Information"
                subheader="Sector, Road, Plot, Size"
                action={
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleGuidelinePreview}
                    disabled={submitting || loadingTemplatePreview}
                  >
                    Show Guideline
                  </Button>
                }
              />
              <CardContent>
                <Row>
                  <Col>
                    <FormControl fullWidth size="small">
                      <InputLabel id="sector-label">Sector number</InputLabel>
                      <Select
                        labelId="sector-label"
                        label="Sector number"
                        value={v.sectorNumber}
                        onChange={e => setField("sectorNumber", e.target.value)}
                        onBlur={() => markTouched("sectorNumber")}
                        error={!!showErr("sectorNumber")}
                      >
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(
                          num => (
                            <MenuItem key={num} value={String(num)}>
                              {num}
                            </MenuItem>
                          )
                        )}
                      </Select>
                      <FormHelperText error={!!showErr("sectorNumber")}>
                        {showErr("sectorNumber")}
                      </FormHelperText>
                    </FormControl>
                  </Col>
                  <Col>
                    <TextField
                      size="small"
                      required
                      label="Road number"
                      value={v.roadNumber}
                      onChange={e => setField("roadNumber", e.target.value)}
                      onBlur={() => markTouched("roadNumber")}
                      error={!!showErr("roadNumber")}
                      helperText={showErr("roadNumber")}
                      fullWidth
                    />
                  </Col>
                  <Col>
                    <TextField
                      size="small"
                      required
                      label="Plot number"
                      value={v.plotNumber}
                      onChange={e => setField("plotNumber", e.target.value)}
                      onBlur={() => markTouched("plotNumber")}
                      error={!!showErr("plotNumber")}
                      helperText={showErr("plotNumber")}
                      fullWidth
                    />
                  </Col>
                  <Col>
                    <TextField
                      size="small"
                      required
                      label="Plot size"
                      type="number"
                      placeholder="e.g., 3 Katha"
                      value={v.plotSize}
                      onChange={e => setField("plotSize", e.target.value)}
                      onBlur={() => markTouched("plotSize")}
                      error={!!showErr("plotSize")}
                      helperText={showErr("plotSize")}
                      fullWidth
                    />
                  </Col>
                </Row>
              </CardContent>
            </Card>

            {/* Ownership Proof */}
            <Card>
              <CardHeader
                title="Ownership Proof"
                subheader="Attach exactly ONE document"
              />
              <CardContent>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  alignItems={{ xs: "stretch", md: "center" }}
                >
                  <FormControl fullWidth size="small">
                    <InputLabel id="proof-type">Document type</InputLabel>
                    <Select
                      labelId="proof-type"
                      label="Document type"
                      value={v.ownershipProofType}
                      onChange={e =>
                        setField(
                          "ownershipProofType",
                          e.target.value as FormState["ownershipProofType"]
                        )
                      }
                      onBlur={() => markTouched("ownershipProofType")}
                    >
                      <MenuItem value="BDS_KHATIAN">BDS Khatian</MenuItem>
                      <MenuItem value="MUTATION_PAPER">
                        Mutation paper (RAJUK/AC land)
                      </MenuItem>{" "}
                    </Select>
                    <FormHelperText>
                      Select the one you will upload
                    </FormHelperText>
                  </FormControl>

                  <FilePicker
                    required
                    label="Upload ownership proof (PDF/JPG/PNG)"
                    file={v.ownershipProofFile}
                    onChange={f => {
                      // setField already marks touched and validates
                      setField("ownershipProofFile", f);
                    }}
                    helper={"Max ~10MB. Clear scan or photo."}
                    errorText={showErr("ownershipProofFile")}
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Owner Info */}
            <Card>
              <CardHeader title="Plot Owner’s Information" />
              <CardContent>
                <Row>
                  <Col>
                    <TextField
                      size="small"
                      required
                      label="Owner's name (English) — As Recorded in the Land Documents"
                      value={v.ownerNameEnglish}
                      onChange={e =>
                        setField("ownerNameEnglish", e.target.value)
                      }
                      onBlur={() => markTouched("ownerNameEnglish")}
                      error={!!showErr("ownerNameEnglish")}
                      helperText={showErr("ownerNameEnglish")}
                      fullWidth
                    />
                  </Col>
                  <Col>
                    <TextField
                      size="small"
                      required
                      label="মালিকের নাম (বাংলা)"
                      value={v.ownerNameBangla}
                      onChange={e =>
                        setField("ownerNameBangla", e.target.value)
                      }
                      onBlur={() => markTouched("ownerNameBangla")}
                      error={!!showErr("ownerNameBangla")}
                      helperText={showErr("ownerNameBangla")}
                      fullWidth
                    />
                  </Col>
                  <Col>
                    <TextField
                      size="small"
                      required
                      label="Contact number"
                      type="number"
                      value={v.contactNumber}
                      onChange={e => setField("contactNumber", e.target.value)}
                      onBlur={() => markTouched("contactNumber")}
                      error={!!showErr("contactNumber")}
                      helperText={showErr("contactNumber")}
                      fullWidth
                    />
                  </Col>
                  <Col>
                    <TextField
                      size="small"
                      required
                      label="NID number"
                      type="number"
                      value={v.nidNumber}
                      onChange={e => setField("nidNumber", e.target.value)}
                      onBlur={() => markTouched("nidNumber")}
                      error={!!showErr("nidNumber")}
                      helperText={showErr("nidNumber")}
                      fullWidth
                    />
                  </Col>
                  <Col>
                    <TextField
                      size="small"
                      required
                      type="email"
                      label="Email address"
                      value={v.email}
                      onChange={e => setField("email", e.target.value)}
                      onBlur={() => markTouched("email")}
                      error={!!showErr("email")}
                      helperText={showErr("email")}
                      fullWidth
                    />
                  </Col>
                  <Col>
                    <TextField
                      size="small"
                      required
                      type="password"
                      label="Password"
                      value={v.password}
                      onChange={e => setField("password", e.target.value)}
                      onBlur={() => markTouched("password")}
                      error={!!showErr("password")}
                      helperText={showErr("password")}
                      fullWidth
                    />
                  </Col>

                  <Col>
                    <TextField
                      size="small"
                      required
                      label="Present address"
                      value={v.presentAddress}
                      onChange={e => setField("presentAddress", e.target.value)}
                      onBlur={() => markTouched("presentAddress")}
                      error={!!showErr("presentAddress")}
                      helperText={showErr("presentAddress")}
                      fullWidth
                    />
                  </Col>
                  <Col>
                    <TextField
                      size="small"
                      required
                      label="Permanent address"
                      value={v.permanentAddress}
                      onChange={e =>
                        setField("permanentAddress", e.target.value)
                      }
                      onBlur={() => markTouched("permanentAddress")}
                      error={!!showErr("permanentAddress")}
                      helperText={showErr("permanentAddress")}
                      fullWidth
                    />
                  </Col>
                  <Col>
                    <FilePicker
                      required
                      label="Upload owner's photo (JPG/PNG/PDF)"
                      accept="image/*,application/pdf"
                      file={v.ownerPhoto}
                      onChange={f => {
                        // setField already marks touched and validates
                        setField("ownerPhoto", f);
                      }}
                      helper={"Clear passport-style photo preferred (≤10MB)."}
                      errorText={showErr("ownerPhoto")}
                    />
                  </Col>
                </Row>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader
                title="Payment"
                subheader="Attach receipt and fill relevant fields"
              />
              <CardContent>
                <Stack spacing={2}>
                  {paymentInfo}

                  <Row>
                    <Col>
                      <FormControl fullWidth size="small">
                        <InputLabel id="pay-method">Payment method</InputLabel>
                        <Select
                          labelId="pay-method"
                          label="Payment method"
                          value={v.paymentMethod}
                          onChange={e =>
                            setField(
                              "paymentMethod",
                              e.target.value as PaymentMethod
                            )
                          }
                          onBlur={() => markTouched("paymentMethod")}
                        >
                          <MenuItem value="BKASH">bKash</MenuItem>
                          <MenuItem value="BANK">
                            Bank deposit/transfer
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Col>
                  </Row>

                  {/* Fee Alert based on payment method */}
                  {v.paymentMethod === "BKASH" && (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      Registration fee: BDT {BKASH_FEE}
                    </Alert>
                  )}
                  {v.paymentMethod === "BANK" && (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      Registration fee: BDT {BANK_FEE}
                    </Alert>
                  )}

                  <Row>
                    {v.paymentMethod === "BKASH" ? (
                      <>
                        <Col>
                          <TextField
                            size="small"
                            required
                            label="bKash transaction ID"
                            value={v.bkashTransactionId}
                            onChange={e =>
                              setField("bkashTransactionId", e.target.value)
                            }
                            onBlur={() => markTouched("bkashTransactionId")}
                            error={!!showErr("bkashTransactionId")}
                            helperText={showErr("bkashTransactionId")}
                            fullWidth
                          />
                        </Col>
                        <Col>
                          <TextField
                            size="small"
                            required
                            label="bKash account number used"
                            type="number"
                            value={v.bkashAccountNumber}
                            onChange={e =>
                              setField("bkashAccountNumber", e.target.value)
                            }
                            onBlur={() => markTouched("bkashAccountNumber")}
                            error={!!showErr("bkashAccountNumber")}
                            helperText={showErr("bkashAccountNumber")}
                            fullWidth
                          />
                        </Col>
                      </>
                    ) : (
                      <Col>
                        <TextField
                          size="small"
                          required
                          label="Bank account number (sender)"
                          value={v.bankAccountNumberFrom}
                          onChange={e =>
                            setField("bankAccountNumberFrom", e.target.value)
                          }
                          onBlur={() => markTouched("bankAccountNumberFrom")}
                          error={!!showErr("bankAccountNumberFrom")}
                          helperText={showErr("bankAccountNumberFrom")}
                          fullWidth
                        />
                      </Col>
                    )}

                    <Col>
                      <FilePicker
                        required={v.paymentMethod === "BANK"}
                        label={
                          v.paymentMethod === "BKASH"
                            ? "Upload bKash receipt/screenshot"
                            : "Upload bank deposit slip/screenshot"
                        }
                        file={v.paymentReceipt}
                        onChange={f => {
                          // setField already marks touched and validates
                          setField("paymentReceipt", f);
                        }}
                        helper={
                          v.paymentMethod === "BANK"
                            ? "PDF/JPG/PNG (≤10MB)"
                            : "Optional for bKash (PDF/JPG/PNG ≤10MB if uploaded)"
                        }
                        errorText={showErr("paymentReceipt")}
                      />
                    </Col>
                  </Row>

                  <Divider />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={v.agreeDataUse}
                        onChange={e =>
                          setField("agreeDataUse", e.target.checked)
                        }
                        onBlur={() => markTouched("agreeDataUse")}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I hereby give my consent and acknowledge that my
                        personal data and documents may be used for the purpose
                        of PNS membership registration.
                      </Typography>
                    }
                  />
                  {showErr("agreeDataUse") && (
                    <FormHelperText error sx={{ ml: 1 }}>
                      {showErr("agreeDataUse")}
                    </FormHelperText>
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
            >
              <Button
                type="submit"
                variant="contained"
                size="medium"
                disabled={submitting || !canSubmit || locked}
                startIcon={<CheckCircleOutlineIcon />}
              >
                {submitting ? "Submitting…" : "Submit Application"}
              </Button>

              {!canSubmit && (
                <Typography variant="body2" color="text.secondary">
                  {`Complete all required fields to submit. (${blocking.length} issues)`}
                </Typography>
              )}
            </Stack>

            {/* Compact live error summary when disabled */}
            {!canSubmit && blocking.length > 0 && (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Please fix the following:
                </Typography>
                <ul style={{ margin: 0, paddingInlineStart: 18 }}>
                  {blocking.slice(0, 5).map(([k, msg]) => (
                    <li key={k}>
                      <Typography variant="body2">
                        <b>{LABELS[k]}:</b> {msg}
                      </Typography>
                    </li>
                  ))}
                </ul>
                {blocking.length > 5 && (
                  <Typography variant="caption" color="text.secondary">
                    +{blocking.length - 5} more…
                  </Typography>
                )}
              </Alert>
            )}
          </Stack>

          <Dialog
            open={showGuidelinePreview}
            onClose={() => setShowGuidelinePreview(false)}
            fullWidth
            maxWidth="md"
          >
            <DialogTitle sx={{ pr: 6 }}>
              Preview Uploaded Guideline
              <IconButton
                onClick={() => setShowGuidelinePreview(false)}
                sx={{ position: "absolute", right: 8, top: 8 }}
                aria-label="Close preview"
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent
              dividers
              sx={{
                height: 640,
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {loadingTemplatePreview && (
                <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
                  <CircularProgress />
                  <Typography>Loading guideline PDF…</Typography>
                </Stack>
              )}
              {templatePreviewError && (
                <Alert severity="error">{templatePreviewError}</Alert>
              )}
              {templatePreviewUrl && (
                <object
                  data={templatePreviewUrl}
                  type="application/pdf"
                  width="100%"
                  height="100%"
                >
                  <Box p={2}>
                    <Typography>
                      PDF preview is not available in this browser. You can
                      open it in a new tab.
                    </Typography>
                    <Button
                      href={templatePreviewUrl}
                      target="_blank"
                      rel="noopener"
                      sx={{ mt: 1 }}
                    >
                      Open PDF in new tab
                    </Button>
                  </Box>
                </object>
              )}
            </DialogContent>
          </Dialog>

          <Snackbar
            open={toast.open}
            autoHideDuration={4000}
            onClose={() => setToast({ ...toast, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={() => setToast({ ...toast, open: false })}
              severity={toast.sev}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {toast.msg}
            </Alert>
          </Snackbar>
        </Box>
      </Container>
      <Backdrop
        open={submitting}
        sx={theme => ({
          color: "#fff",
          zIndex: theme.zIndex.drawer + 1200,
          flexDirection: "column",
        })}
      >
        <Stack spacing={1} alignItems="center">
          <CircularProgress color="inherit" />
          <Typography variant="h6" fontWeight="600">
            Submitting your application…
          </Typography>
          <Typography variant="body2" color="inherit">
            Please wait...
          </Typography>
        </Stack>
      </Backdrop>
    </>
  );
}
