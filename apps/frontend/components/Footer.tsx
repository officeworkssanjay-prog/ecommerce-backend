"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
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
          message: res.message || "Thank you for subscribing to Sawariya Arts VIP Circle!",
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
    <footer className="w-full font-sans">
      {/* 1. NEWSLETTER STRIP: "Be the First to Know" */}
      <div className="bg-[#241517] text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-[#382124]">
        <div className="max-w-[1300px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#f5ebd7]">
              Be the First to Know
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-lg">
              Subscribe to receive exclusive access to bridal previews, limited edition drops, and special festive promotions.
            </p>
          </div>

          <div className="w-full md:w-auto">
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-2 max-w-md w-full">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status.type === "loading"}
                className="bg-white text-zinc-900 placeholder:text-zinc-500 text-xs sm:text-sm px-4 py-3 rounded-lg sm:w-80 focus:outline-none focus:ring-2 focus:ring-[#caa15e]"
              />
              <button
                type="submit"
                disabled={status.type === "loading"}
                className="px-6 py-3 rounded-lg bg-[#caa15e] hover:bg-[#b88c49] text-zinc-950 font-semibold text-xs sm:text-sm transition-colors shadow-md whitespace-nowrap disabled:opacity-50"
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
              <p className="flex items-center gap-1 text-xs text-rose-400 mt-2">
                <AlertCircle className="w-3.5 h-3.5" /> {status.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER */}
      <div className="bg-[#1a0f11] text-zinc-400 py-16 px-4 sm:px-6 lg:px-8 border-t border-[#29171a]">
        <div className="max-w-[1300px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            {/* Column 1: Brand Info */}
            <div className="lg:col-span-2 space-y-5">
              <Link href="/" className="inline-flex items-center bg-white px-3 py-1.5 rounded-lg shadow-sm">
                <img
                  src="/images/figma/logo.png"
                  alt="Sawariya Arts Fine Jewels"
                  className="h-8 w-auto object-contain"
                />
              </Link>

              <p className="text-xs sm:text-sm text-zinc-400 max-w-sm leading-relaxed">
                Preserving royal heritage and time-honored artisanal crafts. Every masterpiece is handcrafted by master karigars with BIS hallmarked gold and certified authentic gemstones.
              </p>

              {/* Social Media Links */}
              <div className="flex items-center gap-3 pt-1">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-[#27171a] hover:bg-[#caa15e] text-zinc-300 hover:text-zinc-950 flex items-center justify-center transition-all"
                  title="Instagram"
                >
                  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-[#27171a] hover:bg-[#caa15e] text-zinc-300 hover:text-zinc-950 flex items-center justify-center transition-all"
                  title="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-[#27171a] hover:bg-[#caa15e] text-zinc-300 hover:text-zinc-950 flex items-center justify-center transition-all"
                  title="YouTube"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#27171a" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Shop */}
            <div>
              <h4 className="font-serif text-sm font-bold text-[#f5ebd7] tracking-wider uppercase mb-4">
                Shop
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <Link href="/products?category=necklace" className="hover:text-[#caa15e] transition-colors">
                    Necklace Sets
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=bangles" className="hover:text-[#caa15e] transition-colors">
                    Handcrafted Bangles
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=earrings" className="hover:text-[#caa15e] transition-colors">
                    Temple & Polki Earrings
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=rings" className="hover:text-[#caa15e] transition-colors">
                    Diamond Solitaire Rings
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=bridal" className="hover:text-[#caa15e] transition-colors">
                    Bridal Trousseau
                  </Link>
                </li>
                <li>
                  <Link href="/flash-sale" className="text-[#e56767] hover:text-[#ff7878] transition-colors">
                    Festive Sale
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Customer Care */}
            <div>
              <h4 className="font-serif text-sm font-bold text-[#f5ebd7] tracking-wider uppercase mb-4">
                Customer Care
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <Link href="/order-track" className="hover:text-[#caa15e] transition-colors">
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link href="/shipping-policy" className="hover:text-[#caa15e] transition-colors">
                    Complimentary Shipping
                  </Link>
                </li>
                <li>
                  <Link href="/returns-exchange" className="hover:text-[#caa15e] transition-colors">
                    15-Day Easy Returns
                  </Link>
                </li>
                <li>
                  <Link href="/jewellery-care" className="hover:text-[#caa15e] transition-colors">
                    Jewellery Care Guide
                  </Link>
                </li>
                <li>
                  <Link href="/faqs" className="hover:text-[#caa15e] transition-colors">
                    Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-[#caa15e] transition-colors">
                    Contact Concierge
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: About & Karigars */}
            <div>
              <h4 className="font-serif text-sm font-bold text-[#f5ebd7] tracking-wider uppercase mb-4">
                About
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <Link href="/about" className="hover:text-[#caa15e] transition-colors">
                    Our Heritage Story
                  </Link>
                </li>
                <li>
                  <Link href="/artisans" className="hover:text-[#caa15e] transition-colors">
                    Meet the Karigars
                  </Link>
                </li>
                <li>
                  <Link href="/account/become-vendor" className="hover:text-[#caa15e] transition-colors">
                    Artisan Jeweller Portal
                  </Link>
                </li>
                <li>
                  <Link href="/certifications" className="hover:text-[#caa15e] transition-colors">
                    Hallmarking & Authenticity
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-[#caa15e] transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-[#caa15e] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Guarantee */}
          <div className="border-t border-[#29171a] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
            <p>© {new Date().getFullYear()} Sawariya Arts Fine Jewels. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span>BIS 916 Hallmarked</span>
              <span>•</span>
              <span>100% Insured Delivery</span>
              <span>•</span>
              <span>Secure Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
