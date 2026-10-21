"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Star,
  ArrowRight,
} from "lucide-react";
import ChatDrawer from "./ChatDrawer";

// Mega menu data tailored for each jewelry category
interface MegaMenuData {
  title: string;
  subcategories: { name: string; href: string }[];
  prices: { label: string; href: string }[];
  banner: {
    title: string;
    badge: string;
    image: string;
    href: string;
  };
}

const MEGA_MENUS: Record<string, MegaMenuData> = {
  Necklace: {
    title: "Necklace",
    subcategories: [
      { name: "Chokers", href: "/products?category=necklace&sub=chokers" },
      { name: "Long Haram", href: "/products?category=necklace&sub=long-haram" },
      { name: "Layered Chains", href: "/products?category=necklace&sub=layered-chains" },
      { name: "Pendant Sets", href: "/products?category=necklace&sub=pendant-sets" },
    ],
    prices: [
      { label: "Under ₹999", href: "/products?category=necklace&maxPrice=999" },
      { label: "₹1,000–₹2,499", href: "/products?category=necklace&minPrice=1000&maxPrice=2499" },
      { label: "₹2,500–₹4,999", href: "/products?category=necklace&minPrice=2500&maxPrice=4999" },
      { label: "Above ₹5,000", href: "/products?category=necklace&minPrice=5000" },
    ],
    banner: {
      title: "Royal Heritage Chokers",
      badge: "New in Necklace",
      image: "/images/figma/curated-large.png",
      href: "/products?category=necklace",
    },
  },
  Bangles: {
    title: "Bangles",
    subcategories: [
      { name: "Temple Kadas", href: "/products?category=bangles&sub=temple-kadas" },
      { name: "CZ Stone Bangles", href: "/products?category=bangles&sub=cz-bangles" },
      { name: "Antique Gold Bangles", href: "/products?category=bangles&sub=antique-gold" },
      { name: "Daily Wear Bangles", href: "/products?category=bangles&sub=daily-wear" },
    ],
    prices: [
      { label: "Under ₹999", href: "/products?category=bangles&maxPrice=999" },
      { label: "₹1,000–₹2,499", href: "/products?category=bangles&minPrice=1000&maxPrice=2499" },
      { label: "₹2,500–₹4,999", href: "/products?category=bangles&minPrice=2500&maxPrice=4999" },
      { label: "Above ₹5,000", href: "/products?category=bangles&minPrice=5000" },
    ],
    banner: {
      title: "Handcrafted 22K Kadas",
      badge: "New in Bangles",
      image:
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80",
      href: "/products?category=bangles",
    },
  },
  Earrings: {
    title: "Earrings",
    subcategories: [
      { name: "Jhumkas", href: "/products?category=earrings&sub=jhumkas" },
      { name: "Chandbalis", href: "/products?category=earrings&sub=chandbalis" },
      { name: "Studs & Tops", href: "/products?category=earrings&sub=studs" },
      { name: "Danglers & Drops", href: "/products?category=earrings&sub=danglers" },
    ],
    prices: [
      { label: "Under ₹999", href: "/products?category=earrings&maxPrice=999" },
      { label: "₹1,000–₹2,499", href: "/products?category=earrings&minPrice=1000&maxPrice=2499" },
      { label: "₹2,500–₹4,999", href: "/products?category=earrings&minPrice=2500&maxPrice=4999" },
      { label: "Above ₹5,000", href: "/products?category=earrings&minPrice=5000" },
    ],
    banner: {
      title: "Heritage Polki Chandbalis",
      badge: "Trending Earrings",
      image:
        "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=80",
      href: "/products?category=earrings",
    },
  },
  Rings: {
    title: "Rings",
    subcategories: [
      { name: "Solitaire Rings", href: "/products?category=rings&sub=solitaire" },
      { name: "Kundan & Polki Rings", href: "/products?category=rings&sub=kundan" },
      { name: "Statement Cocktail Rings", href: "/products?category=rings&sub=statement" },
      { name: "Adjustable Floral Bands", href: "/products?category=rings&sub=adjustable" },
    ],
    prices: [
      { label: "Under ₹999", href: "/products?category=rings&maxPrice=999" },
      { label: "₹1,000–₹2,499", href: "/products?category=rings&minPrice=1000&maxPrice=2499" },
      { label: "₹2,500–₹4,999", href: "/products?category=rings&minPrice=2500&maxPrice=4999" },
      { label: "Above ₹5,000", href: "/products?category=rings&minPrice=5000" },
    ],
    banner: {
      title: "Solitaire Diamonds",
      badge: "New in Rings",
      image:
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80",
      href: "/products?category=rings",
    },
  },
  Bridal: {
    title: "Bridal",
    subcategories: [
      { name: "Complete Bridal Sets", href: "/products?category=bridal&sub=complete-sets" },
      { name: "Matha Patti & Maang Tikka", href: "/products?category=bridal&sub=maang-tikka" },
      { name: "Nath & Nose Rings", href: "/products?category=bridal&sub=nath" },
      { name: "Haathphool & Bajuband", href: "/products?category=bridal&sub=haathphool" },
    ],
    prices: [
      { label: "Under ₹1,999", href: "/products?category=bridal&maxPrice=1999" },
      { label: "₹2,000–₹4,999", href: "/products?category=bridal&minPrice=2000&maxPrice=4999" },
      { label: "₹5,000–₹9,999", href: "/products?category=bridal&minPrice=5000&maxPrice=9999" },
      { label: "Above ₹10,000", href: "/products?category=bridal&minPrice=10000" },
    ],
    banner: {
      title: "Imperial Bridal Trousseau",
      badge: "Bridal Couture",
      image:
        "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80",
      href: "/products?category=bridal",
    },
  },
  "Anklets & Others": {
    title: "Anklets & Others",
    subcategories: [
      { name: "Bridal Payal Sets", href: "/products?category=anklets&sub=payal" },
      { name: "Kundan Anklets", href: "/products?category=anklets&sub=kundan-anklets" },
      { name: "Kamarbandh / Waist Belts", href: "/products?category=others&sub=kamarbandh" },
      { name: "Brooches & Hair Accessories", href: "/products?category=others&sub=brooches" },
    ],
    prices: [
      { label: "Under ₹999", href: "/products?category=anklets&maxPrice=999" },
      { label: "₹1,000–₹2,499", href: "/products?category=anklets&minPrice=1000&maxPrice=2499" },
      { label: "₹2,500–₹4,999", href: "/products?category=anklets&minPrice=2500&maxPrice=4999" },
      { label: "Above ₹5,000", href: "/products?category=anklets&minPrice=5000" },
    ],
    banner: {
      title: "Antique Silver Adornments",
      badge: "Traditional Accents",
      image:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80",
      href: "/products?category=anklets",
    },
  },
};

const QUICK_SEARCH_PILLS = [
  "Bridal Sets",
  "Jhumkas",
  "Bangles",
  "Layered Chains",
  "Earrings",
  "Rings",
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { totalItems, openCart } = useCart();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [wishlistCount] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Close menus on page route change
  useEffect(() => {
    setSearchOpen(false);
    setActiveCategory(null);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveCategory(null);
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const handlePillClick = (term: string) => {
    setSearchQuery(term);
    router.push(`/products?search=${encodeURIComponent(term)}`);
    setSearchOpen(false);
  };

  // Toggle mega menu on CLICK
  const handleCategoryClick = (cat: { label: string; href: string; isSale?: boolean }) => {
    if (cat.isSale) {
      setActiveCategory(null);
      router.push(cat.href);
      return;
    }
    if (MEGA_MENUS[cat.label]) {
      setSearchOpen(false); // close search if open
      setActiveCategory((prev) => (prev === cat.label ? null : cat.label));
    } else {
      setActiveCategory(null);
      router.push(cat.href);
    }
  };

  const categories = [
    { label: "Bangles", href: "/products?category=bangles" },
    { label: "Necklace", href: "/products?category=necklace" },
    { label: "Earrings", href: "/products?category=earrings" },
    { label: "Rings", href: "/products?category=rings" },
    { label: "Bridal", href: "/products?category=bridal" },
    { label: "Anklets & Others", href: "/products?category=anklets" },
    { label: "Sale", href: "/flash-sale", isSale: true },
  ];

  return (
    <header ref={headerRef} className="sticky top-0 z-50 w-full font-sans select-none">
      {/* 1. MAIN DARK NAVBAR */}
      <div className="bg-[#221517] text-white border-b border-[#362024] shadow-md transition-all">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[74px]">
            {/* BRAND LOGO CARD */}
            <Link
              href="/"
              className="flex-shrink-0 group flex items-center bg-white px-3 py-1.5 rounded-lg shadow-sm hover:opacity-95 transition-all"
            >
              <img
                src="/images/figma/logo.png"
                alt="Sawariya Arts Fine Jewels"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>

            {/* DESKTOP CATEGORY LINKS (CLICK TRIGGERED) */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 h-full">
              {categories.map((cat) => (
                <div key={cat.label} className="h-full flex items-center">
                  <button
                    type="button"
                    onClick={() => handleCategoryClick(cat)}
                    className={`text-[14.5px] font-medium tracking-wide transition-colors relative py-2 flex items-center gap-1 cursor-pointer ${
                      cat.isSale
                        ? "text-[#e56767] font-semibold hover:text-[#ff7878]"
                        : activeCategory === cat.label
                        ? "text-[#e8c792]"
                        : "text-zinc-100 hover:text-[#e8c792]"
                    }`}
                  >
                    <span>{cat.label}</span>
                    {MEGA_MENUS[cat.label] && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          activeCategory === cat.label
                            ? "rotate-180 text-[#caa15e]"
                            : "text-zinc-400 group-hover:text-zinc-200"
                        }`}
                      />
                    )}
                    {activeCategory === cat.label && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#caa15e] rounded-full" />
                    )}
                  </button>
                </div>
              ))}
            </nav>

            {/* RIGHT ACTIONS: Search, Wishlist, Cart, Sign In */}
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Search Toggle Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 rounded-full transition-colors ${
                  searchOpen
                    ? "text-[#caa15e] bg-white/10"
                    : "text-zinc-200 hover:text-white hover:bg-white/5"
                }`}
                title="Search Store"
              >
                <Search className="w-5 h-5 stroke-[1.8]" />
              </button>

              {/* Wishlist Button */}
              <Link
                href="/account/wishlist"
                className="p-2 rounded-full text-zinc-200 hover:text-white hover:bg-white/5 transition-colors relative"
                title="Wishlist"
              >
                <Heart className="w-5 h-5 stroke-[1.8]" />
                <span className="absolute 1 top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#caa15e] text-zinc-950 font-bold text-[10px] flex items-center justify-center leading-none shadow-xs">
                  {wishlistCount}
                </span>
              </Link>

              {/* Cart Bag Button */}
              <button
                type="button"
                onClick={openCart}
                className="p-2 rounded-full text-zinc-200 hover:text-white hover:bg-white/5 transition-colors relative"
                title="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#caa15e] text-zinc-950 font-bold text-[10px] flex items-center justify-center leading-none shadow-xs">
                  {totalItems}
                </span>
              </button>

              {/* Sign In / User Profile */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-[#caa15e]/40 hover:border-[#caa15e] bg-[#2a1a1c] transition-all"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#caa15e] text-zinc-950 flex items-center justify-center font-bold text-xs">
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
                    <span className="hidden sm:inline-block text-xs font-medium text-zinc-200 max-w-[80px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  </button>

                  {/* User Dropdown */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#251719] rounded-2xl shadow-2xl border border-[#442c30] py-2 z-50 animate-in fade-in">
                      <div className="px-4 py-2 border-b border-[#3b2427]">
                        <p className="text-[11px] text-zinc-400">Signed in as</p>
                        <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#caa15e]/20 text-[#e8c792] uppercase">
                          {user.role}
                        </span>
                      </div>

                      <div className="py-1 text-xs">
                        <Link
                          href="/account"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-zinc-200 hover:bg-white/5 transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-zinc-400" />
                          Profile & Orders
                        </Link>

                        <Link
                          href="/account/reviews"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-zinc-200 hover:bg-white/5 transition-colors"
                        >
                          <Star className="w-4 h-4 text-[#caa15e]" />
                          My Reviews
                        </Link>

                        {user.role === "ADMIN" && (
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-purple-400 hover:bg-white/5 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-5 py-1.5 rounded-full border border-[#caa15e] hover:border-[#dfb974] bg-[#221517] hover:bg-[#2e1c1f] text-[#f4ecd8] text-xs font-semibold tracking-wider transition-all duration-200 shadow-xs"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-zinc-200 hover:text-white hover:bg-white/5"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EXPANDED SEARCH BAR & TRENDING TAGS (STATE 2) */}
      {searchOpen && (
        <div className="bg-[#221517] border-b border-[#3d252a] px-4 py-5 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-[1400px] mx-auto space-y-4">
            {/* Input with Golden Button */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jhumkas, bridal sets, bangles..."
                  className="w-full bg-white text-zinc-900 placeholder:text-zinc-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#caa15e] shadow-inner"
                />
              </div>

              <button
                type="submit"
                className="h-[46px] px-6 rounded-lg bg-[#caa15e] hover:bg-[#b88c49] text-zinc-950 font-semibold flex items-center justify-center transition-colors shadow-md"
                title="Search"
              >
                <Search className="w-5 h-5 stroke-[2.2]" />
              </button>
            </form>

            {/* Quick Search Tag Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {QUICK_SEARCH_PILLS.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => handlePillClick(pill)}
                  className="px-4 py-1.5 rounded-full border border-[#4e3237] hover:border-[#caa15e] bg-[#2a1a1d] hover:bg-[#342024] text-xs font-medium text-zinc-300 hover:text-[#f4ecd8] transition-all"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. MEGA MENU DROPDOWN PANEL (STATE 3 - CLICK TRIGGERED) */}
      {activeCategory && MEGA_MENUS[activeCategory] && (
        <div className="bg-[#faf7f2] border-b border-zinc-200/80 shadow-2xl transition-all duration-200 animate-in fade-in slide-in-from-top-1">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
            <div className="grid grid-cols-12 gap-8 items-start">
              {/* Column 1: Subcategories */}
              <div className="col-span-3 space-y-4">
                <h3 className="text-sm font-bold text-[#caa15e] tracking-wide uppercase">
                  {MEGA_MENUS[activeCategory].title}
                </h3>
                <ul className="space-y-3">
                  {MEGA_MENUS[activeCategory].subcategories.map((sub) => (
                    <li key={sub.name}>
                      <Link
                        href={sub.href}
                        onClick={() => setActiveCategory(null)}
                        className="text-sm text-zinc-800 hover:text-[#a87e35] transition-colors font-medium flex items-center group"
                      >
                        <span className="group-hover:translate-x-1 transition-transform">
                          {sub.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: Price Filters */}
              <div className="col-span-3 space-y-4">
                <h3 className="text-sm font-bold text-[#caa15e] tracking-wide uppercase">
                  Price
                </h3>
                <ul className="space-y-3">
                  {MEGA_MENUS[activeCategory].prices.map((p) => (
                    <li key={p.label}>
                      <Link
                        href={p.href}
                        onClick={() => setActiveCategory(null)}
                        className="text-sm text-zinc-800 hover:text-[#a87e35] transition-colors font-medium flex items-center group"
                      >
                        <span className="group-hover:translate-x-1 transition-transform">
                          {p.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: Featured Visual Banner Card */}
              <div className="col-span-6">
                <Link
                  href={MEGA_MENUS[activeCategory].banner.href}
                  onClick={() => setActiveCategory(null)}
                  className="group relative block rounded-2xl overflow-hidden shadow-xl aspect-[16/7] border border-amber-900/10"
                >
                  <img
                    src={MEGA_MENUS[activeCategory].banner.image}
                    alt={MEGA_MENUS[activeCategory].banner.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Subtle vignette gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Golden Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3.5 py-1.5 rounded-full bg-[#caa15e] text-zinc-950 font-bold text-xs shadow-md tracking-wide">
                      {MEGA_MENUS[activeCategory].banner.badge}
                    </span>
                  </div>

                  {/* Bottom title text */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <span className="text-lg font-serif font-bold drop-shadow-md">
                      {MEGA_MENUS[activeCategory].banner.title}
                    </span>
                    <span className="text-xs font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                      Shop Now <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MOBILE DRAWER NAVIGATION */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#221517] border-b border-[#3d252a] px-4 py-5 space-y-4 animate-in slide-in-from-top-2 duration-150 text-white">
          {/* Mobile Search input */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jewellery..."
              className="flex-1 bg-white text-zinc-900 rounded-lg px-3 py-2 text-sm focus:outline-none"
            />
            <button
              type="submit"
              className="p-2.5 rounded-lg bg-[#caa15e] text-zinc-950 font-semibold"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Mobile Links */}
          <div className="flex flex-col divide-y divide-[#342024]">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className={`py-3 text-sm font-medium flex items-center justify-between ${
                  cat.isSale ? "text-[#e56767]" : "text-zinc-200"
                }`}
              >
                <span>{cat.label}</span>
                <ChevronDown className="w-4 h-4 text-zinc-500 -rotate-90" />
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
