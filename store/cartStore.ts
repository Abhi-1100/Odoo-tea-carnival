"use client";
import { create } from "zustand";
import { OrderItem } from "@/data/orders";

interface CartState {
  tableId: string | null;
  tableNumber: number;
  items: OrderItem[];
  setTable: (tableId: string, tableNumber: number) => void;
  addItem: (item: Omit<OrderItem, "qty"> & { qty?: number }) => void;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  tableId: null,
  tableNumber: 0,
  items: [],
  setTable: (tableId, tableNumber) => set({ tableId, tableNumber, items: [] }),
  addItem: (item) => {
    const existing = get().items.find((i) => i.productId === item.productId);
    if (existing) {
      set({ items: get().items.map((i) => i.productId === item.productId ? { ...i, qty: i.qty + 1 } : i) });
    } else {
      set({ items: [...get().items, { ...item, qty: item.qty || 1 }] });
    }
  },
  updateQty: (productId, qty) => {
    if (qty <= 0) {
      get().removeItem(productId);
    } else {
      set({ items: get().items.map((i) => i.productId === productId ? { ...i, qty } : i) });
    }
  },
  removeItem: (productId) => set({ items: get().items.filter((i) => i.productId !== productId) }),
  clearCart: () => set({ items: [], tableId: null, tableNumber: 0 }),
  getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
  getTax: () => Math.round(get().items.reduce((sum, i) => sum + i.price * i.qty, 0) * 0.05),
  getTotal: () => get().getSubtotal() + get().getTax(),
}));
