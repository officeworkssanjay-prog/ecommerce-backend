"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Heart, Menu, MessageSquare, Search, ShoppingBag, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/cn";
import ChatDrawer from "./ChatDrawer";
import { ActiveCategoryNav, CategoryNav } from "./nav/CategoryNav";
import { MobileMenu } from "./nav/MobileMenu";
import { SearchPanel } from "./nav/SearchPanel";
import { UserMenu } from "./nav/UserMenu";
import { useCategories } from "./nav/useCategories";
import { useWishlistCount } from "./nav/useWishlistCount";

const iconBtn = "relative rounded-full p-2 text-cream/90 transition-colors hover:bg-white/5 hover:text-white";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  const { totalItems, openCart } = useCart();
  const categories = useCategories();
  const wishlistCount = useWishlistCount();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Close everything on navigation
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setSearchOpen(false);
    setMobileOpen(false);
  }

  // Close the search panel on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSearchOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const search = (q: string) => {
    setQuery(q);
    setSearchOpen(false);
    setMobileOpen(false);
    router.push(`/products?search=${encodeURIComponent(q)}`);
  };

  const canChat = !!user && !isAdmin;

  return (
    <header className="sticky top-0 z-50 w-full font-sans">
      <div className="border-b border-ink-soft bg-ink text-white shadow-md">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-[76px] items-center justify-between">
            <Link href="/" className="flex shrink-0 items-center rounded-lg bg-white px-3 py-1.5 shadow-sm transition-opacity hover:opacity-95">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/figma/logo.png" alt="Sawariya Jewels, home" className="h-8 w-auto object-contain sm:h-9" />
            </Link>

            <Suspense fallback={<CategoryNav activeKey={null} />}>
              <ActiveCategoryNav />
            </Suspense>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-expanded={searchOpen}
                aria-label="Search the store"
                className={cn(iconBtn, searchOpen && "bg-white/10 text-gold")}
              >
                <Search className="h-5 w-5 stroke-[1.8]" aria-hidden />
              </button>

              <Link href="/account/wishlist" aria-label={`Wishlist, ${wishlistCount} ${wishlistCount === 1 ? "item" : "items"}`} className={iconBtn}>
                <Heart className="h-5 w-5 stroke-[1.8]" aria-hidden />
                {wishlistCount > 0 && (
                  <span aria-hidden className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold leading-none text-ink-deep">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {canChat && (
                <button type="button" onClick={() => setChatOpen(true)} aria-label="Chat with the store" className={iconBtn}>
                  <MessageSquare className="h-5 w-5 stroke-[1.8]" aria-hidden />
                </button>
              )}

              <button type="button" onClick={openCart} aria-label={`Open cart, ${totalItems} ${totalItems === 1 ? "item" : "items"}`} className={iconBtn}>
                <ShoppingBag className="h-5 w-5 stroke-[1.8]" aria-hidden />
                {totalItems > 0 && (
                  <span aria-hidden className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold leading-none text-ink-deep">
                    {totalItems}
                  </span>
                )}
              </button>

              <UserMenu />

              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                className="rounded-lg p-2 text-cream/90 hover:bg-white/5 hover:text-white lg:hidden"
              >
                {mobileOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {searchOpen && <SearchPanel query={query} onQuery={setQuery} onSubmit={search} suggestions={categories.slice(0, 6).map((c) => c.name)} />}
      {mobileOpen && <MobileMenu id="mobile-menu" query={query} onQuery={setQuery} onSubmit={search} onNavigate={() => setMobileOpen(false)} />}

      {canChat && <ChatDrawer isOpen={chatOpen} onClose={() => setChatOpen(false)} />}
    </header>
  );
}
