"use client";

import React, { useEffect, useState } from "react";
import { api, withFallback } from "@/lib/api";
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Building,
  Store,
  DollarSign,
  Calendar,
} from "lucide-react";

interface AdminWithdrawal {
  id: string;
  totalAmount: number;
  withdrawCharge: number;
  finalAmount: number;
  accountInfo: string;
  status: "PENDING" | "PAID" | "DECLINED";
  createdAt: string;
  vendor: { shopName: string; email: string };
  method: { name: string };
}

const mockWithdrawals: AdminWithdrawal[] = [
  {
    id: "w-1",
    totalAmount: 500.0,
    withdrawCharge: 7.5,
    finalAmount: 492.5,
    accountInfo: "Chase Bank, Acct: 123456789, Routing: 987654321",
    status: "PENDING",
    createdAt: new Date().toISOString(),
    vendor: { shopName: "Artisan Potteries", email: "artisan@studio.com" },
    method: { name: "Direct Bank Transfer" },
  },
  {
    id: "w-2",
    totalAmount: 150.0,
    withdrawCharge: 4.35,
    finalAmount: 145.65,
    accountInfo: "paypal: merchant@earthlyweaves.com",
    status: "PENDING",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    vendor: { shopName: "Earthly Weaves", email: "weaves@studio.com" },
    method: { name: "PayPal Payout" },
  },
];

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>(mockWithdrawals);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  async function fetchWithdrawals() {
    setLoading(true);
    const res = await withFallback<AdminWithdrawal[]>(
      api.get("/admin/withdrawals"),
      mockWithdrawals
    );
    setWithdrawals(res.data || mockWithdrawals);
    setLoading(false);
  }

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: "PAID" | "DECLINED") => {
    setActioningId(id);
    setWithdrawals((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w))
    );
    await api.put(`/admin/withdrawals/${id}/status`, { status: newStatus });
    setActioningId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Merchant Payouts & Disbursements
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Review vendor requested withdrawals, verify account details, and disburse payouts.
        </p>
      </div>

      {/* List */}
      <div className="space-y-4">
        {withdrawals.map((w) => (
          <div
            key={w.id}
            className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 gap-3">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    ${w.finalAmount.toFixed(2)} Disbursement
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Requested by <span className="font-semibold text-zinc-700 dark:text-zinc-300">{w.vendor.shopName}</span> &bull; {w.method.name}
                  </p>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center space-x-3 text-xs">
                {w.status === "PENDING" ? (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(w.id, "DECLINED")}
                      disabled={actioningId === w.id}
                      className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold transition"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(w.id, "PAID")}
                      disabled={actioningId === w.id}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition shadow-md shadow-emerald-600/20"
                    >
                      Mark as Disbursed (Paid)
                    </button>
                  </>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      w.status === "PAID"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300"
                    }`}
                  >
                    {w.status}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-500">
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                  Beneficiary Account Information
                </p>
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 font-mono text-zinc-700 dark:text-zinc-300">
                  {w.accountInfo}
                </div>
              </div>

              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                  Financial Breakdown
                </p>
                <div className="space-y-1">
                  <p>Requested Balance: ${w.totalAmount.toFixed(2)}</p>
                  <p className="text-red-500">Platform Charge: -${w.withdrawCharge.toFixed(2)}</p>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    Net Transfer Amount: ${w.finalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
