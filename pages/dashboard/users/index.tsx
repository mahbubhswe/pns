import React, { useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import PersonAddAlt1Rounded from "@mui/icons-material/PersonAddAlt1Rounded";
import EditRounded from "@mui/icons-material/EditRounded";
import ManageAccountsRounded from "@mui/icons-material/ManageAccountsRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import BlockRounded from "@mui/icons-material/BlockRounded";
import CheckCircleOutlineRounded from "@mui/icons-material/CheckCircleOutlineRounded";
import AdminPanelSettingsRounded from "@mui/icons-material/AdminPanelSettingsRounded";
import { DataGrid, GridActionsCellItem, GridColDef, GridToolbar } from "@mui/x-data-grid";
import Swal from "sweetalert2";
import DashboardLayout from "@/components/dashboard/Layout";
import { PageHeader, StatCard, Grid } from "@/components/dashboard/ui";
import { getJSON } from "@/lib/api";
import { useAdmin } from "@/lib/useAdmin";
import { initials, sendJSON, timeAgo } from "@/lib/format";

type Staff = {
  id: number;
  photoUrl?: string | null;
  name: string;
  phone: string;
  email: string;
  title?: string | null;
  roleId: number | null;
  roleName: string;
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: string | null;
  created: string;
};

type RoleOption = { id: number; name: string };

export default function UsersPage() {
  const router = useRouter();
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down("sm"));
  const { admin, can } = useAdmin();
  const manage = can("users.manage");
  const { data, isLoading, mutate } = useSWR<{ users: Staff[] }>("/api/admin/users", getJSON);
  const { data: rolesData } = useSWR<{ roles: RoleOption[] }>("/api/admin/roles", getJSON);
  const rows = useMemo(() => data?.users || [], [data]);
  const [roleUser, setRoleUser] = useState<Staff | null>(null);
  const [roleValue, setRoleValue] = useState<number | "">("");

  const counts = useMemo(
    () => ({
      total: rows.length,
      active: rows.filter(r => r.isActive).length,
      full: rows.filter(r => r.permissions?.includes("*") && r.isActive).length,
      recent: rows.filter(r => r.lastLoginAt && Date.now() - new Date(r.lastLoginAt).getTime() < 7 * 864e5).length,
    }),
    [rows]
  );

  const saveRole = async () => {
    if (!roleUser || !roleValue) return;
    try {
      await sendJSON(`/api/admin/users/${roleUser.id}`, "PATCH", { roleId: roleValue });
      setRoleUser(null);
      await mutate();
    } catch (e: any) {
      Swal.fire({ icon: "error", title: "Couldn't change role", text: e?.message });
    }
  };

  const toggleActive = async (u: Staff) => {
    const next = !u.isActive;
    const ok = await Swal.fire({
      title: next ? `Reactivate ${u.name}?` : `Deactivate ${u.name}?`,
      text: next ? "They will be able to sign in again." : "They won't be able to sign in. Their history stays intact.",
      icon: next ? "question" : "warning",
      showCancelButton: true,
      confirmButtonText: next ? "Reactivate" : "Deactivate",
      confirmButtonColor: next ? "#0F6E56" : "#D23B3B",
    });
    if (!ok.isConfirmed) return;
    try {
      await sendJSON(`/api/admin/users/${u.id}`, "PATCH", { isActive: next });
      await mutate();
    } catch (e: any) {
      Swal.fire({ icon: "error", title: "Couldn't update", text: e?.message });
    }
  };

  async function confirmAndDelete(u: Staff) {
    const result = await Swal.fire({
      title: `Delete ${u.name}?`,
      text: "This removes the staff account permanently. Deactivating is usually the better choice.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#D23B3B",
      confirmButtonText: "Yes, delete",
    });
    if (!result.isConfirmed) return;
    try {
      await sendJSON(`/api/admin/users/${u.id}`, "DELETE");
      await mutate();
      await Swal.fire({ icon: "success", title: "Deleted", timer: 1200, showConfirmButton: false });
    } catch (e: any) {
      Swal.fire({ icon: "error", title: "Couldn't delete", text: e?.message || "Unable to delete" });
    }
  }

  const columns: GridColDef<Staff>[] = [
    {
      field: "name",
      headerName: "Person",
      flex: 1.4,
      minWidth: 240,
      renderCell: p => (
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: "100%", minWidth: 0, opacity: p.row.isActive ? 1 : 0.55 }}>
          <Avatar src={p.row.photoUrl || undefined} sx={{ width: 36, height: 36, fontSize: 13, bgcolor: alpha(theme.palette.primary.main, 0.14), color: "primary.main" }}>
            {initials(p.row.name)}
          </Avatar>
          <Box sx={{ minWidth: 0, lineHeight: 1.25 }}>
            <Typography component="div" sx={{ fontWeight: 700, fontSize: 14 }} noWrap>
              {p.row.name} {admin?.id === p.row.id && <Chip label="You" size="small" sx={{ ml: 0.5, height: 18, fontSize: 10 }} />}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap component="div">
              {p.row.title || p.row.email}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
    { field: "phone", headerName: "Phone", minWidth: 130 },
    {
      field: "roleName",
      headerName: "Role",
      minWidth: 150,
      renderCell: p => (
        <Chip
          size="small"
          icon={p.row.permissions?.includes("*") ? <AdminPanelSettingsRounded /> : undefined}
          label={p.value}
          color={p.row.permissions?.includes("*") ? "primary" : "default"}
          variant={p.row.permissions?.includes("*") ? "filled" : "outlined"}
        />
      ),
    },
    {
      field: "isActive",
      headerName: "Status",
      minWidth: 120,
      renderCell: p => <Chip size="small" label={p.value ? "Active" : "Deactivated"} color={p.value ? "success" : "default"} variant={p.value ? "filled" : "outlined"} />,
    },
    {
      field: "lastLoginAt",
      headerName: "Last sign-in",
      minWidth: 130,
      valueFormatter: (v: any) => timeAgo(v),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "",
      width: 150,
      getActions: params =>
        manage
          ? [
              <GridActionsCellItem key="edit" icon={<EditRounded fontSize="small" />} label="Edit" onClick={() => router.push(`/dashboard/users/${params.id}`)} />,
              <GridActionsCellItem
                key="role"
                icon={<ManageAccountsRounded fontSize="small" />}
                label="Change role"
                onClick={() => {
                  setRoleUser(params.row);
                  setRoleValue(params.row.roleId || "");
                }}
              />,
              <GridActionsCellItem
                key="active"
                icon={params.row.isActive ? <BlockRounded fontSize="small" /> : <CheckCircleOutlineRounded fontSize="small" />}
                label={params.row.isActive ? "Deactivate" : "Reactivate"}
                onClick={() => toggleActive(params.row)}
                disabled={admin?.id === params.row.id}
                showInMenu
              />,
              <GridActionsCellItem
                key="delete"
                icon={<DeleteOutlineRounded fontSize="small" />}
                label="Delete"
                onClick={() => confirmAndDelete(params.row)}
                disabled={admin?.id === params.row.id}
                showInMenu
              />,
            ]
          : [],
    },
  ];

  return (
    <>
      <DashboardLayout title="Staff users" permission={["users.view", "users.manage"]}>
        <PageHeader
          eyebrow="Administration"
          title="Staff users"
          subtitle="The volunteers and staff who run the portal. Each person gets a role that decides what they can see and change."
          actions={
            <>
              {can("roles.manage") && (
                <Button component={Link} href="/dashboard/roles" variant="outlined" startIcon={<AdminPanelSettingsRounded />}>
                  Roles & permissions
                </Button>
              )}
              {manage && (
                <Button variant="contained" startIcon={<PersonAddAlt1Rounded />} onClick={() => router.push("/dashboard/users/add-user")}>
                  Add staff
                </Button>
              )}
            </>
          }
        />

        <Grid min={200} sx={{ mb: 3 }}>
          <StatCard label="Staff accounts" value={counts.total} />
          <StatCard label="Active" value={counts.active} tone="success" />
          <StatCard label="Full access" value={counts.full} tone="warning" hint="Super Admin level" />
          <StatCard label="Signed in this week" value={counts.recent} tone="info" />
        </Grid>

        <Box sx={{ height: { xs: 520, md: 600 }, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={isLoading}
            rowHeight={60}
            disableRowSelectionOnClick
            columnVisibilityModel={isPhone ? { email: false, phone: false, lastLoginAt: false } : undefined}
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            pageSizeOptions={[10, 25, 50]}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 300 } } }}
          />
        </Box>
      </DashboardLayout>

      <Dialog open={!!roleUser} onClose={() => setRoleUser(null)} fullWidth maxWidth="xs">
        <DialogTitle>Change role</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose what {roleUser?.name} can do in the portal. The change applies on their next click.
          </Typography>
          <TextField select fullWidth size="small" label="Role" value={roleValue} onChange={e => setRoleValue(Number(e.target.value))}>
            {(rolesData?.roles || []).map(r => (
              <MenuItem key={r.id} value={r.id}>
                {r.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setRoleUser(null)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={saveRole} disabled={!roleValue}>
            Save role
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
