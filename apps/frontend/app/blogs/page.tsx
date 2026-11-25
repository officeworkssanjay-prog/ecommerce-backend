import { Suspense } from "react";
import { BookOpen } from "lucide-react";
import { PageLoader } from "@/components/ui/States";
import { BlogsView } from "@/components/blog/BlogsView";

export const metadata = {
  title: "Journal",
  description: "Jewellery guides, care tips and styling insights from Sawariya Jewels.",
};

export default function BlogsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-gold-dark/30 bg-gradient-to-r from-ink-deep via-ink to-ink-soft p-8 text-white sm:p-12">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-light">
            <BookOpen className="h-3.5 w-3.5" aria-hidden /> The Jewellery Journal
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">Guides & Stories from the Atelier</h1>
          <p className="text-sm leading-relaxed text-white/70">Gemstone education, goldsmithing heritage and fine jewellery styling insights.</p>
        </div>
      </div>
      <Suspense fallback={<PageLoader label="Loading journal…" />}>
        <BlogsView />
      </Suspense>
    </div>
  );
}
