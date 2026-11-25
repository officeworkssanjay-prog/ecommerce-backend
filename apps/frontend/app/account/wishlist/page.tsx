"use client";

import { useState } from "react";
import { defaultSelection } from "@/components/catalog/pricing";
import Link from "next/link";
import { Heart } from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/types";
import { effectivePrice } from "@/lib/format";
import { Button, buttonClasses } from "@/components/ui/Button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { useFeedback } from "@/components/ui/Feedback";
import { AccountHeader, AccountPage } from "@/components/account/AccountHeader";
import { WishlistCard } from "@/components/wishlist/WishlistCard";
import { needsOptions } from "@/components/catalog/pricing";

interface WishlistEntry {
  id: string;
  productId: string;
  product: Product;
}

const available = (p: Product) => p.qty > 0 && p.status;

export default function UserWishlistPage() {
  const { addItem } = useCart();
  const { toast } = useFeedback();
  const wishlist = useApi(async () => (await api.get<WishlistEntry[]>("/user/wishlist")).data, []);
  const [removing, setRemoving] = useState<string | null>(null);

  const remove = async (entry: WishlistEntry) => {
    setRemoving(entry.productId);
    try {
      await api.delete(`/user/wishlist/${entry.productId}`);
      toast.success("Removed from wishlist");
      wishlist.reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setRemoving(null);
    }
  };

  const add = (p: Product) => addItem({ productId: p.id, name: p.name, slug: p.slug, thumbImage: p.thumbImage, price: effectivePrice(p), qty: 1, ...defaultSelection(p) });

  const addOne = (p: Product) => {
    add(p);
    toast.success("Added to cart");
  };

  const simple = (wishlist.data ?? []).filter((e) => available(e.product) && !needsOptions(e.product));
  const addAll = () => {
    simple.forEach((e) => add(e.product));
    toast.success(`${simple.length} pieces added to cart`);
  };

  const count = wishlist.data?.length;
  return (
    <AccountPage>
      <AccountHeader
        title={count ? `My wishlist (${count})` : "My wishlist"}
        description="The pieces you love, all in one beautiful place."
        action={
          simple.length > 1 ? (
            <Button variant="outline" onClick={addAll}>
              Move all to cart
            </Button>
          ) : undefined
        }
      />

      {wishlist.loading && !wishlist.data ? (
        <div role="status" aria-live="polite">
          <span className="sr-only">Loading your wishlist…</span>
          <ul aria-hidden className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <li key={i} className="space-y-3 rounded-sm border border-sand bg-white p-4">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-11 w-full" />
              </li>
            ))}
          </ul>
        </div>
      ) : wishlist.error || !wishlist.data ? (
        <ErrorState message={wishlist.message} onRetry={wishlist.reload} />
      ) : wishlist.data.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-10 w-10" aria-hidden />}
          title="Your wishlist is empty"
          description="Tap the heart on any piece to save it for later."
          action={
            <Link href="/products" className={buttonClasses("primary", "md")}>
              Explore collection
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.data.map((entry) => (
            <WishlistCard key={entry.id} product={entry.product} removing={removing === entry.productId} onRemove={() => remove(entry)} onAdd={() => addOne(entry.product)} />
          ))}
        </ul>
      )}
    </AccountPage>
  );
}
