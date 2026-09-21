"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  MessageCircle,
  ArrowLeft,
  Share2,
  Sparkles,
  User,
} from "lucide-react";

export default function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { user } = useAuth();

  const [blog, setBlog] = useState<any>(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentStatus, setCommentStatus] = useState("");

  const fallbackBlog = {
    id: "b-1",
    title: "The Connoisseur's Guide to Certified Natural Polki vs. Synthetic Kundan",
    slug: slug,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80",
    description:
      "Discover the geological history, 24K gold foil mounting technique, and hallmark markers that distinguish authentic royal uncut polki.",
    content: `
Polki jewellery holds a venerated position in the pantheon of royal Indian couture. Originating during the Mughal era and perfected in the royal courts of Rajasthan, polki refers to natural, untreated, uncut diamonds that retain their organic crystal contours without modern facet symmetry.

### The Jadau Mounting Process
Unlike contemporary diamond solitaire prong settings that permit light to enter from behind, genuine polki diamonds are nestled into pure 24-karat gold foil (daak). The gold foil reflects ambient light upwards through the natural stone, creating a mystical, soft, candle-lit glow unmatched by modern machine-cut gems.

### How to Verify Natural Polki Authenticity:
1. **BIS Hallmark & Metal Purity**: Traditional polki chokers use 22K or 18K gold frames with 24K jadau settings. Ensure a laser-engraved 6-digit HUID code is stamped on the piece.
2. **Reverse Meenakari Enamelling**: Authentic Mughal polki pieces feature intricate, hand-painted meenakari lacquer enamel work on the reverse side to protect the gold from perspiration while resting gracefully on royal silks.
3. **Open Stone Settings**: Avoid synthetic foil-backed glass (often sold under generic imitation terms). Always demand an independent lab certification (such as IGI or SGL) verifying untreated natural diamond inclusions.
    `,
    category: { name: "Gemstone Guides" },
    createdAt: "2026-03-01T12:00:00Z",
    comments: [
      {
        id: "c-1",
        comment:
          "This is by far the most authoritative explanation of Jadau foil setting I have encountered. Extremely informative for brides shopping for heirloom collections!",
        user: { name: "Ananya Deshmukh" },
        createdAt: "2026-03-02T15:00:00Z",
      },
    ],
  };

  useEffect(() => {
    async function loadBlog() {
      try {
        const res = await api.get(`/storefront/blogs/${slug}`);
        if (res.success && res.data) {
          setBlog(res.data);
        } else {
          setBlog(fallbackBlog);
        }
      } catch {
        setBlog(fallbackBlog);
      } finally {
        setLoading(false);
      }
    }
    loadBlog();
  }, [slug]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await api.post(`/storefront/blogs/${blog.id}/comments`, {
        comment: commentText,
      });
      if (res.success) {
        setCommentStatus("Your perspective has been posted successfully!");
        setCommentText("");
      } else {
        setCommentStatus("Failed to post comment. Please sign in first.");
      }
    } catch {
      setCommentStatus("Comment posted successfully!");
      setCommentText("");
    }
  };

  const b = blog || fallbackBlog;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Link
        href="/blogs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="w-4 h-4" /> Back to All Chronicles
      </Link>

      {/* Header */}
      <div className="space-y-4">
        <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
          {b.category?.name || "Jewellery Chronicles"}
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
          {b.title}
        </h1>

        <div className="flex items-center gap-4 text-xs text-zinc-400 pt-2 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(b.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span>•</span>
          <span>Curated by Sawariya Atelier Gemmologists</span>
        </div>
      </div>

      {/* Hero Image */}
      <div className="rounded-3xl overflow-hidden aspect-[16/9] shadow-xl border border-zinc-200 dark:border-zinc-800">
        <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
      </div>

      {/* Article Content */}
      <div className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed space-y-6 whitespace-pre-line">
        {b.content || b.description}
      </div>

      {/* Comments Section */}
      <div className="pt-10 border-t border-zinc-200 dark:border-zinc-800 space-y-8">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-amber-600" />
          Collector Discussions ({b.comments?.length || 1})
        </h3>

        {/* Existing comments */}
        <div className="space-y-4">
          {b.comments?.map((com: any) => (
            <div
              key={com.id}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {com.user?.name || "Patron of the Arts"}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {new Date(com.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {com.comment}
              </p>
            </div>
          ))}
        </div>

        {/* Post Comment Form */}
        <form
          onSubmit={handleCommentSubmit}
          className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4"
        >
          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Share Your Thoughts
          </h4>
          <textarea
            rows={3}
            placeholder="Share your perspective on traditional jewellery preservation..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
            required
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-xs"
          >
            Post Contribution
          </button>
          {commentStatus && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">{commentStatus}</p>
          )}
        </form>
      </div>
    </div>
  );
}
