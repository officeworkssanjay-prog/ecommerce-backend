"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";

export function CartDrawer() {
  const { isCartOpen, closeCart, items, updateQuantity, removeItem, subTotal, totalItems } =
    useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Shopping Cart ({totalItems})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body / Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-zinc-100 dark:divide-zinc-800">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                  Your cart is empty
                </h3>
                <p className="text-sm text-zinc-500 mb-6 max-w-xs">
                  Explore our handcrafted collections and discover exceptional artisanal products.
                </p>
                <Link
                  href="/products"
                  onClick={closeCart}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const effectivePrice = item.price + item.variantTotal;
                return (
                  <div key={item.id} className="py-4 flex gap-4 items-start">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-200/80 dark:border-zinc-700/80">
                      {item.thumbImage ? (
                        <img
                          src={item.thumbImage}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {item.name}
                      </h4>

                      {/* Selected Variants */}
                      {item.variants && Object.keys(item.variants).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(item.variants).map(([vName, vItem]) => (
                            <span
                              key={vName}
                              className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                            >
                              {vName}: {vItem.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                        ${effectivePrice.toFixed(2)}
                      </div>

                      {/* Quantity Stepper & Remove */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.qty - 1)}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.qty + 1)}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Subtotal</span>
                <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  ${subTotal.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Taxes, coupons, and shipping calculated during checkout.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="flex items-center justify-center py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm"
                >
                  Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
