import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string; // product id
  name: string;
  slug: string;
  image: string;
  price: number;
  qty: number;
  variantTotal: number;
  variants?: Record<string, { id: string; name: string; price: number }>;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, variantKey?: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  getSubTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.id === newItem.id
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex].qty += newItem.qty;
            return { items: updatedItems };
          }

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQty: (id, qty) => {
        set((state) => ({
          items: state.items
            .map((item) => (item.id === id ? { ...item, qty: Math.max(1, qty) } : item))
            .filter((item) => item.qty > 0),
        }));
      },

      clearCart: () => set({ items: [] }),

      getSubTotal: () => {
        return get().items.reduce((total, item) => {
          return total + (item.price + (item.variantTotal || 0)) * item.qty;
        }, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.qty, 0);
      },
    }),
    {
      name: "ecommerce-cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
