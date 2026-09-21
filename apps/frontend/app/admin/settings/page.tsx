"use client";

import React, { useEffect, useState } from "react";
import { api, withFallback } from "@/lib/api";
import {
  Settings,
  CreditCard,
  Mail,
  Radio,
  Save,
  CheckCircle2,
  DollarSign,
  Globe,
} from "lucide-react";

type GatewayKey = "cod" | "stripe" | "razorpay" | "paypal";

interface SettingsData {
  general: {
    siteName: string;
    contactEmail: string;
    contactPhone: string;
    currencyName: string;
    currencyIcon: string;
    timeZone: string;
  };
  paymentGateways: Record<GatewayKey, { status: boolean; clientId?: string }>;
}

const defaultSettings: SettingsData = {
  general: {
    siteName: "Sawariya Arts & Crafts Marketplace",
    contactEmail: "contact@sawariyaarts.com",
    contactPhone: "+1 (555) 019-2831",
    currencyName: "USD",
    currencyIcon: "$",
    timeZone: "UTC",
  },
  paymentGateways: {
    cod: { status: true },
    stripe: { status: true },
    razorpay: { status: false },
    paypal: { status: false },
  },
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const res = await withFallback<SettingsData>(
        api.get("/admin/settings"),
        defaultSettings
      );
      if (res.data) {
        setSettings(res.data);
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await api.put("/admin/settings/general", settings.general);
    setSaving(false);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 4000);
  };

  const handleToggleGateway = async (gateway: "COD" | "STRIPE" | "RAZORPAY" | "PAYPAL") => {
    const key = gateway.toLowerCase() as GatewayKey;
    const current = settings.paymentGateways[key]?.status || false;
    const newStatus = !current;

    setSettings((prev) => ({
      ...prev,
      paymentGateways: {
        ...prev.paymentGateways,
        [key]: {
          ...prev.paymentGateways[key],
          status: newStatus,
        },
      },
    }));

    await api.put("/admin/settings/payment-gateways", {
      gateway,
      settings: { status: newStatus },
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Platform & Gateway Configuration
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Configure site identity, default currencies, timezones, and active payment checkout rails.
        </p>
      </div>

      {savedMessage && (
        <div className="flex items-center space-x-3 p-4 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Platform settings updated successfully!</span>
        </div>
      )}

      {/* General Settings */}
      <form onSubmit={handleSaveGeneral} className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5 text-xs">
        <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <Globe className="w-5 h-5 text-purple-600" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Marketplace Identity
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold block mb-1">Site Title</label>
            <input
              type="text"
              value={settings.general?.siteName || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general!, siteName: e.target.value },
                })
              }
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Contact Email</label>
            <input
              type="email"
              value={settings.general?.contactEmail || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general!, contactEmail: e.target.value },
                })
              }
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="font-semibold block mb-1">Currency Code</label>
            <input
              type="text"
              value={settings.general?.currencyName || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general!, currencyName: e.target.value },
                })
              }
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Currency Symbol</label>
            <input
              type="text"
              value={settings.general?.currencyIcon || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general!, currencyIcon: e.target.value },
                })
              }
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Timezone</label>
            <input
              type="text"
              value={settings.general?.timeZone || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general!, timeZone: e.target.value },
                })
              }
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Identity Settings"}</span>
          </button>
        </div>
      </form>

      {/* Payment Gateway Toggles */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5 text-xs">
        <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <CreditCard className="w-5 h-5 text-purple-600" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Payment Gateways & Checkout Rails
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Cash on Delivery (COD)
              </h3>
              <p className="text-[11px] text-zinc-400">
                Allow customers to pay cash upon doorstep package delivery.
              </p>
            </div>
            <button
              onClick={() => handleToggleGateway("COD")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                settings.paymentGateways?.cod?.status
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
              }`}
            >
              {settings.paymentGateways?.cod?.status ? "Enabled" : "Disabled"}
            </button>
          </div>

          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Stripe Payments
              </h3>
              <p className="text-[11px] text-zinc-400">
                Credit card, Apple Pay, and Google Pay processing.
              </p>
            </div>
            <button
              onClick={() => handleToggleGateway("STRIPE")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                settings.paymentGateways?.stripe?.status
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
              }`}
            >
              {settings.paymentGateways?.stripe?.status ? "Enabled" : "Disabled"}
            </button>
          </div>

          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Razorpay (UPI / NetBanking)
              </h3>
              <p className="text-[11px] text-zinc-400">
                Instant UPI QR, wallets, and domestic netbanking.
              </p>
            </div>
            <button
              onClick={() => handleToggleGateway("RAZORPAY")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                settings.paymentGateways?.razorpay?.status
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
              }`}
            >
              {settings.paymentGateways?.razorpay?.status ? "Enabled" : "Disabled"}
            </button>
          </div>

          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                PayPal Checkout
              </h3>
              <p className="text-[11px] text-zinc-400">
                Global PayPal balance and Pay-in-4 installment rails.
              </p>
            </div>
            <button
              onClick={() => handleToggleGateway("PAYPAL")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                settings.paymentGateways?.paypal?.status
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
              }`}
            >
              {settings.paymentGateways?.paypal?.status ? "Enabled" : "Disabled"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
