"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  ShieldCheck,
  ShoppingBag,
  Store,
  FolderTree,
  Tag,
  Wallet,
  Settings,
  ArrowLeft,
  LogOut,
  Sliders,
} from "lucide-react";

const adminNavItems = [
  { name: "Executive Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Product Moderation", href: "/admin/products", icon: ShieldCheck },
  { name: "Orders & Logistics", href: "/admin/orders", icon: ShoppingBag },
  { name: "Merchant Approvals", href: "/admin/vendors", icon: Store },
  { name: "Category Hierarchy", href: "/admin/categories", icon: FolderTree },
  { name: "Coupons & Shipping", href: "/admin/coupons", icon: Tag },
  { name: "Vendor Payouts", href: "/admin/withdrawals", icon: Wallet },
  { name: "Platform Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shrink-0 p-5">
        <div className="space-y-6">
          {/* Brand & Admin Badge */}
          <div className="flex items-center space-x-3 pb-5 border-b border-zinc-100 dark:border-zinc-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-purple-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                Admin Console
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                Super Administrator
              </span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
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
            <span>Marketplace Home</span>
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
