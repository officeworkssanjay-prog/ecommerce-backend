"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { formatDate } from "@/lib/format";
import type { Blog } from "@/lib/types";
import { buttonClasses } from "@/components/ui/Button";
import { ErrorState, PageLoader } from "@/components/ui/States";
import { CommentSection } from "@/components/blog/CommentSection";

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: blog, loading, error, message, reload } = useApi(async () => (await api.get<Blog>(`/storefront/blogs/${encodeURIComponent(slug)}`)).data, [slug]);

  if (loading && !blog) return <PageLoader label="Loading article…" className="min-h-[60vh]" />;
  if (error?.isNotFound) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="font-serif text-2xl text-ink">Article not found</h1>
        <p className="text-sm text-ink/60">{message}</p>
        <Link href="/blogs" className={buttonClasses("primary", "md")}>
          Back to the journal
        </Link>
      </div>
    );
  }
  if (error || !blog) return <ErrorState message={message} onRetry={reload} />;

  // The description is plain text: render it as paragraphs, never as HTML.
  const paragraphs = blog.description.split(/\n+/).map((p) => p.trim()).filter(Boolean);

  return (
    <article className="mx-auto max-w-4xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/blogs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/60 hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to all articles
      </Link>

      <header className="space-y-4">
        {blog.category?.name && <span className="inline-block rounded-full bg-parchment px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-dark">{blog.category.name}</span>}
        <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">{blog.title}</h1>
        <p className="flex items-center gap-4 border-b border-sand pb-4 pt-2 text-xs text-ink/50">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" aria-hidden />
            <time dateTime={blog.createdAt}>{formatDate(blog.createdAt)}</time>
          </span>
          <span aria-hidden>•</span>
          <span>By the Sawariya Jewels team</span>
        </p>
      </header>

      <div className="aspect-[16/9] overflow-hidden rounded-3xl border border-sand shadow-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={blog.image} alt={blog.title} className="h-full w-full object-cover" />
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-ink/80 sm:text-base">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <CommentSection key={blog.id} blogId={blog.id} initial={blog.comments ?? []} />
    </article>
  );
}
