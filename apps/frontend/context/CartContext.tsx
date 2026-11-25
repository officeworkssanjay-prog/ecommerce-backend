"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

/**
 * The cart remembers WHAT the shopper picked (product, option ids, quantity). The price shown here is
 * only a preview snapshot: the server recalculates every price at /order/calculate-pricing and checkout.
 */
export interface CartItem {
  id: string; // product id + chosen options
  productId: string;
  name: string;
  slug: string;
  thumbImage?: string;
  price: number; // preview only
  qty: number;
  variantTotal: number; // preview only
  variants?: Record<string, { id: string; name: string; price: number }>;
}

/** What the API accepts for a cart line. */
export interface ApiCartItem {
  productId: string;
  qty: number;
  variants?: Record<string, string>;
}

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  /** Preview subtotal from the stored snapshot prices. */
  subTotal: number;
  totalItems: number;
  /** Cart lines in the format the pricing / checkout endpoints expect. */
  toApiItems: () => ApiCartItem[];
}

const STORAGE_KEY = "sawariya_cart";
const MAX_QTY = 20;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const CartContext = createContext<CartContextType | undefined>(undefined);

const generateItemId = (productId: string, variants?: CartItem["variants"]) => {
  if (!variants || Object.keys(variants).length === 0) return productId;
  const key = Object.keys(variants)
    .sort()
    .map((k) => `${k}:${variants[k].id}`)
    .join("-");
  return `${productId}_${key}`;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Hydrate from localStorage after mount. It does not exist during server rendering, so this cannot
  // be done in useState's initialiser without a hydration mismatch.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Drop anything that can't be a real product (e.g. items saved by older versions)
          setItems(parsed.filter((i): i is CartItem => !!i && typeof i.productId === "string" && UUID.test(i.productId) && Number(i.qty) > 0));
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setInitialized(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!initialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full or blocked: the cart still works for this session */
    }
  }, [items, initialized]);

  const addItem = useCallback((newItem: Omit<CartItem, "id">) => {
    const id = generateItemId(newItem.productId, newItem.variants);
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) return prev.map((i) => (i.id === id ? { ...i, qty: Math.min(MAX_QTY, i.qty + newItem.qty) } : i));
      return [...prev, { ...newItem, id, qty: Math.min(MAX_QTY, newItem.qty) }];
    });
    setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty <= 0) return setItems((prev) => prev.filter((i) => i.id !== id));
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.min(MAX_QTY, Math.floor(qty)) } : i)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const toApiItems = useCallback(
    (): ApiCartItem[] =>
      items.map((i) => ({
        productId: i.productId,
        qty: i.qty,
        ...(i.variants && Object.keys(i.variants).length > 0
          ? { variants: Object.fromEntries(Object.entries(i.variants).map(([name, v]) => [name, v.id])) }
          : {}),
      })),
    [items]
  );

  const value = useMemo<CartContextType>(() => {
    const subTotal = items.reduce((sum, i) => sum + (i.price + i.variantTotal) * i.qty, 0);
    return {
      items,
      isCartOpen,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      subTotal: Number(subTotal.toFixed(2)),
      totalItems: items.reduce((sum, i) => sum + i.qty, 0),
      toApiItems,
    };
  }, [items, isCartOpen, addItem, removeItem, updateQuantity, clearCart, toApiItems]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
