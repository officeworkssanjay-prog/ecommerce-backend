"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, subTotal } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Dynamic shipping rules
  const [shippingRules, setShippingRules] = useState<any[]>([
    { id: "ship-1", name: "Complimentary Insured Courier", cost: 0, minOrder: 0 },
    { id: "ship-2", name: "Armored Express Vault Delivery (24-48 hrs)", cost: 45, minOrder: 0 },
  ]);
  const [selectedShippingRuleId, setSelectedShippingRuleId] = useState("ship-1");

  // Pricing calculation result
  const [pricing, setPricing] = useState({
    subTotal: subTotal,
    discount: 0,
    shippingCost: 0,
    finalPayable: subTotal,
  });

  // Calculate pricing whenever items, coupon, or shipping rule changes
  useEffect(() => {
    async function calculate() {
      if (items.length === 0) {
        setPricing({ subTotal: 0, discount: 0, shippingCost: 0, finalPayable: 0 });
        return;
      }

      try {
        const payload = {
          items: items.map((it) => ({
            productId: it.productId,
            name: it.name,
            price: it.price,
            qty: it.qty,
            variantTotal: it.variantTotal,
          })),
          couponCode: appliedCoupon?.code || undefined,
          shippingRuleId: selectedShippingRuleId,
        };

        const res = await api.post("/order/calculate-pricing", payload);
        if (res.success && res.data) {
          setPricing({
            subTotal: res.data.subTotal,
            discount: res.data.discount,
            shippingCost: res.data.shippingCost,
            finalPayable: res.data.finalPayable,
          });
        } else {
          // Fallback client calculation
          const selectedShip = shippingRules.find((r) => r.id === selectedShippingRuleId);
          const shipCost = selectedShip ? selectedShip.cost : 0;
          let disc = 0;
          if (appliedCoupon) {
            disc =
              appliedCoupon.discountType === "PERCENT"
                ? (subTotal * appliedCoupon.discount) / 100
                : appliedCoupon.discount;
          }
          setPricing({
            subTotal,
            discount: disc,
            shippingCost: shipCost,
            finalPayable: Math.max(0, subTotal - disc + shipCost),
          });
        }
      } catch {
        const selectedShip = shippingRules.find((r) => r.id === selectedShippingRuleId);
        const shipCost = selectedShip ? selectedShip.cost : 0;
        setPricing({
          subTotal,
          discount: 0,
          shippingCost: shipCost,
          finalPayable: subTotal + shipCost,
        });
      }
    }
    calculate();
  }, [items, appliedCoupon, selectedShippingRuleId, subTotal]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError("");

    try {
      const payload = {
        items: items.map((it) => ({
          productId: it.productId,
          name: it.name,
          price: it.price,
          qty: it.qty,
          variantTotal: it.variantTotal,
        })),
        couponCode: couponCode.trim(),
        shippingRuleId: selectedShippingRuleId,
      };

      const res = await api.post("/order/calculate-pricing", payload);
      if (res.success && res.data?.coupon) {
        setAppliedCoupon(res.data.coupon);
        setCouponError("");
      } else {
        // Sample coupon validation fallback
        if (couponCode.toUpperCase() === "ROYAL10") {
          setAppliedCoupon({ code: "ROYAL10", discountType: "PERCENT", discount: 10 });
          setCouponError("");
        } else {
          setCouponError("Invalid or expired coupon code.");
        }
      }
    } catch {
      setCouponError("Failed to apply coupon. Please check code.");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Your Jewellery Box is Empty
        </h2>
        <p className="text-sm text-zinc-500 max-w-md mx-auto">
          Explore our handcrafted heritage vault featuring bridal kundan sets, certified diamond
          solitaires, and 22K hallmarked gold jewels.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md"
        >
          Explore Jewellery Vault
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Your Fine Jewellery Box ({items.length} {items.length === 1 ? "Item" : "Items"})
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Complimentary fully insured worldwide delivery included on all orders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
            {items.map((item) => {
              const effectiveUnitPrice = item.price + item.variantTotal;
              return (
                <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                  {/* Image */}
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex-shrink-0">
                    <img
                      src={item.thumbImage || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <Link href={`/products/${item.slug}`}>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:text-amber-600 transition-colors">
                        {item.name}
                      </h3>
                    </Link>

                    {item.variants && Object.keys(item.variants).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {Object.entries(item.variants).map(([vName, vItem]) => (
                          <span
                            key={vName}
                            className="text-[11px] px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium"
                          >
                            {vName}: {vItem.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-xs text-zinc-400 pt-1">
                      Unit Price: ${effectiveUnitPrice.toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-950">
                      <button
                        onClick={() => updateQuantity(item.id, item.qty - 1)}
                        className="px-2.5 py-1 text-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.qty + 1)}
                        className="px-2.5 py-1 text-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 min-w-[70px] text-right">
                      ${(effectiveUnitPrice * item.qty).toFixed(2)}
                    </span>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center px-2">
            <Link
              href="/products"
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              ← Continue Shopping Fine Jewellery
            </Link>
            <button
              onClick={clearCart}
              className="text-xs text-zinc-400 hover:text-rose-500 font-medium"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Right: Order Summary & Checkout */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-6 shadow-sm">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              Order Summary
            </h3>

            {/* Shipping Rules */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                Shipping Options:
              </label>
              {shippingRules.map((rule) => (
                <label
                  key={rule.id}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedShippingRuleId === rule.id
                      ? "border-amber-600 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 font-semibold"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="shipping"
                      checked={selectedShippingRuleId === rule.id}
                      onChange={() => setSelectedShippingRuleId(rule.id)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>{rule.name}</span>
                  </div>
                  <span>{rule.cost === 0 ? "FREE" : `$${rule.cost.toFixed(2)}`}</span>
                </label>
              ))}
            </div>

            {/* Promo Coupon */}
            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                Collector Promo Coupon:
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    Coupon: {appliedCoupon.code} (
                    {appliedCoupon.discountType === "PERCENT"
                      ? `${appliedCoupon.discount}% Off`
                      : `$${appliedCoupon.discount} Off`}
                    )
                  </span>
                  <button
                    onClick={removeCoupon}
                    className="text-zinc-400 hover:text-rose-500 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. ROYAL10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 text-white text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {couponError}
                </p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  ${pricing.subTotal.toFixed(2)}
                </span>
              </div>

              {pricing.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Privilege Discount</span>
                  <span>-${pricing.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Insured Courier</span>
                <span>
                  {pricing.shippingCost === 0 ? "FREE" : `$${pricing.shippingCost.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-zinc-900 dark:text-zinc-100 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <span>Total Payable</span>
                <span className="text-amber-600 dark:text-amber-400">
                  ${pricing.finalPayable.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Proceed to Checkout CTA */}
            <button
              onClick={() => router.push("/checkout")}
              className="w-full py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition-all transform hover:-translate-y-0.5"
            >
              Proceed to Secure Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust Assurances */}
            <div className="space-y-2 pt-2 text-[11px] text-zinc-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>256-Bit Bank Grade SSL Encrypted Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-500" />
                <span>Tamper-proof sealed box with GPS tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
