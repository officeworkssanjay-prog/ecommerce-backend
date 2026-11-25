"use client";

import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import type { Category } from "@/lib/types";

/** Real categories for the navigation. If the request fails the dynamic part is simply hidden. */
export function useCategories(): Category[] {
  const { data } = useApi(async () => (await api.get<Category[]>("/storefront/categories")).data, []);
  return (data ?? []).filter((c) => c.status);
}
