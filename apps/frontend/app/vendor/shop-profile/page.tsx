"use client";

import React, { useEffect, useState } from "react";
import { api, withFallback } from "@/lib/api";
import {
  Store,
  Camera,
  CheckCircle2,
  AlertCircle,
  Save,
  Globe,
} from "lucide-react";

interface ShopProfile {
  shopName: string;
  banner?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  description?: string | null;
  fbLink?: string | null;
  twLink?: string | null;
  instaLink?: string | null;
}

const defaultProfile: ShopProfile = {
  shopName: "Artisan Potteries & Crafts",
  banner: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
  phone: "+1 (555) 987-6543",
  email: "artisan@studio.com",
  address: "742 Craftmen District, Suite 4",
  description: "Dedicated to handcrafted ceramic home decor, kitchenware, and traditional clay sculptures.",
  fbLink: "https://facebook.com/artisanpottery",
  twLink: "https://twitter.com/artisanpottery",
  instaLink: "https://instagram.com/artisanpottery",
};

export default function VendorShopProfilePage() {
  const [profile, setProfile] = useState<ShopProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const res = await withFallback<ShopProfile>(
        api.get("/vendor/shop-profile"),
        defaultProfile
      );
      if (res.data) {
        setProfile(res.data);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage(false);

    await api.put("/vendor/shop-profile", profile);

    setSaving(false);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Shop Front & Branding
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Customize your public seller banner, shop name, contact channels, and artisan bio.
        </p>
      </div>

      {savedMessage && (
        <div className="flex items-center space-x-3 p-4 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Shop profile updated successfully!</span>
        </div>
      )}

      {/* Banner Preview */}
      <div className="relative rounded-3xl overflow-hidden aspect-[21/9] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 shadow-md">
        <img
          src={profile.banner || defaultProfile.banner!}
          alt="Shop Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-6 md:p-8">
          <div className="text-white space-y-1">
            <h2 className="text-2xl font-black">{profile.shopName}</h2>
            <p className="text-xs text-white/80 line-clamp-1">{profile.description}</p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold block mb-1">Shop Name</label>
            <input
              type="text"
              required
              value={profile.shopName}
              onChange={(e) => setProfile({ ...profile, shopName: e.target.value })}
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Banner Image URL</label>
            <input
              type="url"
              value={profile.banner || ""}
              onChange={(e) => setProfile({ ...profile, banner: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold block mb-1">Business Phone</label>
            <input
              type="text"
              value={profile.phone || ""}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Contact Email</label>
            <input
              type="email"
              value={profile.email || ""}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="shop@example.com"
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold block mb-1">Physical Studio / Dispatch Address</label>
          <input
            type="text"
            value={profile.address || ""}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            placeholder="Studio location"
            className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="font-semibold block mb-1">Artisan Bio / Shop Description</label>
          <textarea
            rows={3}
            value={profile.description || ""}
            onChange={(e) => setProfile({ ...profile, description: e.target.value })}
            placeholder="Introduce your craft, heritage techniques, and materials..."
            className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <p className="font-semibold mb-3 flex items-center space-x-1.5 text-zinc-600 dark:text-zinc-400">
            <Globe className="w-3.5 h-3.5" />
            <span>Social Handles & Links</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="url"
              value={profile.fbLink || ""}
              onChange={(e) => setProfile({ ...profile, fbLink: e.target.value })}
              placeholder="Facebook URL"
              className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
            />
            <input
              type="url"
              value={profile.instaLink || ""}
              onChange={(e) => setProfile({ ...profile, instaLink: e.target.value })}
              placeholder="Instagram URL"
              className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
            />
            <input
              type="url"
              value={profile.twLink || ""}
              onChange={(e) => setProfile({ ...profile, twLink: e.target.value })}
              placeholder="Twitter/X URL"
              className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save Shop Profile"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
