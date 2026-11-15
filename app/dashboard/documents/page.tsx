"use client";

import React, { useRef, useState } from "react";
import useSWR from "swr";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import UploadFileRounded from "@mui/icons-material/UploadFileRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import PictureAsPdfRounded from "@mui/icons-material/PictureAsPdfRounded";
import ImageRounded from "@mui/icons-material/ImageRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import PageGate from "@/components/dashboard/PageGate";
import { PageHeader } from "@/components/dashboard/ui";
import PostAudienceField from "@/components/dashboard/PostAudienceField";
import { DocumentPreviewDialog } from "@/components/documents/DocumentsView";
import { apiDelete, apiPatch, apiPostForm, errorMessage, getJSON } from "@/lib/api";
import { POST_AUDIENCE_LABELS, type PostAudience } from "@/lib/shared/posts";
import type { DocumentsListResponse, SiteDocumentDto } from "@/types/api";

type Draft = { id?: number; title: string; description: string; audience: PostAudience; sortOrder: number };

function DocumentForm({ draft, onClose, onSaved }: { draft: Draft; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Draft>(draft);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const isNew = !form.id;

  async function save() {
    try {
      setBusy(true);
      if (isNew) {
        if (!file) return;
        const fd = new FormData();
        fd.append("file", file);
        fd.append("title", form.title);
        fd.append("description", form.description);
        fd.append("audience", form.audience);
        fd.append("sortOrder", String(form.sortOrder));
        await apiPostForm("/api/admin/documents", fd);
      } else {
        await apiPatch(`/api/admin/documents/${form.id}`, {
          title: form.title,
          description: form.description,
          audience: form.audience,
          sortOrder: form.sortOrder,
        });
      }
      onSaved();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Couldn't save", text: errorMessage(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isNew ? "Upload a document" : "Edit document"}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {isNew && (
            <Box>
              <input
                ref={fileRef}
                type="file"
                hidden
                accept="application/pdf,image/*"
                onChange={e => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                  if (f && !form.title) setForm(d => ({ ...d, title: f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ") }));
                  e.currentTarget.value = "";
                }}
              />
              <Button variant="outlined" fullWidth startIcon={<UploadFileRounded />} onClick={() => fileRef.current?.click()} sx={{ justifyContent: "flex-start" }}>
                {file ? file.name : "Choose a PDF or image (max 20 MB)"}
              </Button>
            </Box>
          )}
          <TextField label="Title" placeholder="e.g. PNS Constitution 2024" value={form.title} onChange={e => setForm(d => ({ ...d, title: e.target.value }))} required fullWidth />
          <TextField
            label="Description (optional)"
            value={form.description}
            onChange={e => setForm(d => ({ ...d, description: e.target.value }))}
            fullWidth
            multiline
            minRows={2}
          />
          <PostAudienceField kind="document" value={form.audience} onChange={a => setForm(d => ({ ...d, audience: a }))} />
          <TextField
            label="Display order"
            type="number"
            value={form.sortOrder}
            onChange={e => setForm(d => ({ ...d, sortOrder: Math.max(0, Number(e.target.value) || 0) }))}
            sx={{ width: 160 }}
            helperText="Lower shows first"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" onClick={save} disabled={busy || !form.title.trim() || (isNew && !file)}>
          {busy ? "Saving…" : isNew ? "Upload" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function DocumentsAdminPage() {
  const { data, isLoading, mutate } = useSWR<DocumentsListResponse>("/api/admin/documents", getJSON);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [viewing, setViewing] = useState<SiteDocumentDto | null>(null);
  const docs = data?.documents || [];

  async function remove(d: SiteDocumentDto) {
    const ok = await Swal.fire({ title: `Delete "${d.title}"?`, icon: "warning", showCancelButton: true, confirmButtonText: "Delete", confirmButtonColor: "#D23B3B" });
    if (!ok.isConfirmed) return;
    try {
      await apiDelete(`/api/admin/documents/${d.id}`);
      await mutate();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Couldn't delete", text: errorMessage(e) });
    }
  }

  return (
    <PageGate title="Documents" permission="documents.manage">
      <PageHeader
        eyebrow="Community"
        title="Documents"
        subtitle="Constitution, certificates and other society documents. Choose who can see each one."
        actions={
          <Stack direction="row" spacing={1}>
            <Button href="/documents" target="_blank" endIcon={<OpenInNewRounded />}>
              View page
            </Button>
            <Button
              variant="contained"
              startIcon={<UploadFileRounded />}
              onClick={() => setEditing({ title: "", description: "", audience: "PUBLIC", sortOrder: (docs.at(-1)?.sortOrder ?? 0) + 1 })}
            >
              Upload document
            </Button>
          </Stack>
        }
      />
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : docs.length === 0 ? (
        <Alert severity="info">No documents yet. Upload the PNS Constitution, registration certificate and others.</Alert>
      ) : (
        <Stack spacing={1.25}>
          {docs.map(d => (
            <Card key={d.id} sx={{ p: 1.75, display: "flex", gap: 2, alignItems: "center" }}>
              <Box sx={{ color: d.isPdf ? "error.main" : "primary.main", display: "grid", placeItems: "center" }}>{d.isPdf ? <PictureAsPdfRounded /> : <ImageRounded />}</Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography sx={{ fontWeight: 750 }}>{d.title}</Typography>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={POST_AUDIENCE_LABELS[d.audience].label}
                    color={d.audience === "PUBLIC" ? "primary" : d.audience === "MEMBERS" ? "secondary" : "default"}
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  #{d.sortOrder} · {d.fileName} · {dayjs(d.createdAt).format("D MMM YYYY")}
                </Typography>
              </Box>
              <Tooltip title="Preview">
                <IconButton onClick={() => setViewing(d)}>
                  <VisibilityRounded />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton onClick={() => setEditing({ id: d.id, title: d.title, description: d.description || "", audience: d.audience, sortOrder: d.sortOrder })}>
                  <EditRounded />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton color="error" onClick={() => remove(d)}>
                  <DeleteOutlineRounded />
                </IconButton>
              </Tooltip>
            </Card>
          ))}
        </Stack>
      )}
      {editing && (
        <DocumentForm
          draft={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await mutate();
          }}
        />
      )}
      <DocumentPreviewDialog doc={viewing} onClose={() => setViewing(null)} />
    </PageGate>
  );
}
