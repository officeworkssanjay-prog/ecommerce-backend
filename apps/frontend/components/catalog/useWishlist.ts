"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useFeedback } from "@/components/ui/Feedback";

/**
 * Wishlist state for a group of product cards. Loads the shopper's wishlist once (when signed in);
 * `toggle` sends signed-out shoppers to /login?next=<current page>.
 */
export function useWishlist() {
  const { user } = useAuth();
  const { toast } = useFeedback();
  const router = useRouter();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api
      .get<{ productId: string }[]>("/user/wishlist")
      .then((res) => {
        if (!cancelled) setIds(new Set(res.data.map((w) => w.productId)));
      })
      .catch(() => {
        /* hearts simply start empty; toggling still works and reports its own errors */
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Signed-out shoppers never have saved items, even if a previous account's list is still cached.
  const has = useCallback((productId: string) => !!user && ids.has(productId), [ids, user]);

  const toggle = useCallback(
    async (productId: string) => {
      if (!user) {
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        router.push(`/login?next=${next}`);
        return;
      }
      const wasSaved = ids.has(productId);
      setBusyId(productId);
      try {
        const res = wasSaved ? await api.delete(`/user/wishlist/${productId}`) : await api.post(`/user/wishlist/${productId}`);
        setIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.delete(productId);
          else next.add(productId);
          return next;
        });
        toast.success(res.message || (wasSaved ? "Removed from wishlist" : "Added to wishlist"));
      } catch (err) {
        toast.error(errorMessage(err, "Could not update your wishlist."));
      } finally {
        setBusyId(null);
      }
    },
    [ids, router, toast, user]
  );

  return { has, toggle, busyId };
}
