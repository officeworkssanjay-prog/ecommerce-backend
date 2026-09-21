"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string; // unique item id (productId + variants combo)
  productId: string;
  name: string;
  slug: string;
  thumbImage?: string;
  price: number;
  qty: number;
  variantTotal: number;
  variants?: Record<string, { id: string; name: string; price: number }>;
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
  subTotal: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sawariya_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load cart from storage", e);
    } finally {
      setInitialized(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (initialized) {
      try {
        localStorage.setItem("sawariya_cart", JSON.stringify(items));
      } catch (e) {
        console.error("Failed to save cart to storage", e);
      }
    }
  }, [items, initialized]);

  const generateItemId = (productId: string, variants?: Record<string, any>) => {
    if (!variants || Object.keys(variants).length === 0) return productId;
    const variantKeys = Object.keys(variants)
      .sort()
      .map((k) => `${k}:${variants[k].id}`)
      .join("-");
    return `${productId}_${variantKeys}`;
  };

  const addItem = (newItem: Omit<CartItem, "id">) => {
    const id = generateItemId(newItem.productId, newItem.variants);
    setItems((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, qty: item.qty + newItem.qty } : item
        );
      }
      return [...prev, { ...newItem, id }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subTotal = items.reduce(
    (sum, item) => sum + (item.price + item.variantTotal) * item.qty,
    0
  );

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subTotal: Number(subTotal.toFixed(2)),
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
