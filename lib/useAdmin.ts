"use client";
// The signed-in staff member and their permissions (client side).
import useSWR from "swr";
import { ApiClientError, apiGet } from "@/lib/api";
import { hasPermission, type Permission } from "@/lib/shared/permissions";
import type { AdminMeDto, AdminMeResponse } from "@/types/api";

const fetchMe = async (url: string): Promise<AdminMeDto | null> => {
  try {
    return (await apiGet<AdminMeResponse>(url)).admin;
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 401) return null;
    throw err;
  }
};

export function useAdmin() {
  const { data, isLoading, mutate } = useSWR<AdminMeDto | null>("/api/admin/me", fetchMe, {
    revalidateOnFocus: true,
    dedupingInterval: 10_000,
  });
  const can = (p: Permission | Permission[]) => hasPermission(data?.permissions, p);
  return { admin: data ?? null, loading: isLoading, signedOut: data === null, can, refresh: mutate };
}
