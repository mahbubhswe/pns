"use client";
// Client helpers for "Log in as" (staff impersonating a member or another staff user).
import Swal from "sweetalert2";
import { apiPost, errorMessage } from "@/lib/api";
import type { ImpersonationResponse } from "@/types/api";

/** Log in as a member: their profile opens in a new tab, the dashboard stays signed in. */
export async function loginAsMember(member: { id: number; ownerNameEnglish: string }) {
  const ok = await Swal.fire({
    title: `Log in as ${member.ownerNameEnglish}?`,
    text: "Their profile opens in a new tab, exactly as they see it. View only, ends after 1 hour.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Log in as member",
    confirmButtonColor: "#0F6E56",
  });
  if (!ok.isConfirmed) return;
  // Open the tab synchronously (inside the click) so popup blockers allow it.
  const tab = window.open("about:blank", "_blank");
  try {
    const res = await apiPost<ImpersonationResponse>(`/api/admin/impersonate/member/${member.id}`);
    if (tab) tab.location.href = res.redirectTo;
    else window.location.assign(res.redirectTo);
  } catch (e) {
    tab?.close();
    Swal.fire({ icon: "error", title: "Couldn't log in as member", text: errorMessage(e) });
  }
}

/** Log in as another staff user: this tab switches to their dashboard. */
export async function loginAsStaff(user: { id: number; name: string }) {
  const ok = await Swal.fire({
    title: `Log in as ${user.name}?`,
    text: "You'll see the dashboard with their role and permissions. Use 'Return to my account' in the yellow bar to come back. Ends after 1 hour.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Log in as user",
    confirmButtonColor: "#0F6E56",
  });
  if (!ok.isConfirmed) return;
  try {
    const res = await apiPost<ImpersonationResponse>(`/api/admin/impersonate/staff/${user.id}`);
    window.location.assign(res.redirectTo);
  } catch (e) {
    Swal.fire({ icon: "error", title: "Couldn't log in as user", text: errorMessage(e) });
  }
}

/** End a staff → staff session and go back to your own account. */
export async function returnToOwnAccount() {
  try {
    const res = await apiPost<ImpersonationResponse>("/api/admin/impersonate/stop");
    window.location.assign(res.redirectTo);
  } catch {
    window.location.assign("/admin/login");
  }
}
