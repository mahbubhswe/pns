"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { Alert, Box, CircularProgress } from "@mui/material";
import Swal from "sweetalert2";
import PageGate from "@/components/dashboard/PageGate";
import UserForm, { ManagementUserInput } from "@/components/dashboard/UserForm";
import { PageHeader } from "@/components/dashboard/ui";
import { apiPatch, apiPostForm, errorMessage, getJSON } from "@/lib/api";
import type { ManagementUserResponse, ManagementUserUpdatedResponse, UploadResponse } from "@/types/api";

export default function EditUserPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [busy, setBusy] = useState(false);
  const { data, error, isLoading } = useSWR<ManagementUserResponse>(id ? `/api/admin/users/${id}` : null, getJSON, {
    revalidateOnFocus: false,
  });

  const initial = useMemo<Partial<ManagementUserInput> | null>(() => {
    const u = data?.user;
    if (!u) return null;
    return {
      photoUrl: u.photoUrl || "",
      name: u.name,
      phone: u.phone,
      address: u.address || "",
      roleId: u.roleId || "",
      email: u.email,
      title: u.title || "",
      isActive: u.isActive !== false,
    };
  }, [data]);

  const handleSubmit = async (values: ManagementUserInput, photoFile?: File | null) => {
    if (!id) return;
    try {
      setBusy(true);
      const payload: Partial<ManagementUserInput> = { ...values };
      if (photoFile) {
        const fd = new FormData();
        fd.append("file", photoFile);
        const { url } = await apiPostForm<UploadResponse>("/api/admin/upload", fd);
        payload.photoUrl = url;
      }
      if (!payload.password) delete payload.password; // blank = keep current password
      await apiPatch<ManagementUserUpdatedResponse>(`/api/admin/users/${id}`, payload);
      router.push("/dashboard/users");
    } catch (e) {
      Swal.fire({ icon: "error", title: "Couldn't save", text: errorMessage(e, "Failed to update user") });
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageGate title="Edit staff" permission="users.manage">
      <PageHeader
        crumbs={[{ label: "Staff users", href: "/dashboard/users" }, { label: initial?.name || "Edit" }]}
        title={initial?.name ? `Edit ${initial.name}` : "Edit staff member"}
        subtitle="Update contact details, role or status. Leave the password empty to keep the current one."
      />
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="warning">{errorMessage(error, "Failed to load user")}</Alert>}
      {initial && (
        <UserForm mode="edit" title="Account details" subheader="Changes apply immediately" initial={initial} submitLabel="Save changes" onSubmit={handleSubmit} busy={busy} />
      )}
    </PageGate>
  );
}
