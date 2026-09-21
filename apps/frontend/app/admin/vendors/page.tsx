"use client";

import React, { useEffect, useState } from "react";
import { api, withFallback } from "@/lib/api";
import {
  Store,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface VendorRequest {
  id: string;
  userId: string;
  shopName: string;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  banner?: string;
  createdAt: string;
  user: { name: string; email: string };
}

const mockRequests: VendorRequest[] = [
  {
    id: "vr-1",
    userId: "usr-201",
    shopName: "Clay & Heritage Studio",
    phone: "+1 555-4921",
    email: "clayheritage@crafts.com",
    address: "21 Artisan Alley, Portland, OR",
    description: "Multi-generational family pottery crafting high-fire ceramic cookware and planters.",
    createdAt: new Date().toISOString(),
    user: { name: "Arthur Pendelton", email: "arthur@crafts.com" },
  },
  {
    id: "vr-2",
    userId: "usr-202",
    shopName: "Boho Woodcrafts",
    phone: "+1 555-8832",
    email: "bohowood@crafts.com",
    address: "88 Timber Rd, Asheville, NC",
    description: "Reclaimed barn wood carving, cutting boards, and rustic decorative artifacts.",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    user: { name: "Elena Rostova", email: "elena@crafts.com" },
  },
];

export default function AdminVendorsPage() {
  const [requests, setRequests] = useState<VendorRequest[]>(mockRequests);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  async function fetchRequests() {
    setLoading(true);
    const res = await withFallback<VendorRequest[]>(
      api.get("/admin/vendor-requests"),
      mockRequests
    );
    setRequests(res.data || mockRequests);
    setLoading(false);
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, approve: boolean) => {
    setActioningId(id);
    // Optimistic remove
    setRequests((prev) => prev.filter((r) => r.id !== id));
    await api.post(`/admin/vendor-requests/${id}/approve`, { approve });
    setActioningId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Merchant Onboarding & Approvals
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Inspect seller applications. Approving elevates the user role to VENDOR and publishes their shop.
        </p>
      </div>

      {/* Queue */}
      {requests.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
            No Pending Vendor Applications
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            All submitted merchant requests have been reviewed and processed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 gap-3">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                      {req.shopName}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Applied by <span className="font-semibold text-zinc-700 dark:text-zinc-300">{req.user.name}</span> ({req.user.email})
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <button
                    onClick={() => handleAction(req.id, false)}
                    disabled={actioningId === req.id}
                    className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold transition"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleAction(req.id, true)}
                    disabled={actioningId === req.id}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition shadow-md shadow-purple-600/20"
                  >
                    Approve Merchant & Grant Role
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="space-y-2">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Artisan Statement / Shop Bio
                  </p>
                  <p className="text-zinc-500 leading-relaxed">
                    {req.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Merchant Contact Information
                  </p>
                  <div className="space-y-1 text-zinc-500">
                    {req.phone && (
                      <p className="flex items-center space-x-2">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{req.phone}</span>
                      </p>
                    )}
                    {req.email && (
                      <p className="flex items-center space-x-2">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{req.email}</span>
                      </p>
                    )}
                    {req.address && (
                      <p className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{req.address}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
