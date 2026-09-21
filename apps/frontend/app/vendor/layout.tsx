"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Wallet,
  Store,
  ArrowLeft,
  LogOut,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/vendor/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/vendor/products", icon: Package },
  { name: "Orders", href: "/vendor/orders", icon: ShoppingBag },
  { name: "Payouts & Wallet", href: "/vendor/withdrawals", icon: Wallet },
  { name: "Shop Profile", href: "/vendor/shop-profile", icon: Store },
];

export default function VendorLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isVendor, logout } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shrink-0 p-5">
        <div className="space-y-6">
          {/* Brand & Vendor Badge */}
          <div className="flex items-center space-x-3 pb-5 border-b border-zinc-100 dark:border-zinc-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white font-bold shadow-md shadow-amber-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                {user?.vendor?.shopName || "Merchant Portal"}
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                Verified Seller
              </span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-amber-500 text-white font-semibold shadow-md shadow-amber-500/20"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
          <Link
            href="/"
            className="flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </Link>
          <button
            onClick={() => logout()}
            className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
