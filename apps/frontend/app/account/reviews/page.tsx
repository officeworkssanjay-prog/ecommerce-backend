"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import type { Review } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { EmptyState, ErrorState, PageLoader } from "@/components/ui/States";
import { AccountHeader, AccountPage } from "@/components/account/AccountHeader";

export default function UserReviewsPage() {
  const reviews = useApi(async () => (await api.get<Review[]>("/user/reviews")).data, []);

  return (
    <AccountPage>
      <AccountHeader title="My reviews" description="Reviews appear on the product page once our team approves them." />

      {reviews.loading && !reviews.data ? (
        <PageLoader label="Loading your reviews…" />
      ) : reviews.error || !reviews.data ? (
        <ErrorState message={reviews.message} onRetry={reviews.reload} />
      ) : reviews.data.length === 0 ? (
        <EmptyState
          icon={<Star className="h-10 w-10" aria-hidden />}
          title="No reviews yet"
          description="After an order is delivered you can review the products you bought."
          action={
            <Link href="/account/orders" className={buttonClasses("outline", "md")}>
              View my orders
            </Link>
          }
        />
      ) : (
        <ul className="space-y-4">
          {reviews.data.map((r) => (
            <li key={r.id} className="space-y-2 rounded-2xl border border-sand bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {r.product ? (
                  <Link href={`/products/${r.product.slug}`} className="font-serif text-lg text-ink hover:text-gold-dark">
                    {r.product.name}
                  </Link>
                ) : (
                  <span className="font-serif text-lg text-ink">Product</span>
                )}
                <Badge tone={r.status ? "success" : "gold"}>{r.status ? "Published" : "Pending moderation"}</Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-ink/60">
                <span role="img" aria-label={`${r.rating} out of 5 stars`} className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`h-4 w-4 ${n <= r.rating ? "fill-gold text-gold" : "text-sand"}`} aria-hidden />
                  ))}
                </span>
                {formatDate(r.createdAt)}
              </div>
              <p className="text-sm text-ink/80">{r.review}</p>
            </li>
          ))}
        </ul>
      )}
    </AccountPage>
  );
}
