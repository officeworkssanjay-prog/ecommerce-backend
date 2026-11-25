import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";

/** Spec "empty cart" state (page and drawer). Only links to real routes. */
export function EmptyCart({ onNavigate, compact }: { onNavigate?: () => void; compact?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? "h-full py-12" : "py-20"}`}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-parchment text-gold-dark">
        <ShoppingBag className="h-8 w-8" aria-hidden />
      </div>
      <h2 className="mb-1 font-serif text-2xl text-ink">Your cart is empty</h2>
      <p className="mb-6 max-w-xs text-sm text-ink/60">Looks like you haven&apos;t added anything yet. Let&apos;s find something you&apos;ll love.</p>
      <Link href="/products" onClick={onNavigate} className={buttonClasses("primary", "md")}>
        Start shopping
      </Link>
    </div>
  );
}
