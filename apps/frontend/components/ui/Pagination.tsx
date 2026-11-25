import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/** Page buttons with ellipses. Calls onChange(page) (1-based). */
export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  const btn = "flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm transition-colors";
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5">
      <button type="button" className={cn(btn, "border-sand hover:bg-parchment disabled:opacity-40")} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-ink/40">
            …
          </span>
        ) : (
          <button key={p} type="button" aria-current={p === page ? "page" : undefined} className={cn(btn, p === page ? "border-gold bg-gold font-semibold text-ink-deep" : "border-sand hover:bg-parchment")} onClick={() => onChange(p)}>
            {p}
          </button>
        )
      )}
      <button type="button" className={cn(btn, "border-sand hover:bg-parchment disabled:opacity-40")} disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
