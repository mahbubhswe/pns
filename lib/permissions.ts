// lib/permissions.ts — shared (client + server) permission catalogue for staff roles.

export const ALL_ACCESS = "*";

export const PERMISSIONS = [
  { key: "dashboard.view", group: "General", label: "View dashboard overview" },

  { key: "members.view", group: "Members", label: "View members & applications" },
  { key: "members.manage", group: "Members", label: "Approve, reject & import members" },
  { key: "members.delete", group: "Members", label: "Delete member records" },

  { key: "posts.view", group: "Content", label: "View posts" },
  { key: "posts.manage", group: "Content", label: "Write, edit & delete posts" },
  { key: "guideline.manage", group: "Content", label: "Upload registration guideline PDF" },

  { key: "accounting.view", group: "Accounting", label: "View accounts overview & vouchers" },
  { key: "accounting.entry", group: "Accounting", label: "Record income, expenses & transfers" },
  { key: "accounting.void", group: "Accounting", label: "Void vouchers" },
  { key: "accounting.setup", group: "Accounting", label: "Manage fund accounts & ledger heads" },
  { key: "accounting.reports", group: "Accounting", label: "View, print & export financial reports" },

  { key: "users.view", group: "Administration", label: "View staff users" },
  { key: "users.manage", group: "Administration", label: "Create, edit & deactivate staff users" },
  { key: "roles.manage", group: "Administration", label: "Create & edit roles and permissions" },
] as const;

export type Permission = (typeof PERMISSIONS)[number]["key"];

export const PERMISSION_KEYS: string[] = PERMISSIONS.map(p => p.key);

export const PERMISSION_GROUPS: Array<{ group: string; items: Array<(typeof PERMISSIONS)[number]> }> = Array.from(
  PERMISSIONS.reduce((map, p) => {
    if (!map.has(p.group)) map.set(p.group, []);
    map.get(p.group)!.push(p);
    return map;
  }, new Map<string, Array<(typeof PERMISSIONS)[number]>>())
).map(([group, items]) => ({ group, items }));

/** True when the permission list grants ANY of the requested permissions. */
export function hasPermission(perms: readonly string[] | null | undefined, wanted: Permission | Permission[]): boolean {
  if (!perms || perms.length === 0) return false;
  if (perms.includes(ALL_ACCESS)) return true;
  const list = Array.isArray(wanted) ? wanted : [wanted];
  return list.some(p => perms.includes(p));
}

/** Drop unknown keys; keep "*" only when it is the sole intent. */
export function sanitizePermissions(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const set = new Set(input.map(String));
  if (set.has(ALL_ACCESS)) return [ALL_ACCESS];
  return PERMISSION_KEYS.filter(k => set.has(k));
}

const VIEWER: Permission[] = ["dashboard.view", "members.view", "posts.view", "accounting.view"];
const EDITOR: Permission[] = [...VIEWER, "members.manage", "posts.manage", "guideline.manage"];
const ACCOUNTANT: Permission[] = [
  "dashboard.view",
  "members.view",
  "accounting.view",
  "accounting.entry",
  "accounting.setup",
  "accounting.reports",
];

/** Used when a staff user has no Role row yet (pre-migration accounts). */
export function legacyPermissions(role: string | null | undefined): string[] {
  switch (String(role || "").toUpperCase()) {
    case "ADMIN":
      return [ALL_ACCESS];
    case "EDITOR":
      return EDITOR;
    default:
      return VIEWER;
  }
}

/** The legacy enum value kept in ManagementUser.role for backwards compatibility. */
export function legacyRoleFor(perms: string[]): "ADMIN" | "EDITOR" | "VIEWER" {
  if (perms.includes(ALL_ACCESS)) return "ADMIN";
  if (perms.some(p => p.endsWith(".manage") || p === "accounting.entry")) return "EDITOR";
  return "VIEWER";
}

export const DEFAULT_ROLES = [
  { name: "Super Admin", description: "Full access to every part of the portal.", permissions: [ALL_ACCESS] },
  { name: "Accountant", description: "Keeps the books: vouchers, fund accounts and reports.", permissions: ACCOUNTANT },
  { name: "Editor", description: "Reviews members and publishes content.", permissions: EDITOR },
  { name: "Viewer", description: "Read-only access to members, posts and accounts.", permissions: VIEWER },
];
