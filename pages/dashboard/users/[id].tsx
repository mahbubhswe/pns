import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Box, CircularProgress } from "@mui/material";
import Swal from "sweetalert2";
import DashboardLayout from "@/components/dashboard/Layout";
import UserForm, { ManagementUserInput } from "@/components/dashboard/UserForm";
import { PageHeader } from "@/components/dashboard/ui";
import { apiError } from "@/lib/format";

export default function EditUserPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [initial, setInitial] = useState<Partial<ManagementUserInput> | null>(null);

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/users/${id}`);
        if (!res.ok) throw new Error(await apiError(res));
        const data = await res.json();
        const u = data.user;
        setInitial({
          photoUrl: u.photoUrl || "",
          name: u.name,
          phone: u.phone,
          address: u.address || "",
          roleId: u.roleId || "",
          email: u.email,
          title: u.title || "",
          isActive: u.isActive !== false,
        });
      } catch (e: any) {
        Swal.fire({ icon: "error", title: "Couldn't load", text: e?.message || "Failed to load user" });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const handleSubmit = async (data: ManagementUserInput, photoFile?: File | null) => {
    try {
      if (!id || typeof id !== "string") return;
      setBusy(true);
      const payload: any = { ...data };
      if (photoFile) {
        const fd = new FormData();
        fd.append("file", photoFile);
        const up = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (!up.ok) throw new Error(await apiError(up));
        const { url } = await up.json();
        payload.photoUrl = url;
      }
      if (!payload.password) delete payload.password; // blank = keep current password
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await apiError(res));
      await router.push("/dashboard/users");
    } catch (e: any) {
      Swal.fire({ icon: "error", title: "Couldn't save", text: e?.message || "Failed to update user" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout title="Edit staff" permission="users.manage">
      <PageHeader
        crumbs={[{ label: "Staff users", href: "/dashboard/users" }, { label: initial?.name || "Edit" }]}
        title={initial?.name ? `Edit ${initial.name}` : "Edit staff member"}
        subtitle="Update contact details, role or status. Leave the password empty to keep the current one."
      />
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}
      {initial && (
        <UserForm mode="edit" title="Account details" subheader="Changes apply immediately" initial={initial} submitLabel="Save changes" onSubmit={handleSubmit} busy={busy} />
      )}
    </DashboardLayout>
  );
}
