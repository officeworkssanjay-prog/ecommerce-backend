"use client";

import React, { useEffect, useState } from "react";
import { api, withFallback } from "@/lib/api";
import {
  Wallet,
  ArrowDownToLine,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  ShieldCheck,
} from "lucide-react";

interface WithdrawMethod {
  id: string;
  name: string;
  minimumAmount: number;
  maximumAmount: number;
  withdrawChargePercent: number;
  description?: string;
}

const mockMethods: WithdrawMethod[] = [
  {
    id: "m-1",
    name: "Direct Bank Transfer (ACH / NEFT)",
    minimumAmount: 50.0,
    maximumAmount: 5000.0,
    withdrawChargePercent: 1.5,
    description: "Standard direct bank transfer processed within 2-3 business days.",
  },
  {
    id: "m-2",
    name: "PayPal Merchant Payout",
    minimumAmount: 20.0,
    maximumAmount: 2000.0,
    withdrawChargePercent: 2.9,
    description: "Instant or same-day deposit to your registered PayPal email.",
  },
];

export default function VendorWithdrawalsPage() {
  const [balance, setBalance] = useState<number>(2220.5);
  const [methods, setMethods] = useState<WithdrawMethod[]>(mockMethods);
  const [selectedMethodId, setSelectedMethodId] = useState<string>(mockMethods[0].id);
  const [amount, setAmount] = useState<string>("200");
  const [accountInfo, setAccountInfo] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      // 1. Fetch current balance
      const dashRes = await api.get("/vendor/dashboard");
      if (dashRes.success && dashRes.data?.currentBalance !== undefined) {
        setBalance(dashRes.data.currentBalance);
      }

      // 2. Fetch withdrawal methods
      const methodRes = await withFallback<WithdrawMethod[]>(
        api.get("/vendor/withdraw-methods"),
        mockMethods
      );
      if (methodRes.data && methodRes.data.length > 0) {
        setMethods(methodRes.data);
        setSelectedMethodId(methodRes.data[0].id);
      }
    }
    loadData();
  }, []);

  const selectedMethod = methods.find((m) => m.id === selectedMethodId) || methods[0];
  const numAmount = parseFloat(amount) || 0;
  const charge = selectedMethod
    ? (numAmount * selectedMethod.withdrawChargePercent) / 100
    : 0;
  const finalPayout = Math.max(0, numAmount - charge);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (numAmount < selectedMethod.minimumAmount || numAmount > selectedMethod.maximumAmount) {
      setErrorMessage(
        `Amount must be between $${selectedMethod.minimumAmount} and $${selectedMethod.maximumAmount}`
      );
      return;
    }

    if (numAmount > balance) {
      setErrorMessage("Withdrawal amount cannot exceed available wallet balance.");
      return;
    }

    setSubmitting(true);
    const res = await api.post("/vendor/withdrawals", {
      methodId: selectedMethodId,
      amount: numAmount,
      accountInfo,
    });

    if (res.success) {
      setSuccessMessage(
        "Payout request submitted successfully! Funds will be reviewed by admin."
      );
      setBalance((prev) => Math.max(0, prev - numAmount));
      setAmount("");
      setAccountInfo("");
    } else {
      // Fallback offline preview behavior
      setSuccessMessage(
        "Payout request recorded in preview mode! (Waiting for database connection)."
      );
      setBalance((prev) => Math.max(0, prev - numAmount));
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Merchant Wallet & Payouts
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Request balance disbursements directly to your verified business bank account or digital wallet.
        </p>
      </div>

      {/* Balance Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-xl shadow-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-100">
            Current Withdrawable Balance
          </p>
          <h2 className="text-3xl md:text-4xl font-black">
            ${balance.toFixed(2)}
          </h2>
          <p className="text-xs text-amber-100/90 pt-1">
            Calculated from paid & delivered orders minus processed payouts.
          </p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
          <Wallet className="w-7 h-7 text-white" />
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="flex items-center space-x-3 p-4 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center space-x-3 p-4 rounded-2xl bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200 border border-red-200 dark:border-red-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Request Form */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ArrowDownToLine className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Submit Withdrawal Request
            </h3>
            <p className="text-xs text-zinc-400">
              Select your payment rail and specify disbursement amount.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Method Selector */}
          <div>
            <label className="font-semibold block mb-2">Disbursement Channel</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {methods.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setSelectedMethodId(m.id)}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                    selectedMethodId === m.id
                      ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-500/20"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {m.name}
                    </span>
                    <Building className="w-4 h-4 text-zinc-400" />
                  </div>
                  <p className="text-[11px] text-zinc-500 line-clamp-2">
                    {m.description}
                  </p>
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    Fee: {m.withdrawChargePercent}% &bull; Range: ${m.minimumAmount} - ${m.maximumAmount}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">
                Requested Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="200.00"
                className="w-full p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              />
            </div>

            {/* Fee summary card */}
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 space-y-1 text-[11px]">
              <div className="flex justify-between text-zinc-500">
                <span>Requested:</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  ${numAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Platform Fee ({selectedMethod?.withdrawChargePercent}%):</span>
                <span className="font-semibold text-red-500">
                  -${charge.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-zinc-900 dark:text-zinc-100 pt-1 border-t border-zinc-200 dark:border-zinc-700">
                <span>Net Disbursement:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  ${finalPayout.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Account information */}
          <div>
            <label className="font-semibold block mb-1">
              Account / Beneficiary Information
            </label>
            <textarea
              rows={3}
              required
              value={accountInfo}
              onChange={(e) => setAccountInfo(e.target.value)}
              placeholder="e.g. Bank: JPMorgan Chase, Account: 123456789, Routing: 987654321, Name: John Doe"
              className="w-full p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || balance < (selectedMethod?.minimumAmount || 10)}
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-amber-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{submitting ? "Processing..." : "Confirm & Submit Withdrawal Request"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
