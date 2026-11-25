"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateReviewSchema } from "@ecommerce/shared-types";
import type { z } from "zod";
import { api } from "@/lib/api";
import { applyServerErrors } from "@/lib/forms";
import { formatDate } from "@/lib/format";
import type { Review } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { FormError, Select, Textarea } from "@/components/ui/Field";
import { useFeedback } from "@/components/ui/Feedback";
import { StarRating } from "@/components/catalog/StarRating";

type ReviewInput = z.input<typeof CreateReviewSchema>;
type ReviewOutput = z.output<typeof CreateReviewSchema>;

const RATINGS = [
  [5, "5 stars - Flawless"],
  [4, "4 stars - Exceptional"],
  [3, "3 stars - Good"],
  [2, "2 stars - Fair"],
  [1, "1 star - Poor"],
] as const;

function ReviewForm({ productId }: { productId: string }) {
  const { toast } = useFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewInput, unknown, ReviewOutput>({
    resolver: zodResolver(CreateReviewSchema),
    defaultValues: { productId, rating: 5, review: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const res = await api.post("/user/reviews", values);
      toast.success(res.message || "Review submitted for moderation");
      setSubmitted(true);
      reset({ productId, rating: 5, review: "" });
    } catch (err) {
      // 403 (not a delivered buyer) and 409 (already reviewed) messages come from the server verbatim.
      setFormError(applyServerErrors(err, setError));
    }
  });

  if (submitted) {
    return (
      <p role="status" className="border border-success/30 bg-success/10 p-4 text-sm text-success">
        Thank you! Your review has been submitted and will appear once it is approved.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4 border border-sand bg-white p-6">
      <p className="text-xs text-ink/55">Only customers whose order has been delivered can review a product.</p>
      <input type="hidden" {...register("productId")} />
      <Select label="Rating" className="max-w-xs" error={errors.rating?.message} {...register("rating")}>
        {RATINGS.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <Textarea label="Your review" rows={4} placeholder="Share your impressions of the finish, brilliance and craftsmanship…" error={errors.review?.message} {...register("review")} />
      <FormError message={formError} />
      <Button type="submit" loading={isSubmitting}>
        Submit Review
      </Button>
    </form>
  );
}

export function ReviewsSection({ productId, reviews }: { productId: string; reviews: Review[] }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [writing, setWriting] = useState(false);
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="scroll-mt-24 bg-cream py-14">
      <div className="mx-auto max-w-5xl space-y-8 px-4 sm:px-6">
        <header className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold-dark">Loved, worn, treasured</p>
          <h2 id="reviews-heading" className="mt-2 font-serif text-3xl text-ink">
            A little sparkle. A lot of love.
          </h2>
        </header>

        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {reviews.length > 0 ? (
            <div className="flex items-center gap-4">
              <span className="font-serif text-5xl text-ink">{average.toFixed(1)}</span>
              <div className="space-y-1">
                <StarRating value={average} />
                <p className="text-xs text-ink/60">
                  Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink/60">No reviews yet. Be the first to review this piece.</p>
          )}
          {!loading &&
            (user ? (
              <Button variant="outline" aria-expanded={writing} onClick={() => setWriting((w) => !w)}>
                Write a Review
              </Button>
            ) : (
              <p className="text-sm text-ink/70">
                <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="font-semibold text-gold-dark underline">
                  Sign in
                </Link>{" "}
                to write a review.
              </p>
            ))}
        </div>

        {user && writing && <ReviewForm productId={productId} />}

        {reviews.length > 0 && (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {reviews.map((r) => (
              <li key={r.id} className="flex flex-col gap-3 border border-sand bg-white p-5">
                <StarRating value={r.rating} size="h-3.5 w-3.5" />
                <blockquote className="whitespace-pre-line font-serif text-base italic leading-relaxed text-ink/80">{r.review}</blockquote>
                <footer className="mt-auto text-xs">
                  <span className="font-semibold text-ink">{r.user?.name ?? "Customer"}</span>
                  <span className="text-ink/45"> · {formatDate(r.createdAt)}</span>
                </footer>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
