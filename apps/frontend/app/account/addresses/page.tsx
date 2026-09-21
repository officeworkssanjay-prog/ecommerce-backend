"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Home,
  Building,
} from "lucide-react";

export default function UserAddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "India",
    state: "Rajasthan",
    city: "Jaipur",
    zipCode: "302001",
    address: "",
    addressType: "home",
    isDefault: false,
  });

  const loadAddresses = async () => {
    try {
      const res = await api.get("/user/addresses");
      if (res.success && res.data) {
        setAddresses(res.data);
      } else {
        setAddresses([
          {
            id: "addr-1",
            name: "Heritage Residence",
            email: "client@sawariya.com",
            phone: "+91 98290 12345",
            country: "India",
            state: "Rajasthan",
            city: "Jaipur",
            zipCode: "302001",
            address: "42, Johari Palace, Near Bapu Bazaar",
            addressType: "home",
            isDefault: true,
          },
        ]);
      }
    } catch {
      setAddresses([
        {
          id: "addr-1",
          name: "Heritage Residence",
          email: "client@sawariya.com",
          phone: "+91 98290 12345",
          country: "India",
          state: "Rajasthan",
          city: "Jaipur",
          zipCode: "302001",
          address: "42, Johari Palace, Near Bapu Bazaar",
          addressType: "home",
          isDefault: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/user/addresses", form);
      if (res.success && res.data) {
        setAddresses((prev) => [res.data, ...prev]);
        setShowModal(false);
      } else {
        const local = { ...form, id: `addr-${Date.now()}` };
        setAddresses((prev) => [local, ...prev]);
        setShowModal(false);
      }
    } catch {
      const local = { ...form, id: `addr-${Date.now()}` };
      setAddresses((prev) => [local, ...prev]);
      setShowModal(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/user/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.put(`/user/addresses/${id}/default`);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
    } catch {
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Account
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Delivery Address Book
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage your residences, secure vault lockers, and concierge destinations.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-xs self-start"
        >
          <Plus className="w-4 h-4" /> Add New Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`p-6 rounded-3xl bg-white dark:bg-zinc-900 border flex flex-col justify-between space-y-4 relative ${
              addr.isDefault
                ? "border-amber-600/70 shadow-sm"
                : "border-zinc-200/80 dark:border-zinc-800"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  {addr.addressType === "office" ? (
                    <Building className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <Home className="w-4 h-4 text-zinc-400" />
                  )}
                  {addr.name}
                </span>

                {addr.isDefault && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                    Default
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {addr.address}, {addr.city}, {addr.state} - {addr.zipCode}, {addr.country}
              </p>

              <p className="text-xs text-zinc-500">Contact: {addr.phone}</p>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
              {!addr.isDefault ? (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                >
                  Set as Default
                </button>
              ) : (
                <span className="text-zinc-400 text-[11px]">Primary Destination</span>
              )}

              <button
                onClick={() => handleDelete(addr.id)}
                className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Address Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Add Secure Delivery Address
            </h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                placeholder="Recipient / Residence Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Palace, Villa, Apartment, Street"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100"
                required
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100"
                  required
                />
                <input
                  type="text"
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100"
                  required
                />
                <input
                  type="text"
                  placeholder="Zip Code"
                  value={form.zipCode}
                  onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
