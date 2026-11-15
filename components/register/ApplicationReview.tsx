"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditRounded from "@mui/icons-material/EditRounded";
import SendRounded from "@mui/icons-material/SendRounded";
import PictureAsPdfRounded from "@mui/icons-material/PictureAsPdfRounded";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";

export type ReviewSection = { title: string; rows: Array<[label: string, value: React.ReactNode]> };
export type ReviewFile = { label: string; file: File | null };

const isPdf = (f: File) => f.type === "application/pdf";
const isImage = (f: File) => f.type.startsWith("image/");

/** Object URL for a local file, revoked when the file changes or the component unmounts. */
function useObjectUrl(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return url;
}

/** Full-size preview of a local image or PDF. */
export function FilePreviewDialog({ file, url, open, onClose }: { file: File | null; url: string | null; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pr: 6 }} noWrap>
        {file?.name || "Preview"}
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }} aria-label="Close preview">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, height: "80vh", display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "action.hover" }}>
        {file && url && isPdf(file) ? (
          <object data={url} type="application/pdf" width="100%" height="100%">
            <Box p={2}>
              <Typography>This browser can&apos;t show PDFs here.</Typography>
              <Button href={url} target="_blank" rel="noopener" sx={{ mt: 1 }}>
                Open PDF in a new tab
              </Button>
            </Box>
          </object>
        ) : file && url && isImage(file) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={file.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        ) : (
          <Typography p={2}>No preview available for this file.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Thumbnail card for one uploaded file; click to preview. */
export function FileThumb({ label, file }: ReviewFile) {
  const url = useObjectUrl(file);
  const [open, setOpen] = useState(false);
  return (
    <Card variant="outlined" sx={{ p: 1.25, display: "flex", gap: 1.25, alignItems: "center", minWidth: 0 }}>
      <Box
        sx={{ width: 56, height: 56, flexShrink: 0, borderRadius: 1.5, overflow: "hidden", bgcolor: "action.hover", display: "grid", placeItems: "center", color: "error.main" }}
      >
        {file && url && isImage(file) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : file ? (
          <PictureAsPdfRounded />
        ) : null}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap component="div">
          {file ? file.name : "Not uploaded"}
        </Typography>
      </Box>
      {file && url && (
        <Button size="small" startIcon={<VisibilityRounded />} onClick={() => setOpen(true)}>
          Preview
        </Button>
      )}
      <FilePreviewDialog file={file} url={url} open={open} onClose={() => setOpen(false)} />
    </Card>
  );
}

/** "Check your application" step shown before the final submit. */
export default function ApplicationReview({
  open,
  sections,
  files,
  submitting,
  onEdit,
  onConfirm,
}: {
  open: boolean;
  sections: ReviewSection[];
  files: ReviewFile[];
  submitting: boolean;
  onEdit: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onClose={submitting ? undefined : onEdit} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle sx={{ pr: 6 }}>
        Review your application
        <Typography variant="body2" color="text.secondary">
          Please check everything carefully. Use “Edit” to go back and correct anything.
        </Typography>
        <IconButton onClick={onEdit} disabled={submitting} sx={{ position: "absolute", right: 8, top: 8 }} aria-label="Close review">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          {sections.map(s => (
            <Box key={s.title}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                {s.title}
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "220px 1fr" }, columnGap: 2, rowGap: 0.75 }}>
                {s.rows.map(([label, value]) => (
                  <React.Fragment key={label}>
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: "break-word", mb: { xs: 1, sm: 0 } }}>
                      {value || "—"}
                    </Typography>
                  </React.Fragment>
                ))}
              </Box>
            </Box>
          ))}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
              Uploaded documents
            </Typography>
            <Box sx={{ display: "grid", gap: 1.25, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              {files.map(f => (
                <FileThumb key={f.label} {...f} />
              ))}
            </Box>
          </Box>
          <Alert severity="info">After you submit, you&apos;ll get a reference number. Keep it for any query about your application.</Alert>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onEdit} disabled={submitting} startIcon={<EditRounded />}>
          Edit
        </Button>
        <Button variant="contained" onClick={onConfirm} disabled={submitting} startIcon={<SendRounded />}>
          {submitting ? "Submitting…" : "Confirm & submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
