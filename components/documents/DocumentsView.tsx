"use client";

import { useState } from "react";
import dayjs from "dayjs";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfRounded from "@mui/icons-material/PictureAsPdfRounded";
import ImageRounded from "@mui/icons-material/ImageRounded";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import LockRounded from "@mui/icons-material/LockRounded";
import PublicShell, { PublicPageTitle, type PublicChrome } from "@/components/PublicShell";
import type { SiteDocumentDto } from "@/types/api";

/** In-page viewer for a document (PDF or image) served by the access-checked file route. */
export function DocumentPreviewDialog({ doc, onClose }: { doc: SiteDocumentDto | null; onClose: () => void }) {
  return (
    <Dialog open={Boolean(doc)} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ pr: 12 }} noWrap>
        {doc?.title}
        <Stack direction="row" sx={{ position: "absolute", right: 8, top: 8 }}>
          {doc && (
            <IconButton component="a" href={doc.viewUrl} target="_blank" rel="noopener" aria-label="Open in new tab">
              <OpenInNewRounded />
            </IconButton>
          )}
          <IconButton onClick={onClose} aria-label="Close">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, height: "82vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "action.hover" }}>
        {doc &&
          (doc.isPdf ? (
            <object data={doc.viewUrl} type="application/pdf" width="100%" height="100%">
              <Box p={3} textAlign="center">
                <Typography gutterBottom>This browser can&apos;t show PDFs here.</Typography>
                <Button href={doc.viewUrl} target="_blank" rel="noopener" variant="contained">
                  Open the PDF
                </Button>
              </Box>
            </object>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={doc.viewUrl} alt={doc.title} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          ))}
      </DialogContent>
    </Dialog>
  );
}

/** Public /documents page: public documents, plus members-only ones for logged-in members. */
export default function DocumentsView({ documents, isMember, ...chrome }: PublicChrome & { documents: SiteDocumentDto[]; isMember: boolean }) {
  const theme = useTheme();
  const [open, setOpen] = useState<SiteDocumentDto | null>(null);
  return (
    <PublicShell {...chrome}>
      <PublicPageTitle
        eyebrow="Documents"
        title="Society documents"
        intro={
          isMember
            ? "The constitution, certificates and other official documents. Members-only documents are shown because you are logged in."
            : "The constitution, certificates and other official documents. Members see more after logging in."
        }
      />
      <Container maxWidth="lg">
        {documents.length === 0 ? (
          <Alert severity="info">No documents have been published yet.</Alert>
        ) : (
          <Stack spacing={1.5}>
            {documents.map(d => (
              <Card key={d.id} sx={{ p: { xs: 1.75, sm: 2.25 } }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      flexShrink: 0,
                      borderRadius: 3,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: alpha(d.isPdf ? theme.palette.error.main : theme.palette.primary.main, 0.1),
                      color: d.isPdf ? "error.main" : "primary.main",
                    }}
                  >
                    {d.isPdf ? <PictureAsPdfRounded /> : <ImageRounded />}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography sx={{ fontWeight: 800, fontSize: 17 }}>{d.title}</Typography>
                      {d.audience === "MEMBERS" && (
                        <Chip size="small" icon={<LockRounded sx={{ fontSize: 14 }} />} label="Members only" color="secondary" variant="outlined" />
                      )}
                    </Stack>
                    {d.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                        {d.description}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Added {dayjs(d.createdAt).format("D MMM YYYY")}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" startIcon={<VisibilityRounded />} onClick={() => setOpen(d)}>
                      View
                    </Button>
                    <Button variant="outlined" href={d.viewUrl} target="_blank" rel="noopener" endIcon={<OpenInNewRounded />}>
                      Open
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
      <DocumentPreviewDialog doc={open} onClose={() => setOpen(null)} />
    </PublicShell>
  );
}
