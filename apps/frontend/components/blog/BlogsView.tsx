"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, BookOpen, Calendar, MessageCircle } from "lucide-react";
import { api, qs } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { formatDate } from "@/lib/format";
import type { Blog, BlogCategory, Pagination as PaginationInfo } from "@/lib/types";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState, ErrorState, PageLoader } from "@/components/ui/States";
import { cn } from "@/lib/cn";

const LIMIT = 9;

interface BlogsResponse {
  blogs: Blog[];
  categories: BlogCategory[];
  pagination: PaginationInfo;
}

const pill = (active: boolean) =>
  cn("rounded-xl px-4 py-2 text-xs font-bold transition-colors", active ? "bg-gold text-ink-deep" : "border border-sand bg-white text-ink/70 hover:border-gold");

export function BlogsView() {
  const router = useRouter();
  const params = useSearchParams();
  const category = params.get("category") ?? "";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const query = qs({ category, page, limit: LIMIT });
  const { data, loading, message, reload } = useApi(async () => (await api.get<BlogsResponse>(`/storefront/blogs${query}`)).data, [query]);

  const go = (nextCategory: string, nextPage = 1) => {
    const s = qs({ category: nextCategory, page: nextPage > 1 ? nextPage : undefined });
    router.push(`/blogs${s}`);
  };

  if (loading && !data) return <PageLoader label="Loading journal…" />;
  if (!data) return <ErrorState message={message} onRetry={reload} />;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter articles by category">
        <button type="button" aria-pressed={!category} onClick={() => go("")} className={pill(!category)}>
          All Articles
        </button>
        {data.categories.map((c) => (
          <button key={c.id} type="button" aria-pressed={category === c.slug} onClick={() => go(c.slug)} className={pill(category === c.slug)}>
            {c.name}
          </button>
        ))}
      </div>

      {data.blogs.length === 0 ? (
        <EmptyState icon={<BookOpen className="h-10 w-10" aria-hidden />} title="No articles yet" description="There is nothing published in this section. Please check back soon." />
      ) : (
        <div aria-busy={loading} className={cn("grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3", loading && "opacity-60")}>
          {data.blogs.map((b) => (
            <article key={b.id} className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-sand bg-white transition-all hover:shadow-xl">
              <div className="relative aspect-[16/10] overflow-hidden bg-parchment">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                {b.category?.name && <span className="absolute left-3 top-3 rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-light backdrop-blur-md">{b.category.name}</span>}
              </div>
              <div className="flex flex-1 flex-col justify-between space-y-4 p-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[11px] text-ink/45">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" aria-hidden />
                      {formatDate(b.createdAt)}
                    </span>
                    <span aria-hidden>•</span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden /> {b._count?.comments ?? 0} Comments
                    </span>
                  </div>
                  <Link href={`/blogs/${b.slug}`}>
                    <h2 className="line-clamp-2 font-serif text-base font-bold leading-snug text-ink transition-colors group-hover:text-gold-dark">{b.title}</h2>
                  </Link>
                  <p className="line-clamp-3 text-xs leading-relaxed text-ink/65">{b.description}</p>
                </div>
                <Link href={`/blogs/${b.slug}`} className="inline-flex items-center gap-1.5 pt-2 text-xs font-bold text-gold-dark hover:underline">
                  Read Full Article <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onChange={(p) => go(category, p)} />
    </div>
  );
}
