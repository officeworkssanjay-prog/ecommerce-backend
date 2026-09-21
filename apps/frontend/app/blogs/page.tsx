"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  MessageCircle,
} from "lucide-react";

function BlogsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentCat = searchParams.get("category") || "";

  const [blogs, setBlogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultBlogs = [
    {
      id: "b-1",
      title: "The Connoisseur's Guide to Certified Natural Polki vs. Synthetic Kundan",
      slug: "connoisseurs-guide-polki-diamonds-vs-synthetic-kundan",
      image:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
      description:
        "Discover the geological history, 24K gold foil mounting technique, and hallmark markers that distinguish authentic royal uncut polki.",
      category: { name: "Gemstone Guides", slug: "gemstone-guides" },
      createdAt: "2026-03-01T12:00:00Z",
      _count: { comments: 8 },
    },
    {
      id: "b-2",
      title: "Caring for 22K Heritage Gold & Antique Nakshi Temple Jewellery",
      slug: "caring-for-22k-heritage-gold-antique-temple-jewellery",
      image:
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
      description:
        "Preserve the antique oxidized patina and structural security of your handcrafted solid gold heirloom temple ornaments.",
      category: { name: "Jewellery Care", slug: "jewellery-care" },
      createdAt: "2026-02-18T10:00:00Z",
      _count: { comments: 14 },
    },
    {
      id: "b-3",
      title: "Solitaire Cut Comparison: Round Brilliant vs. Emerald Cut Diamonds",
      slug: "solitaire-cut-comparison-round-vs-emerald-cut",
      image:
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
      description:
        "How table facets, light dispersion, and clarity grades affect the radiance of engagement solitaires.",
      category: { name: "Diamond Education", slug: "diamond-education" },
      createdAt: "2026-01-25T14:30:00Z",
      _count: { comments: 5 },
    },
  ];

  const defaultCategories = [
    { name: "Gemstone Guides", slug: "gemstone-guides" },
    { name: "Jewellery Care", slug: "jewellery-care" },
    { name: "Diamond Education", slug: "diamond-education" },
    { name: "Bridal Styling", slug: "bridal-styling" },
  ];

  useEffect(() => {
    async function loadBlogs() {
      try {
        const query = currentCat ? `?category=${currentCat}` : "";
        const res = await api.get(`/storefront/blogs${query}`);
        if (res.success && res.data?.blogs?.length > 0) {
          setBlogs(res.data.blogs);
          if (res.data.categories) setCategories(res.data.categories);
        } else {
          setBlogs(defaultBlogs);
          setCategories(defaultCategories);
        }
      } catch {
        setBlogs(defaultBlogs);
        setCategories(defaultCategories);
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, [currentCat]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Header */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950 via-zinc-900 to-zinc-950 p-8 sm:p-12 text-white border border-amber-800/30">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" /> High Jewellery Journal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            The Jeweller's Chronicles & Guides
          </h1>
          <p className="text-sm text-amber-100/70 leading-relaxed">
            Essential knowledge for discerning collectors: master gemstone education, historical
            goldsmithing techniques, and fine jewellery styling insights.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => router.push("/blogs")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            !currentCat
              ? "bg-amber-600 text-white"
              : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-amber-500"
          }`}
        >
          All Chronicles
        </button>
        {categories.map((c: any) => (
          <button
            key={c.slug || c.name}
            onClick={() => router.push(`/blogs?category=${c.slug || c.name}`)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              currentCat === (c.slug || c.name)
                ? "bg-amber-600 text-white"
                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-amber-500"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((b) => (
          <article
            key={b.id}
            className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden hover:shadow-xl transition-all group flex flex-col justify-between"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              <img
                src={b.image || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800"}
                alt={b.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                {b.category?.name || "Education"}
              </span>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(b.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" /> {b._count?.comments || 4} Comments
                  </span>
                </div>

                <Link href={`/blogs/${b.slug}`}>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 transition-colors leading-snug line-clamp-2">
                    {b.title}
                  </h3>
                </Link>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                  {b.description}
                </p>
              </div>

              <Link
                href={`/blogs/${b.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline pt-2"
              >
                Read Full Article <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function BlogsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-sm text-zinc-400">Loading journal...</div>}>
      <BlogsContent />
    </Suspense>
  );
}
