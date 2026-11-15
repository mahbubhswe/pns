"use client";

import React, { useRef, useState } from "react";
import useSWR from "swr";
import Swal from "sweetalert2";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import PhotoCameraRounded from "@mui/icons-material/PhotoCameraRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import PageGate from "@/components/dashboard/PageGate";
import { PageHeader } from "@/components/dashboard/ui";
import { apiDelete, apiPatch, apiPost, apiPostForm, errorMessage, getJSON } from "@/lib/api";
import { initials } from "@/lib/format";
import type { CommitteeListResponse, CommitteeMemberDto, UploadResponse } from "@/types/api";

type Draft = Omit<CommitteeMemberDto, "id"> & { id?: number };
const EMPTY: Draft = { name: "", position: "", bio: "", photoUrl: null, phone: "", email: "", sortOrder: 0, isActive: true };

function CommitteeForm({ draft, onClose, onSaved }: { draft: Draft; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Draft>(draft);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const set = <K extends keyof Draft>(k: K, val: Draft[K]) => setForm(f => ({ ...f, [k]: val }));

  async function uploadPhoto(file: File) {
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      const { url } = await apiPostForm<UploadResponse>("/api/admin/upload", fd);
      set("photoUrl", url);
    } catch (e) {
      Swal.fire({ icon: "error", title: "Photo upload failed", text: errorMessage(e) });
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    try {
      setBusy(true);
      const { id, ...body } = form;
      if (id) await apiPatch(`/api/admin/committee/${id}`, body);
      else await apiPost("/api/admin/committee", body);
      onSaved();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Couldn't save", text: errorMessage(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{form.id ? "Edit committee member" : "Add committee member"}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={form.photoUrl || undefined} variant="rounded" sx={{ width: 96, height: 104, borderRadius: 3, fontSize: 30 }}>
              {initials(form.name)}
            </Avatar>
            <Stack spacing={1}>
              <input
                ref={fileRef}
                type="file"
                hidden
                accept="image/*"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) uploadPhoto(f);
                  e.currentTarget.value = "";
                }}
              />
              <Button variant="outlined" startIcon={uploading ? <CircularProgress size={16} /> : <PhotoCameraRounded />} disabled={uploading} onClick={() => fileRef.current?.click()}>
                {form.photoUrl ? "Change photo" : "Upload photo"}
              </Button>
              {form.photoUrl && (
                <Button size="small" color="inherit" onClick={() => set("photoUrl", null)}>
                  Remove photo
                </Button>
              )}
              <Typography variant="caption" color="text.secondary">
                Portrait photo, JPG or PNG up to 10 MB.
              </Typography>
            </Stack>
          </Stack>
          <TextField label="Name" value={form.name} onChange={e => set("name", e.target.value)} required fullWidth />
          <TextField label="Position" placeholder="e.g. President, General Secretary" value={form.position} onChange={e => set("position", e.target.value)} required fullWidth />
          <TextField
            label="Short description"
            placeholder="A few lines about this member"
            value={form.bio || ""}
            onChange={e => set("bio", e.target.value)}
            fullWidth
            multiline
            minRows={3}
            inputProps={{ maxLength: 1000 }}
            helperText={`${(form.bio || "").length}/1000`}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField label="Phone (optional)" value={form.phone || ""} onChange={e => set("phone", e.target.value)} fullWidth />
            <TextField label="Email (optional)" value={form.email || ""} onChange={e => set("email", e.target.value)} fullWidth />
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Display order"
              type="number"
              value={form.sortOrder}
              onChange={e => set("sortOrder", Math.max(0, Number(e.target.value) || 0))}
              sx={{ width: 160 }}
              helperText="Lower shows first"
            />
            <FormControlLabel control={<Switch checked={form.isActive} onChange={e => set("isActive", e.target.checked)} />} label="Show on website" />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" onClick={save} disabled={busy || uploading || !form.name.trim() || !form.position.trim()}>
          {busy ? "Saving…" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function CommitteeAdminPage() {
  const { data, isLoading, mutate } = useSWR<CommitteeListResponse>("/api/admin/committee", getJSON);
  const [editing, setEditing] = useState<Draft | null>(null);
  const members = data?.members || [];

  async function remove(m: CommitteeMemberDto) {
    const ok = await Swal.fire({
      title: `Remove ${m.name}?`,
      text: "To keep them but hide them from the website, edit and turn off \"Show on website\" instead.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Remove",
      confirmButtonColor: "#D23B3B",
    });
    if (!ok.isConfirmed) return;
    try {
      await apiDelete(`/api/admin/committee/${m.id}`);
      await mutate();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Couldn't remove", text: errorMessage(e) });
    }
  }

  return (
    <PageGate title="Committee" permission="committee.manage">
      <PageHeader
        eyebrow="Community"
        title="Executive committee"
        subtitle="Photo, position and a short description of each EC member, shown on the public Committee page."
        actions={
          <Stack direction="row" spacing={1}>
            <Button href="/committee" target="_blank" endIcon={<OpenInNewRounded />}>
              View page
            </Button>
            <Button variant="contained" startIcon={<AddRounded />} onClick={() => setEditing({ ...EMPTY, sortOrder: (members.at(-1)?.sortOrder ?? 0) + 1 })}>
              Add member
            </Button>
          </Stack>
        }
      />
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : members.length === 0 ? (
        <Alert severity="info">No committee members yet. Click “Add member” to start.</Alert>
      ) : (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" } }}>
          {members.map(m => (
            <Card key={m.id} sx={{ p: 2, display: "flex", gap: 2, opacity: m.isActive ? 1 : 0.6 }}>
              <Avatar src={m.photoUrl || undefined} variant="rounded" sx={{ width: 72, height: 80, borderRadius: 2.5 }}>
                {initials(m.name)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="secondary.main" sx={{ fontWeight: 800 }}>
                  #{m.sortOrder} · {m.position}
                </Typography>
                <Typography sx={{ fontWeight: 800 }} noWrap>
                  {m.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {m.bio || "No description yet."}
                </Typography>
                {!m.isActive && <Chip size="small" label="Hidden" sx={{ mt: 0.5 }} />}
              </Box>
              <Stack>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => setEditing(m)}>
                    <EditRounded fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remove">
                  <IconButton size="small" color="error" onClick={() => remove(m)}>
                    <DeleteOutlineRounded fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Card>
          ))}
        </Box>
      )}
      {editing && (
        <CommitteeForm
          draft={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await mutate();
          }}
        />
      )}
    </PageGate>
  );
}
