"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BadgePercent,
  BookOpen,
  Boxes,
  FolderTree,
  Gem,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Mail,
  Megaphone,
  Menu,
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
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
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
    <nav aria-label="Admin" className="flex flex-col gap-5">
      {NAV.map((section) => (
        <div key={section.group}>
          <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-widest text-gold-light/70">{section.group}</p>
          <ul className="flex flex-col gap-0.5">
            {section.items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", active ? "bg-gold text-ink-deep font-semibold" : "text-cream/80 hover:bg-ink-soft")}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
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

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <aside className="hidden w-60 shrink-0 bg-ink-deep px-3 py-6 lg:block">
        <p className="mb-6 flex items-center gap-2 px-3 font-serif text-lg text-gold-light">
          <Gem className="h-5 w-5" aria-hidden /> Store admin
        </p>
        {nav}
      </aside>

      <div className="flex items-center justify-between bg-ink-deep px-4 py-3 text-cream lg:hidden">
        <span className="flex items-center gap-2 font-serif text-lg text-gold-light">
          <Boxes className="h-5 w-5" aria-hidden /> Store admin
        </span>
        <button type="button" onClick={() => setOpenFor(open ? null : pathname)} aria-expanded={open} aria-label="Toggle admin menu" className="rounded p-1.5 hover:bg-ink-soft">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && <div className="bg-ink-deep px-3 pb-5 lg:hidden">{nav}</div>}

      <div className="min-w-0 flex-1 bg-cream px-4 py-6 sm:px-8 sm:py-8">{children}</div>
    </div>
  );
}
