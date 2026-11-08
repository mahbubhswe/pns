"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import AddRounded from "@mui/icons-material/AddRounded";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import LockRounded from "@mui/icons-material/LockRounded";
import GroupRounded from "@mui/icons-material/GroupRounded";
import SaveRounded from "@mui/icons-material/SaveRounded";
import Swal from "sweetalert2";
import PageGate from "@/components/dashboard/PageGate";
import { PageHeader } from "@/components/dashboard/ui";
import { apiDelete, apiPatch, apiPost, errorMessage, getJSON } from "@/lib/api";
import { ALL_ACCESS, PERMISSION_GROUPS, PERMISSIONS } from "@/lib/shared/permissions";
import type { RoleDto as Role, RoleMutationResponse, RolesListResponse } from "@/types/api";

type Draft = { id: number | null; name: string; description: string; permissions: string[]; isSystem: boolean };

const blank: Draft = { id: null, name: "", description: "", permissions: ["dashboard.view"], isSystem: false };

const toDraft = (r: Role): Draft => ({ id: r.id, name: r.name, description: r.description || "", permissions: r.permissions, isSystem: r.isSystem });

export default function RolesPage() {
  const theme = useTheme();
  const { data, mutate } = useSWR<RolesListResponse>("/api/admin/roles", getJSON);
  const roles = useMemo(() => data?.roles || [], [data]);
  // The first role is selected until the user picks one; unsaved edits live in `edits`.
  const [picked, setPicked] = useState<number | "new" | null>(null);
  const [edits, setEdits] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const selected = picked ?? roles[0]?.id ?? null;
  const selectedRole = selected === "new" ? undefined : roles.find(r => r.id === selected);
  const draft: Draft = edits ?? (selectedRole ? toDraft(selectedRole) : blank);
  const setDraft = (fn: (d: Draft) => Draft) => setEdits(fn(draft));
  const setSelected = (id: number | "new" | null) => {
    setPicked(id);
    setEdits(null);
  };

  const full = draft.permissions.includes(ALL_ACCESS);
  const locked = draft.isSystem && draft.name === "Super Admin";
  const current = roles.find(r => r.id === draft.id);
  const dirty =
    selected === "new" ||
    (current &&
      (current.name !== draft.name ||
        (current.description || "") !== draft.description ||
        [...current.permissions].sort().join() !== [...draft.permissions].sort().join()));

  const toggle = (key: string) =>
    setDraft(d => ({ ...d, permissions: d.permissions.includes(key) ? d.permissions.filter(p => p !== key) : [...d.permissions, key] }));

  const toggleGroup = (keys: string[], on: boolean) =>
    setDraft(d => ({ ...d, permissions: on ? Array.from(new Set([...d.permissions, ...keys])) : d.permissions.filter(p => !keys.includes(p)) }));

  const save = async () => {
    setSaving(true);
    try {
      const body = { name: draft.name, description: draft.description, permissions: draft.permissions };
      if (draft.id) {
        await apiPatch<RoleMutationResponse>(`/api/admin/roles/${draft.id}`, body);
        await mutate();
        setEdits(null);
      } else {
        const res = await apiPost<RoleMutationResponse>("/api/admin/roles", body);
        await mutate();
        setSelected(res.role.id);
      }
      Swal.fire({ icon: "success", title: "Role saved", timer: 1100, showConfirmButton: false });
    } catch (e) {
      Swal.fire({ icon: "error", title: "Couldn't save role", text: errorMessage(e) });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!draft.id) return;
    const ok = await Swal.fire({ title: `Delete "${draft.name}"?`, icon: "warning", showCancelButton: true, confirmButtonText: "Delete", confirmButtonColor: "#D23B3B" });
    if (!ok.isConfirmed) return;
    try {
      await apiDelete(`/api/admin/roles/${draft.id}`);
      setSelected(null);
      await mutate();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Couldn't delete", text: errorMessage(e) });
    }
  };

  const startNew = (from?: Draft) => {
    setPicked("new");
    setEdits(from ? { ...from, id: null, isSystem: false, name: `${from.name} (copy)` } : blank);
  };

  return (
    <PageGate title="Roles & permissions" permission="roles.manage">
      <PageHeader
        eyebrow="Administration"
        title="Roles & permissions"
        subtitle="A role is a set of permissions. Give each person the smallest role that lets them do their job — it keeps member data and money safe."
        crumbs={[{ label: "Staff users", href: "/dashboard/users" }, { label: "Roles & permissions" }]}
        actions={
          <Button variant="contained" startIcon={<AddRounded />} onClick={() => startNew()}>
            New role
          </Button>
        }
      />

      <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", lg: "340px 1fr" }, alignItems: "start" }}>
        <Stack spacing={1.25}>
          {roles.map(r => {
            const active = selected === r.id;
            return (
              <Card
                key={r.id}
                onClick={() => setSelected(r.id)}
                sx={{
                  p: 2,
                  cursor: "pointer",
                  borderColor: active ? "primary.main" : undefined,
                  boxShadow: active ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}` : undefined,
                  transition: "all .15s ease",
                  "&:hover": { borderColor: "primary.main" },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography sx={{ fontWeight: 750, flex: 1 }}>{r.name}</Typography>
                  {r.isSystem && <Chip size="small" icon={<LockRounded />} label="Built-in" variant="outlined" />}
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, minHeight: 20 }}>
                  {r.description || "No description"}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
                  <Chip size="small" icon={<GroupRounded />} label={`${r.userCount} ${r.userCount === 1 ? "person" : "people"}`} />
                  <Chip
                    size="small"
                    color={r.permissions.includes(ALL_ACCESS) ? "primary" : "default"}
                    label={r.permissions.includes(ALL_ACCESS) ? "Full access" : `${r.permissions.length} of ${PERMISSIONS.length} permissions`}
                  />
                </Stack>
              </Card>
            );
          })}
          {selected === "new" && (
            <Card sx={{ p: 2, borderColor: "primary.main", borderStyle: "dashed" }}>
              <Typography sx={{ fontWeight: 750 }}>{draft.name || "New role"}</Typography>
              <Typography variant="body2" color="text.secondary">
                Not saved yet
              </Typography>
            </Card>
          )}
        </Stack>

        <Card sx={{ p: { xs: 2, md: 3 } }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              label="Role name"
              size="small"
              value={draft.name}
              onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
              disabled={draft.isSystem}
              helperText={draft.isSystem ? "Built-in roles keep their name" : " "}
              sx={{ flex: 1 }}
            />
            <TextField
              label="What is this role for?"
              size="small"
              value={draft.description}
              onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
              helperText=" "
              sx={{ flex: 2 }}
            />
          </Stack>

          <Box sx={{ p: 2, borderRadius: 3, mb: 2.5, bgcolor: alpha(theme.palette.warning.main, full ? 0.12 : 0.05), border: `1px solid ${alpha(theme.palette.warning.main, 0.35)}` }}>
            <FormControlLabel
              control={
                <Switch
                  color="warning"
                  checked={full}
                  disabled={locked}
                  onChange={e => setDraft(d => ({ ...d, permissions: e.target.checked ? [ALL_ACCESS] : ["dashboard.view"] }))}
                />
              }
              label={<Typography sx={{ fontWeight: 750 }}>Full access (Super Admin)</Typography>}
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 6.5 }}>
              Everything, including staff accounts, roles and money. Keep this to one or two trusted people.
            </Typography>
          </Box>

          {locked && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Super Admin always keeps full access so the society can never be locked out of its own portal.
            </Alert>
          )}

          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, opacity: full ? 0.45 : 1, pointerEvents: full ? "none" : "auto" }}>
            {PERMISSION_GROUPS.map(g => {
              const keys = g.items.map(i => i.key as string);
              const on = keys.filter(k => draft.permissions.includes(k)).length;
              return (
                <Box key={g.group} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography sx={{ fontWeight: 800, fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "text.secondary" }}>{g.group}</Typography>
                    <Button size="small" onClick={() => toggleGroup(keys, on < keys.length)}>
                      {on < keys.length ? "Select all" : "Clear"}
                    </Button>
                  </Stack>
                  <Divider sx={{ my: 1 }} />
                  {g.items.map(item => (
                    <FormControlLabel
                      key={item.key}
                      sx={{ display: "flex", alignItems: "flex-start", mx: 0, my: 0.25 }}
                      control={<Checkbox size="small" checked={full || draft.permissions.includes(item.key)} onChange={() => toggle(item.key)} sx={{ mt: -0.5 }} />}
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "ui-monospace, monospace" }}>
                            {item.key}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </Box>
              );
            })}
          </Box>

          <Divider sx={{ my: 2.5 }} />
          <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={1} justifyContent="space-between">
            <Stack direction="row" spacing={1}>
              {draft.id && (
                <Button color="inherit" startIcon={<ContentCopyRounded />} onClick={() => startNew(draft)}>
                  Duplicate
                </Button>
              )}
              {draft.id && !draft.isSystem && (
                <Button color="error" startIcon={<DeleteOutlineRounded />} onClick={remove}>
                  Delete
                </Button>
              )}
            </Stack>
            <Button variant="contained" startIcon={<SaveRounded />} onClick={save} disabled={!dirty || saving || draft.name.trim().length < 2}>
              {selected === "new" ? "Create role" : "Save changes"}
            </Button>
          </Stack>
        </Card>
      </Box>
    </PageGate>
  );
}
