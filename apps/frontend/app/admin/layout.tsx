"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BadgePercent,
  BookOpen,
  Boxes,
  FolderTree,
  ExternalLink,
  Gem,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  Menu,
  BellRing,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Star,
  Tags,
  Truck,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/ui/States";
import { cn } from "@/lib/cn";

const NAV = [
  { group: "Overview", items: [{ href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  {
    group: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/users", label: "Customers", icon: Users },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    group: "Catalogue",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/brands", label: "Brands", icon: Tags },
    ],
  },
  {
    group: "Marketing",
    items: [
      { href: "/admin/coupons", label: "Coupons", icon: BadgePercent },
      { href: "/admin/flash-sale", label: "Flash sale", icon: Zap },
      { href: "/admin/sliders", label: "Hero sliders", icon: ImageIcon },
      { href: "/admin/advertisements", label: "Banners", icon: Megaphone },
      { href: "/admin/subscribers", label: "Newsletter", icon: Mail },
    ],
  },
  {
    group: "Content",
    items: [
      { href: "/admin/blogs", label: "Blog posts", icon: BookOpen },
      { href: "/admin/comments", label: "Comments", icon: MessageSquare },
      { href: "/admin/messages", label: "Messages", icon: Inbox },
    ],
  },
  {
    group: "Store",
    items: [
      { href: "/admin/shipping", label: "Shipping", icon: Truck },
      { href: "/admin/pincodes", label: "Pincodes", icon: MapPin },
      { href: "/admin/stock-alerts", label: "Stock alerts", icon: BellRing },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  // The mobile menu is "open for" one path, so navigating anywhere closes it without an effect.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;

  // proxy.ts already blocks non-admins; this covers a session that expires while the page is open.
  useEffect(() => {
    if (!loading && !isAdmin) router.replace(user ? "/" : `/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, isAdmin, user, router, pathname]);

  if (loading || !isAdmin) return <PageLoader label="Checking your access…" />;

  const nav = (
    <nav aria-label="Admin" className="flex flex-col gap-6">
      {NAV.map((section) => (
        <div key={section.group}>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-gold-light/60">{section.group}</p>
          <ul className="flex flex-col gap-0.5">
            {section.items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm transition-colors",
                      active ? "border-gold bg-gold/15 font-semibold text-gold-light" : "border-transparent text-cream/75 hover:bg-ink-soft hover:text-cream"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const brand = (
    <span className="flex items-center gap-2 font-serif text-lg text-gold-light">
      <Gem className="h-5 w-5" aria-hidden /> Sawariya Admin
    </span>
  );

  return (
    <div className="flex min-h-screen flex-1 bg-cream">
      {/* Desktop sidebar: pinned to the viewport; only its own list scrolls */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-ink-soft bg-ink-deep lg:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-ink-soft px-6">{brand}</div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-5 [scrollbar-color:#2e1c1f_transparent] [scrollbar-width:thin]">{nav}</div>
        <div className="shrink-0 border-t border-ink-soft p-3">
          <button type="button" onClick={() => void logout().then(() => router.replace("/login"))} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-cream/75 hover:bg-ink-soft hover:text-cream">
            <LogOut className="h-4 w-4" aria-hidden /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close admin menu" className="absolute inset-0 bg-black/50" onClick={() => setOpenFor(null)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-ink-deep shadow-xl">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink-soft px-5">
              {brand}
              <button type="button" onClick={() => setOpenFor(null)} aria-label="Close admin menu" className="rounded p-1.5 text-cream hover:bg-ink-soft">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-5">{nav}</div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-sand bg-white/90 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setOpenFor(pathname)} aria-expanded={open} aria-label="Open admin menu" className="rounded p-1.5 text-ink hover:bg-parchment lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <span className="lg:hidden">
              <Boxes className="h-5 w-5 text-gold-dark" aria-hidden />
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" target="_blank" className="inline-flex items-center gap-1.5 text-ink/70 hover:text-gold-dark">
              <ExternalLink className="h-4 w-4" aria-hidden /> View store
            </Link>
            <span className="hidden items-center gap-2 sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-deep text-xs font-semibold text-gold-light" aria-hidden>
                {(user?.name ?? "A").slice(0, 1).toUpperCase()}
              </span>
              <span className="font-medium text-ink">{user?.name}</span>
            </span>
          </div>
        </header>
        <div className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</div>
      </div>
    </div>
  );
}
