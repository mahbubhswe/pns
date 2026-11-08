"use client";

import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import {
  Alert,
  Avatar,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Link as MLink,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import type { HomeSection, SiteSettings } from "@/lib/shared/settings";
import { SceneStage } from "@/components/AuthShell";
import { apiGet, apiPost, apiPostForm, errorMessage, isApiClientError } from "@/lib/api";
import type { ProfileResponse, UploadResponse } from "@/types/api";

// `statusCode` is the DB enum (APPROVED | PENDING | REJECTED)
const STATUS_LABEL: Record<string, string> = { APPROVED: "Approved", PENDING: "Pending review", REJECTED: "Not approved" };

export default function Profile({ site, sections }: { site?: SiteSettings["site"]; sections?: HomeSection[] } = {}) {
  const { data, error, isLoading, mutate } = useSWR<ProfileResponse>("/api/profile", apiGet);
  async function onLogout() {
    try {
      await apiPost("/api/auth/logout");
    } catch {}
    if (typeof window !== "undefined") window.location.assign("/auth/login");
  }

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );

  if (error) {
    const msg = errorMessage(error, "Error");
    const unauth = isApiClientError(error) && error.status === 401;
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {unauth
              ? "Please login to view your profile."
              : "Failed to load profile."}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {msg}
          </Typography>
          {unauth && (
            <Typography variant="body2">
              Go to <Link href="/auth/login">Login</Link>
            </Typography>
          )}
        </Alert>
      </Container>
    );
  }

  const p = data?.profile;
  if (!p)
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="info">No profile data found.</Alert>
      </Container>
    );

  return (
    <>
      <PublicHeader site={site} sections={sections} />
      {/* Hero with a living neighbourhood scene */}
      <Box sx={{ position: "relative", overflow: "hidden", minHeight: { xs: 240, md: 300 }, display: "flex", alignItems: "flex-end", color: "#fff", bgcolor: "#0B1A14" }}>
        <Box sx={{ position: "absolute", inset: 0 }}>
          <SceneStage index={7} />
        </Box>
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(8,20,16,.85) 0%, rgba(8,20,16,.45) 60%, rgba(8,20,16,.1) 100%)" }} />
        <Container maxWidth="lg" sx={{ position: "relative", py: { xs: 4, md: 5 } }}>
          <Typography variant="overline" sx={{ color: "#F4A62A" }}>
            Member profile
          </Typography>
          <Typography variant="h3" sx={{ fontSize: { xs: 28, md: 40 } }}>
            Hello, {String(p.ownerNameEnglish || "neighbour").split(" ")[0]}
          </Typography>
          <Typography sx={{ opacity: 0.9, mt: 0.5 }}>Update your photo and review your registration details below.</Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: 2, pb: { xs: 4, md: 6 } }}>
        <Stack spacing={3}>
          <Card>
          <CardHeader
            avatar={
              p.ownerPhoto ? (
                <Avatar src={p.ownerPhoto} sx={{ width: 56, height: 56 }} />
              ) : (
                <Avatar sx={{ width: 56, height: 56 }}>
                  {p.ownerNameEnglish?.[0]?.toUpperCase() ||
                    p.email?.[0]?.toUpperCase()}
                </Avatar>
              )
            }
            title={p.ownerNameEnglish || "Your Profile"}
            subheader={p.email}
            action={
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                useFlexGap
                sx={{
                  alignItems: { xs: "stretch", sm: "center" },
                  flexWrap: { xs: "nowrap", sm: "wrap" },
                  minWidth: 0,
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                <Chip
                  size="small"
                  label={STATUS_LABEL[p.statusCode] || p.statusCode}
                  color={p.statusCode === "APPROVED" ? "success" : p.statusCode === "REJECTED" ? "default" : "warning"}
                />
                <ChangePhoto mutate={mutate} />
                <Button size="small" variant="outlined" onClick={onLogout}>
                  Logout
                </Button>
              </Stack>
            }
          />
          <CardContent>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Section title="Plot Information">
                  <KV label="Sector" value={p.sectorNumber} />
                  <KV label="Road" value={p.roadNumber} />
                  <KV label="Plot" value={p.plotNumber} />
                  <KV label="Size" value={p.plotSize} />
                </Section>
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Section title="Ownership Proof">
                  <KV label="Type" value={p.ownershipProofType} />
                  <KV
                    label="Document"
                    value={
                      p.ownershipProofFile ? (
                        <MLink
                          component={Link}
                          href={p.ownershipProofFile}
                          target="_blank"
                        >
                          View file
                        </MLink>
                      ) : (
                        "—"
                      )
                    }
                  />
                </Section>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Section title="Owner Information">
                  <KV label="Name (English)" value={p.ownerNameEnglish} />
                  <KV label="Name (Bangla)" value={p.ownerNameBangla} />
                  <KV label="Contact" value={p.contactNumber} />
                  <KV label="NID" value={p.nidNumber} />
                  <KV label="Present Address" value={p.presentAddress} />
                  <KV label="Permanent Address" value={p.permanentAddress} />
                </Section>
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Section title="Payment">
                  <KV label="Method" value={p.paymentMethod} />
                  {p.paymentMethod === "BKASH" ? (
                    <>
                      <KV
                        label="bKash Txn ID"
                        value={p.bkashTransactionId || "—"}
                      />
                      <KV
                        label="bKash Account"
                        value={p.bkashAccountNumber || "—"}
                      />
                    </>
                  ) : (
                    <KV
                      label="Bank Account (Sender)"
                      value={p.bankAccountNumberFrom || "—"}
                    />
                  )}
                  <KV
                    label="Receipt"
                    value={
                      p.paymentReceipt ? (
                        <MLink
                          component={Link}
                          href={p.paymentReceipt}
                          target="_blank"
                        >
                          View receipt
                        </MLink>
                      ) : (
                        "—"
                      )
                    }
                  />
                  <KV label="Fee" value={`BDT ${p.membershipFee}`} />
                </Section>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Section title="Meta">
                  <KV
                    label="Agree to Data Use"
                    value={p.agreeDataUse ? "Yes" : "No"}
                  />
                  <KV
                    label="Created"
                    value={new Date(p.createdAt).toLocaleString()}
                  />
                  <KV
                    label="Updated"
                    value={new Date(p.updatedAt).toLocaleString()}
                  />
                </Section>
              </Box>
            </Stack>
          </CardContent>
        </Card>
        </Stack>
      </Container>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>
      <Stack spacing={0.5}>{children}</Stack>
    </Box>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={1}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value ?? "—"}</Typography>
    </Stack>
  );
}

function ChangePhoto({ mutate }: { mutate: () => void }) {
  const [open, setOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragging = useRef(false);
  const last = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setImgSrc(url);
    setOpen(true);
  }

  useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function draw() {
      if (!img || !canvas || !ctx) return;
      const size = canvas.width; // square canvas
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = "#eee";
      ctx.fillRect(0, 0, size, size);

      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      if (!iw || !ih) return;

      // Fit image to cover canvas at scale
      const base = Math.max(size / iw, size / ih);
      const s = base * scale;
      const drawW = iw * s;
      const drawH = ih * s;
      const dx = (size - drawW) / 2 + offset.x;
      const dy = (size - drawH) / 2 + offset.y;
      ctx.drawImage(img, dx, dy, drawW, drawH);
    }

    let raf: number;
    function loop() {
      draw();
      raf = requestAnimationFrame(loop);
    }
    loop();
    return () => cancelAnimationFrame(raf);
  }, [scale, offset, imgSrc]);

  function onMouseDown(ev: React.MouseEvent<HTMLCanvasElement>) {
    dragging.current = true;
    last.current = { x: ev.clientX, y: ev.clientY };
  }
  function onMouseMove(ev: React.MouseEvent<HTMLCanvasElement>) {
    if (!dragging.current) return;
    const dx = ev.clientX - last.current.x;
    const dy = ev.clientY - last.current.y;
    last.current = { x: ev.clientX, y: ev.clientY };
    setOffset(o => ({ x: o.x + dx, y: o.y + dy }));
  }
  function onMouseUp() {
    dragging.current = false;
  }
  function onLeave() {
    dragging.current = false;
  }

  async function onSave() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    await new Promise<void>(resolve => setTimeout(() => resolve(), 0));
    canvas.toBlob(async blob => {
      if (!blob) return;
      const fd = new FormData();
      fd.append("photo", blob, "avatar.jpg");
      try {
        await apiPostForm<UploadResponse>("/api/profile/photo", fd);
      } catch (err) {
        window.alert(errorMessage(err, "Could not upload the photo"));
        return;
      }
      setOpen(false);
      setImgSrc(null);
      setScale(1);
      setOffset({ x: 0, y: 0 });
      mutate();
    }, "image/jpeg", 0.9);
  }

  return (
    <>
      <input id="pick-photo" type="file" accept="image/*" hidden onChange={onPick} />
      <Button size="small" variant="outlined" onClick={() => document.getElementById("pick-photo")?.click()}>
        Change Photo
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Crop profile photo</DialogTitle>
        <DialogContent>
          {!imgSrc ? (
            <Alert severity="info">Select an image to crop.</Alert>
          ) : (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={300}
                  style={{
                    width: "100%",
                    maxWidth: 300,
                    background: "#f3f3f3",
                    cursor: "grab",
                    borderRadius: 8,
                  }}
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseLeave={onLeave}
                />
              </Box>
              {/* Hidden img used for drawing */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc}
                ref={imgRef}
                style={{ display: "none" }}
                alt="to-crop"
                onLoad={() => {
                  // reset position when a new image loads
                  setScale(1);
                  setOffset({ x: 0, y: 0 });
                }}
              />

              <Box sx={{ px: 1, py: 1 }}>
                <Typography variant="body2" gutterBottom>
                  Zoom
                </Typography>
                <Slider
                  size="small"
                  value={scale}
                  min={1}
                  max={3}
                  step={0.01}
                  onChange={(_, v) => setScale(v as number)}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={onSave} variant="contained" disabled={!imgSrc}>
            Crop & Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
