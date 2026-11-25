"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageCircle } from "lucide-react";
import { BlogCommentSchema } from "@ecommerce/shared-types";
import type { z } from "zod";
import { api } from "@/lib/api";
import { applyServerErrors } from "@/lib/forms";
import { formatDate } from "@/lib/format";
import type { Blog } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { FormError, Textarea } from "@/components/ui/Field";
import { useFeedback } from "@/components/ui/Feedback";

type Comment = NonNullable<Blog["comments"]>[number];
type CommentInput = z.input<typeof BlogCommentSchema>;

export function CommentSection({ blogId, initial }: { blogId: string; initial: Comment[] }) {
  const { user, loading } = useAuth();
  const { toast } = useFeedback();
  const pathname = usePathname();
  const [comments, setComments] = useState<Comment[]>(initial);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentInput>({ resolver: zodResolver(BlogCommentSchema), defaultValues: { comment: "" } });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const res = await api.post<Comment>(`/storefront/blogs/${blogId}/comments`, values);
      setComments((prev) => [res.data, ...prev]);
      reset();
      toast.success(res.message || "Comment posted");
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  return (
    <section aria-labelledby="comments-heading" className="space-y-8 border-t border-sand pt-10">
      <h2 id="comments-heading" className="flex items-center gap-2 font-serif text-xl font-bold text-ink">
        <MessageCircle className="h-5 w-5 text-gold-dark" aria-hidden />
        Discussion ({comments.length})
      </h2>

      <ul className="space-y-4" aria-live="polite">
        {comments.length === 0 && <li className="text-sm text-ink/50">No comments yet. Start the conversation.</li>}
        {comments.map((c) => (
          <li key={c.id} className="space-y-1.5 rounded-2xl border border-sand bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">{c.user.name}</span>
              <span className="text-[11px] text-ink/45">{formatDate(c.createdAt)}</span>
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink/70">{c.comment}</p>
          </li>
        ))}
      </ul>

      {loading ? null : user ? (
        <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-3xl border border-sand bg-parchment/30 p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Share your thoughts</h3>
          <Textarea label="Your comment" rows={3} error={errors.comment?.message} {...register("comment")} />
          <FormError message={formError} />
          <Button type="submit" loading={isSubmitting}>
            Post Comment
          </Button>
        </form>
      ) : (
        <p className="rounded-3xl border border-sand bg-parchment/30 p-6 text-sm text-ink/70">
          <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="font-semibold text-gold-dark underline">
            Sign in
          </Link>{" "}
          to join the discussion.
        </p>
      )}
    </section>
  );
}
