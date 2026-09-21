"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Sparkles,
  Truck,
  RotateCcw,
  Headphones,
  Mail,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message?: string;
  }>({ type: "idle" });

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus({ type: "loading" });
    try {
      const res = await api.post("/storefront/newsletter-subscribe", { email });
      if (res.success) {
        setStatus({
          type: "success",
          message: res.message || "Subscribed successfully! Check your inbox to verify.",
        });
        setEmail("");
      } else {
        setStatus({
          type: "error",
          message: res.message || "Subscription failed. Please try again.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message: "An unexpected error occurred. Please try again later.",
      });
    }
  };

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-900 mt-auto">
      {/* 1. Trust Pillars */}
      <div className="border-b border-zinc-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400 flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-100">Handcrafted Artwork</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  100% verified authentic crafts directly curated from master artisans.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-100">Global Safe Delivery</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Insured premium courier packaging with real-time tracking checkpoints.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400 flex-shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-100">Hassle-Free Returns</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Simple 30-day return policy and comprehensive buyer protection.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400 flex-shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-100">Artisan Support 24/7</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Dedicated customer service and direct communication with sellers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                S
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Sawariya<span className="text-indigo-400">Arts</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              Empowering global artisans and connecting discerning buyers with unique, handmade
              treasures, traditional sculptures, and cultural fine arts.
            </p>

            {/* Newsletter Form */}
            <div className="pt-2">
              <h5 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-2">
                Join our VIP Collector Circle
              </h5>
              <form onSubmit={handleNewsletter} className="flex gap-2 max-w-md">
                <div className="relative flex-1">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status.type === "loading"}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                </div>
                <button
                  type="submit"
                  disabled={status.type === "loading"}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {status.type === "loading" ? "Subscribing..." : "Subscribe"}
                </button>
              </form>

              {status.type === "success" && (
                <p className="flex items-center gap-1 text-xs text-emerald-400 mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {status.message}
                </p>
              )}
              {status.type === "error" && (
                <p className="flex items-center gap-1 text-xs text-red-400 mt-2">
                  <AlertCircle className="w-3.5 h-3.5" /> {status.message}
                </p>
              )}
            </div>
          </div>

          {/* Catalog Columns */}
          <div>
            <h5 className="text-sm font-semibold text-zinc-100 mb-4">Marketplace</h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  All Artworks & Products
                </Link>
              </li>
              <li>
                <Link href="/flash-sale" className="hover:text-white transition-colors">
                  Flash Sale Deals
                </Link>
              </li>
              <li>
                <Link href="/vendors" className="hover:text-white transition-colors">
                  Featured Artisan Shops
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="hover:text-white transition-colors">
                  Artisan Stories & Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h5 className="text-sm font-semibold text-zinc-100 mb-4">Customer Care</h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/order-track" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Help & Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Merchants & Partner */}
          <div>
            <h5 className="text-sm font-semibold text-zinc-100 mb-4">Artisans & Sellers</h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/account/become-vendor"
                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Apply as a Vendor
                </Link>
              </li>
              <li>
                <Link href="/vendor/dashboard" className="hover:text-white transition-colors">
                  Merchant Portal Login
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-white transition-colors">
                  Admin Control Panel
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Seller Terms & Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Bottom Copyright */}
        <div className="border-t border-zinc-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} Sawariya Arts Multi-Vendor Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-zinc-400">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-zinc-400">
              Terms of Service
            </Link>
            <Link href="/shipping-policy" className="hover:text-zinc-400">
              Shipping & Returns
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
