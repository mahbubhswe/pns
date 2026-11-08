import React, { useState } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import DashboardLayout from "@/components/dashboard/Layout";
import UserForm, { ManagementUserInput } from "@/components/dashboard/UserForm";
import { PageHeader } from "@/components/dashboard/ui";
import { apiError } from "@/lib/format";

export default function AddUserPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (data: ManagementUserInput, photoFile?: File | null) => {
    try {
      setBusy(true);
      if (photoFile) {
        const fd = new FormData();
        fd.append("file", photoFile);
        const up = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (!up.ok) throw new Error(await apiError(up));
        const { url } = await up.json();
        data.photoUrl = url;
      }
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await apiError(res));
      await router.push("/dashboard/users");
    } catch (e: any) {
      Swal.fire({ icon: "error", title: "Couldn't create the account", text: e?.message || "Failed to create user" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout title="Add staff" permission="users.manage">
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
    </DashboardLayout>
  );
}
