"use client";

import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/lib/useApi";

/** Number of saved items for the signed-in shopper (0 when signed out or the request fails). Refreshes on navigation. */
export function useWishlistCount(): number {
  const { user } = useAuth();
  const pathname = usePathname();
  const { data } = useApi(async () => (await api.get<unknown[]>("/user/wishlist")).data, [user?.id, pathname], { enabled: !!user });
  return user ? (data?.length ?? 0) : 0;
}
