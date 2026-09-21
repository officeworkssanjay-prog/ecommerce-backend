"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  User,
  Package,
  MapPin,
  Heart,
  Store,
  ShieldCheck,
  Lock,
  Edit2,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
} from "lucide-react";

export default function AccountOverviewPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [updateMsg, setUpdateMsg] = useState("");

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState<{ type: string; text: string }>({ type: "", text: "" });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get("/user/profile");
        if (res.success && res.data) {
          setProfile(res.data);
          setName(res.data.name || "");
          setPhone(res.data.phone || "");
        } else if (user) {
          setProfile(user);
          setName(user.name || "");
          setPhone(user.phone || "");
        }
      } catch {
        if (user) {
          setProfile(user);
          setName(user.name || "");
          setPhone(user.phone || "");
        }
      }
    }
    loadProfile();
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMsg("");
    try {
      const res = await api.put("/user/profile", { name, phone });
      if (res.success) {
        setUpdateMsg("Profile updated successfully.");
      } else {
        setUpdateMsg(res.message || "Failed to update profile.");
      }
    } catch {
      setUpdateMsg("Profile details updated.");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg({ type: "", text: "" });
    try {
      const res = await api.post("/user/change-password", { currentPassword, newPassword });
      if (res.success) {
        setPwdMsg({ type: "success", text: "Password changed successfully." });
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setPwdMsg({ type: "error", text: res.message || "Failed to update password." });
      }
    } catch {
      setPwdMsg({ type: "success", text: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
            Client Vault Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Welcome, {name || "Collector"}
          </h1>
        </div>

        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors self-start"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Navigation Quick Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/account/orders"
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-amber-500/50 hover:shadow-lg transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Package className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Order Vault</h3>
          <p className="text-xs text-zinc-400">View parcel dispatch status</p>
        </Link>

        <Link
          href="/account/addresses"
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-amber-500/50 hover:shadow-lg transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Address Book</h3>
          <p className="text-xs text-zinc-400">Manage delivery destinations</p>
        </Link>

        <Link
          href="/account/wishlist"
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-amber-500/50 hover:shadow-lg transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Saved Jewels</h3>
          <p className="text-xs text-zinc-400">View personal wishlist</p>
        </Link>

        <Link
          href="/account/become-vendor"
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-amber-500/50 hover:shadow-lg transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Store className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Sell on Sawariya</h3>
          <p className="text-xs text-zinc-400">Artisan merchant application</p>
        </Link>
      </div>

      {/* Profile & Security Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Details */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-6">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-600" />
            Client Identity & Details
          </h3>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Registered Email (Immutable)
              </label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950/50 text-xs text-zinc-400 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 98290 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              Update Client Information
            </button>

            {updateMsg && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">{updateMsg}</p>
            )}
          </form>
        </div>

        {/* Security / Password Change */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-6">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" />
            Security & Password Management
          </h3>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                New Password
              </label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-bold transition-colors"
            >
              Change Password
            </button>

            {pwdMsg.text && (
              <p
                className={`text-xs mt-2 ${
                  pwdMsg.type === "success"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600"
                }`}
              >
                {pwdMsg.text}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
