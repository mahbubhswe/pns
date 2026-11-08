"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import PageGate from "@/components/dashboard/PageGate";
import UserForm, { ManagementUserInput } from "@/components/dashboard/UserForm";
import { PageHeader } from "@/components/dashboard/ui";
import { apiPost, apiPostForm, errorMessage } from "@/lib/api";
import type { ManagementUserCreatedResponse, UploadResponse } from "@/types/api";

export default function AddUserPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (data: ManagementUserInput, photoFile?: File | null) => {
    try {
      setBusy(true);
      const payload: ManagementUserInput = { ...data };
      if (photoFile) {
        const fd = new FormData();
        fd.append("file", photoFile);
        const { url } = await apiPostForm<UploadResponse>("/api/admin/upload", fd);
        payload.photoUrl = url;
      }
      await apiPost<ManagementUserCreatedResponse>("/api/admin/users", payload);
      router.push("/dashboard/users");
    } catch (e) {
      Swal.fire({ icon: "error", title: "Couldn't create the account", text: errorMessage(e, "Failed to create user") });
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageGate title="Add staff" permission="users.manage">
      <PageHeader
        crumbs={[{ label: "Staff users", href: "/dashboard/users" }, { label: "Add staff" }]}
        title="Add a staff member"
        subtitle="Create a sign-in for a volunteer or employee and choose their role. Share the password with them privately."
      />
      <UserForm
        mode="create"
        title="New staff account"
        subheader="Name, contact and role are required"
        submitLabel="Create account"
        onSubmit={handleSubmit}
        busy={busy}
      />
    </PageGate>
  );
}
