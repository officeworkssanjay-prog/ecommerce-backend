"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api, withFallback } from "@/lib/api";
import { Star, Clock, CheckCircle2, Package, ArrowLeft } from "lucide-react";

interface UserReview {
  id: string;
  rating: number;
  review: string;
  status: boolean;
  createdAt: string;
  product: { id: string; name: string; slug: string; thumbImage: string };
}

const mockReviews: UserReview[] = [
  {
    id: "rev-1",
    rating: 5,
    review: "The clay texture and craftsmanship on this vase exceeded my expectations! Highly recommended.",
    status: true,
    createdAt: new Date().toISOString(),
    product: {
      id: "prod-1",
      name: "Handcrafted Terracotta Ceramic Planter",
      slug: "handcrafted-terracotta-planter",
      thumbImage: "https://images.unsplash.com/photo-1514517521153-1be72277b32f?auto=format&fit=crop&w=600&q=80",
    },
  },
];

export default function UserReviewsPage() {
  const [reviews, setReviews] = useState<UserReview[]>(mockReviews);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      const res = await withFallback<UserReview[]>(
        api.get("/user/reviews"),
        mockReviews
      );
      setReviews(res.data || mockReviews);
      setLoading(false);
    }
    fetchReviews();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs text-zinc-400 mb-1">
            <Link href="/account" className="hover:text-zinc-700 dark:hover:text-zinc-200">
              Account
            </Link>
            <span>/</span>
            <span>Product Reviews</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            My Product Reviews
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Feedback and ratings you shared on artisan products.
          </p>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <Link
                href={`/products/${rev.product.slug}`}
                className="flex items-center space-x-3 group"
              >
                <img
                  src={rev.product.thumbImage}
                  alt={rev.product.name}
                  className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800"
                />
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 transition">
                    {rev.product.name}
                  </h3>
                  <span className="text-[11px] text-zinc-400">
                    Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>

              {rev.status ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Approved & Live</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                  <Clock className="w-3 h-3" />
                  <span>Under Review</span>
                </span>
              )}
            </div>

            {/* Stars */}
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= rev.rating
                      ? "text-amber-400 fill-amber-400"
                      : "text-zinc-200 dark:text-zinc-700"
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              "{rev.review}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
