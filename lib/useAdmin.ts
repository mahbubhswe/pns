// lib/useAdmin.ts — the signed-in staff member and their permissions (client side).
import useSWR from "swr";
import { hasPermission, Permission } from "@/lib/permissions";

export type AdminMe = {
  id: number;
  name: string;
  email: string;
  title: string | null;
  photoUrl: string | null;
  roleId: number | null;
  roleName: string;
  permissions: string[];
};

const fetchMe = async (url: string): Promise<AdminMe | null> => {
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return json.admin as AdminMe;
};

export function useAdmin() {
  const { data, isLoading, mutate } = useSWR<AdminMe | null>("/api/admin/me", fetchMe, {
    revalidateOnFocus: true,
    dedupingInterval: 10_000,
  });
  const can = (p: Permission | Permission[]) => hasPermission(data?.permissions, p);
  return { admin: data ?? null, loading: isLoading, signedOut: data === null, can, refresh: mutate };
}
