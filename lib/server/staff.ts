// lib/server/staff.ts — shape a ManagementUser row for API responses (never expose the password hash).
import { legacyPermissions } from "@/lib/permissions";

export function safeUser(u: any) {
  if (!u) return u;
  const { password: _omit, roleRef, ...rest } = u;
  return {
    ...rest,
    roleName: roleRef?.name || String(u.role || ""),
    permissions: roleRef ? roleRef.permissions : legacyPermissions(u.role),
  };
}
