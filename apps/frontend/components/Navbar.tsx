"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  Zap,
  Truck,
  ShieldCheck,
  Store,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Sparkles,
  MessageSquare,
  Star,
} from "lucide-react";
import ChatDrawer from "./ChatDrawer";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { totalItems, openCart } = useCart();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop Catalog", href: "/products" },
    { label: "Flash Sale", href: "/flash-sale", highlight: true },
    { label: "Vendors", href: "/vendors" },
    { label: "Blog", href: "/blogs" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-all">
      {/* 1. Announcement Top Bar */}
      <div className="bg-zinc-950 text-amber-100/80 text-xs py-2 px-4 border-b border-amber-900/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> BIS 916 Hallmarked Gold & Certified Natural Diamonds
            </span>
            <span className="hidden md:inline-block text-zinc-700">|</span>
            <span className="hidden md:flex items-center gap-1 text-zinc-400">
              <Truck className="w-3.5 h-3.5 text-amber-400" /> Complimentary Insured Express Delivery Worldwide
            </span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <Link
              href="/order-track"
              className="hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              Track Order
            </Link>
            <span>|</span>
            <Link
              href="/account/become-vendor"
              className="hover:text-amber-400 font-medium transition-colors"
            >
              Artisan Jeweller Portal
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-600 flex items-center justify-center text-zinc-950 font-extrabold shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              SJ
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                Sawariya<span className="text-amber-600 dark:text-amber-400">Jewels</span>
              </span>
              <span className="hidden sm:block text-[9px] tracking-widest text-zinc-400 uppercase -mt-0.5 font-medium">
                Fine Handcrafted Jewellery
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex flex-1 max-w-lg relative items-center mx-4"
          >
            <input
              type="text"
              placeholder="Search diamond rings, bridal kundan necklaces, gold bangles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1.5 px-4 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              Search
            </button>
          </form>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors flex items-center gap-1 ${
                  pathname === link.href
                    ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
                } ${link.highlight ? "text-amber-600 dark:text-amber-400 font-semibold" : ""}`}
              >
                {link.highlight && <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action Icons (Wishlist, Cart, Account) */}
          <div className="flex items-center gap-3">
            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors relative"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Live Chat Drawer Trigger */}
            <button
              onClick={() => setChatOpen(true)}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors relative"
              title="Live Messenger"
            >
              <MessageSquare className="w-5 h-5 text-amber-500" />
            </button>

            {/* Cart Trigger */}
            <button
              onClick={openCart}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors relative"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white rounded-full text-[11px] font-bold flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Account / Auth */}
            <div className="relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-200 dark:border-indigo-800">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="hidden sm:inline-block text-xs font-semibold text-zinc-800 dark:text-zinc-200 max-w-[90px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-2 z-50 animate-in fade-in">
                      <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="text-xs text-zinc-400">Signed in as</p>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {user.email}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          {user.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/account"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-zinc-400" />
                          Customer Profile & Orders
                        </Link>

                        <Link
                          href="/account/reviews"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Star className="w-4 h-4 text-amber-500" />
                          My Product Reviews
                        </Link>

                        {/* Vendor Portal Shortcut */}
                        {user.role === "VENDOR" && (
                          <Link
                            href="/vendor/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          >
                            <Store className="w-4 h-4" />
                            Vendor Merchant Portal
                          </Link>
                        )}

                        {/* Admin Control Panel Shortcut */}
                        {user.role === "ADMIN" && (
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Admin Control Panel
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="hidden sm:inline-flex px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Mobile Navigation Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-150">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative mb-4">
            <input
              type="text"
              placeholder="Search products, artisans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-20 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            <button
              type="submit"
              className="absolute right-1.5 top-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
            >
              Search
            </button>
          </form>

          {/* Links */}
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 font-semibold"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Live Real-Time Chat Drawer */}
      <ChatDrawer isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </header>
  );
}
