"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Heart, LayoutDashboard, LogOut, MapPin, Package, Star, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const item = "flex items-center gap-2.5 px-4 py-2 text-cream/90 transition-colors hover:bg-white/5";

export function UserMenu() {
  const { user, logout, isAdmin, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) {
    if (loading) return <span className="h-8 w-20" aria-hidden />;
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="rounded-full border border-gold bg-ink px-5 py-1.5 text-xs font-semibold tracking-wider text-parchment transition-colors hover:bg-ink-soft">
          Sign In
        </Link>
        <Link href="/register" className="hidden rounded-full px-3 py-1.5 text-xs font-semibold text-gold-light hover:underline md:inline-block">
          Register
        </Link>
      </div>
    );
  }

  const close = () => setOpen(false);
  return (
    <div className="relative" ref={root}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${user.name}`}
        className="flex items-center gap-2 rounded-full border border-gold/40 bg-ink-soft py-1.5 pl-2 pr-3 transition-colors hover:border-gold"
      >
        <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-gold text-xs font-bold text-ink-deep">
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </span>
        <span className="hidden max-w-[80px] truncate text-xs font-medium text-cream sm:inline-block">{user.name.split(" ")[0]}</span>
        <ChevronDown className="h-3.5 w-3.5 text-cream/60" aria-hidden />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-ink-soft bg-ink py-2 shadow-2xl">
          <div className="border-b border-ink-soft px-4 py-2">
            <p className="text-[11px] text-cream/60">Signed in as</p>
            <p className="truncate text-sm font-semibold text-white">{user.email}</p>
          </div>
          <div className="py-1 text-xs">
            <Link role="menuitem" href="/account" onClick={close} className={item}>
              <UserIcon className="h-4 w-4 text-cream/60" aria-hidden /> My account
            </Link>
            <Link role="menuitem" href="/account/orders" onClick={close} className={item}>
              <Package className="h-4 w-4 text-cream/60" aria-hidden /> Orders
            </Link>
            <Link role="menuitem" href="/account/wishlist" onClick={close} className={item}>
              <Heart className="h-4 w-4 text-cream/60" aria-hidden /> Wishlist
            </Link>
            <Link role="menuitem" href="/account/addresses" onClick={close} className={item}>
              <MapPin className="h-4 w-4 text-cream/60" aria-hidden /> Addresses
            </Link>
            <Link role="menuitem" href="/account/reviews" onClick={close} className={item}>
              <Star className="h-4 w-4 text-gold" aria-hidden /> My reviews
            </Link>
            {isAdmin && (
              <Link role="menuitem" href="/admin/dashboard" onClick={close} className={`${item} text-gold-light`}>
                <LayoutDashboard className="h-4 w-4" aria-hidden /> Admin
              </Link>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                close();
                void logout();
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-danger transition-colors hover:bg-danger/10"
            >
              <LogOut className="h-4 w-4" aria-hidden /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
