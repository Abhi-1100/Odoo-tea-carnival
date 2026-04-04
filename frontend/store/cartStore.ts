"use client";
import { create } from "zustand";
import { api } from "@/lib/api";

export interface CartItem {
  productId: number;
  variantId?: number;
  name: string;
  price: number;
  qty: number;
  emoji?: string;
  notes?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  taxPercent: number;
  categoryId?: number;
  category?: { id: number; name: string };
  variants?: Variant[];
}

export interface Variant {
  id: number;
  attribute: string;
  value: string;
  extraPrice: number;
}

interface CartState {
  tableId: number | null;
  tableNumber: number;
  sessionId: number | null;
  items: CartItem[];
  products: Product[];
  loading: boolean;
  error: string | null;
  setTable: (tableId: number, tableNumber: number) => void;
  setSession: (sessionId: number) => void;
  fetchProducts: (token: string) => Promise<void>;
  addItem: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  updateQty: (productId: number, qty: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
  createOrder: (token: string) => Promise<{ id: number; orderNumber: string }>;
  sendToKitchen: (orderId: number, token: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  tableId: null,
  tableNumber: 0,
  sessionId: null,
  items: [],
  products: [],
  loading: false,
  error: null,
  
  setTable: (tableId, tableNumber) => set({ tableId, tableNumber, items: [] }),
  
  setSession: (sessionId) => set({ sessionId }),
  
  fetchProducts: async (token) => {
    set({ loading: true, error: null });
    try {
      const response = await api.products.getAll(token);
      set({ products: response.data as Product[], loading: false });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to fetch products' });
    }
  },
  
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

  getTax: () => {
    const subtotal = get().getSubtotal();
    return Math.round(subtotal * 0.05);
  },
  
  getTotal: () => get().getSubtotal() + get().getTax(),
  
  createOrder: async (token) => {
    const { tableId, sessionId, items } = get();
    if (!sessionId) throw new Error('No active session');
    
    const orderData = {
      sessionId,
      tableId: tableId || undefined,
      orderType: tableId ? 'dine_in' : 'takeaway',
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.qty,
        unitPrice: i.price,
        notes: i.notes || '',
      })),
    };
    
    const response = await api.orders.create(orderData, token);
    return response.data as { id: number; orderNumber: string };
  },
  
  sendToKitchen: async (orderId, token) => {
    await api.orders.sendToKitchen(orderId, token);
  },
}));
