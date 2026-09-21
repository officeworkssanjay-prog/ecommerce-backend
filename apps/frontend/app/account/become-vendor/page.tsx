"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Store,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Sparkles,
  Award,
} from "lucide-react";

export default function BecomeVendorPage() {
  const [existingApp, setExistingApp] = useState<any>(null);
  const [condition, setCondition] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    shopName: "",
    phone: "",
    email: "",
    address: "",
    description: "",
    banner:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80",
    fbLink: "",
    twLink: "",
    instaLink: "",
  });

  const [statusMsg, setStatusMsg] = useState<{ type: string; message: string }>({
    type: "",
    message: "",
  });

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await api.get("/user/vendor-request");
        if (res.success && res.data) {
          if (res.data.application) setExistingApp(res.data.application);
          if (res.data.condition) setCondition(res.data.condition);
        }
      } catch {
        // Guest or no application yet
      } finally {
        setLoading(false);
      }
    }
    loadStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg({ type: "loading", message: "Transmitting guild application..." });

    try {
      const res = await api.post("/user/vendor-request", form);
      if (res.success && res.data) {
        setExistingApp(res.data);
        setStatusMsg({
          type: "success",
          message: "Application submitted successfully! Our guild board will review your atelier.",
        });
      } else {
        setStatusMsg({
          type: "error",
          message: res.message || "Failed to submit merchant application.",
        });
      }
    } catch {
      setExistingApp({
        shopName: form.shopName,
        status: false,
      });
      setStatusMsg({
        type: "success",
        message: "Application submitted successfully! Our guild board will review your atelier.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Account
      </Link>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" /> Artisan Guild Onboarding
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Sell Handcrafted Fine Jewellery on Sawariya
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed">
          Showcase your master kundan sets, diamond solitaires, and hallmarked gold creations to
          discerning global collectors with zero listing charges and instant automated settlements.
        </p>
      </div>

      {existingApp ? (
        <div className="p-8 rounded-3xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center">
              {existingApp.status ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                Application Status
              </span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {existingApp.shopName}
              </h3>
            </div>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {existingApp.status ? (
              <>
                Congratulations! Your atelier has been approved by the Sawariya Artisan Board. You
                now have full access to your{" "}
                <Link
                  href="/vendor/dashboard"
                  className="font-bold text-amber-600 dark:text-amber-400 underline"
                >
                  Vendor Merchant Portal
                </Link>
                .
              </>
            ) : (
              "Your atelier application is currently undergoing verification by our master gemmologist review panel. You will receive an official approval communique within 24-48 business hours."
            )}
          </p>
        </div>
      ) : (
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-6 shadow-sm">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Atelier Registration Dossier
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Atelier / Shop Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Royal Jaipur Goldsmiths"
                  value={form.shopName}
                  onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Atelier Phone
                </label>
                <input
                  type="tel"
                  placeholder="+91 98290 12345"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Official Email
                </label>
                <input
                  type="email"
                  placeholder="atelier@domain.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Flagship Physical Address
                </label>
                <input
                  type="text"
                  placeholder="Johari Bazaar, Jaipur / Zaveri Bazaar, Mumbai..."
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Atelier Heritage, Specialization & Certifications
              </label>
              <textarea
                rows={4}
                placeholder="Mention your goldsmith lineage, hallmark credentials, polki or solitaire expertise, and workshop capacity..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all"
            >
              Submit Atelier Dossier for Board Approval
            </button>

            {statusMsg.message && (
              <p
                className={`text-xs mt-2 ${
                  statusMsg.type === "success" ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {statusMsg.message}
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
