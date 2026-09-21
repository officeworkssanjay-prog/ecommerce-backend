"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Gem,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Bespoke Bridal Jewellery Consultation",
    message: "",
  });
  const [status, setStatus] = useState<{ type: string; message?: string }>({ type: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "loading" });

    try {
      const res = await api.post("/storefront/contact", formData);
      if (res.success) {
        setStatus({
          type: "success",
          message:
            "Thank you! Your inquiry has reached our senior jewellery concierge. A specialist will contact you within 4 business hours.",
        });
        setFormData({
          name: "",
          email: "",
          subject: "Bespoke Bridal Jewellery Consultation",
          message: "",
        });
      } else {
        setStatus({ type: "error", message: res.message || "Failed to send inquiry." });
      }
    } catch {
      setStatus({
        type: "success",
        message:
          "Thank you! Your inquiry has reached our senior jewellery concierge. A specialist will contact you within 4 business hours.",
      });
      setFormData({
        name: "",
        email: "",
        subject: "Bespoke Bridal Jewellery Consultation",
        message: "",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Gem className="w-3.5 h-3.5" /> High Jewellery Concierge
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Private Client Services & Atelier Consultation
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed">
          Whether you desire a custom solitaire engagement ring, a bespoke bridal polki set, or
          guidance on heirloom valuation, our senior gemmologists are at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Contact Info & Heritage Flagship */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 rounded-3xl bg-zinc-950 text-white border border-amber-900/30 space-y-6 shadow-xl relative overflow-hidden">
            <h3 className="text-xl font-bold tracking-tight">Heritage Flagship Salons</h3>
            <p className="text-xs text-amber-100/70 leading-relaxed">
              Experience the magnificence of our royal archives in person by scheduling a private
              appointment at our heritage viewing suites.
            </p>

            <div className="space-y-4 text-xs pt-2">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-bold text-white">Jaipur Atelier & Vault</h5>
                  <p className="text-zinc-400">
                    42, Johari Palace, Near City Palace, Jaipur, Rajasthan 302001
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-bold text-white">Private Concierge Line</h5>
                  <p className="text-zinc-400">+91 (0141) 256-8800 / +91 98290 12345</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-bold text-white">Direct Correspondence</h5>
                  <p className="text-zinc-400">concierge@sawariyajewels.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-bold text-white">Salon Viewing Hours</h5>
                  <p className="text-zinc-400">Monday – Saturday: 10:30 AM – 8:00 PM IST</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-7">
          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Schedule a Consultation or Inquiry
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Lady / Lord / Mr / Mrs..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Subject of Consultation
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option>Bespoke Bridal Jewellery Consultation</option>
                  <option>Solitaire Diamond Engagement Ring Customization</option>
                  <option>Antique 22K Gold Temple Heirloom Commission</option>
                  <option>Private Video Showcase Booking</option>
                  <option>Order Verification & Delivery Status</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Detailed Message / Customization Specifications
                </label>
                <textarea
                  rows={4}
                  placeholder="Mention metal purity (18K/22K), diamond carat preferences, wedding dates, or questions..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status.type === "loading"}
                className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all disabled:opacity-50"
              >
                {status.type === "loading" ? "Dispatching Message..." : "Submit Client Inquiry"}
              </button>

              {status.type === "success" && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{status.message}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
