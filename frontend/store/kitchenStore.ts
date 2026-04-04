"use client";
import { create } from "zustand";
import { api } from "@/lib/api";

export interface KitchenTicketItem {
  id: number;
  orderItemId: number;
  productName: string;
  variantInfo?: string;
  quantity: number;
  notes?: string;
  isPrepared: boolean;
}

export interface KitchenTicket {
  id: number;
  orderId: number;
  ticketNumber: string;
  stage: "to_cook" | "preparing" | "completed";
  sentAt: string;
  completedAt?: string;
  items: KitchenTicketItem[];
  order?: {
    id: number;
    orderNumber: string;
    orderType: string;
    table?: { id: number; tableNumber: string };
  };
}

interface KitchenState {
  tickets: KitchenTicket[];
  loading: boolean;
  error: string | null;
  fetchTickets: (token: string, stage?: string) => Promise<void>;
  updateStage: (id: number, stage: string, token: string) => Promise<void>;
  markItemPrepared: (ticketId: number, itemId: number, token: string) => Promise<void>;
  moveTicket: (ticketId: number | string) => void;
  toggleItem: (ticketId: number | string, itemId: number | string) => void;
  addTicket: (ticket: KitchenTicket) => void;
}

export const useKitchenStore = create<KitchenState>((set, get) => ({
  tickets: [],
  loading: false,
  error: null,
  
  fetchTickets: async (token, stage) => {
    set({ loading: true, error: null });
    try {
      const response = await api.kitchen.getTickets(token, stage);
      set({ tickets: response.data as KitchenTicket[], loading: false });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to fetch tickets' });
    }
  },
  
  updateStage: async (id, stage, token) => {
    try {
      await api.kitchen.updateStage(id, stage, token);
      set({
        tickets: get().tickets.map((t) =>
          t.id === id ? { ...t, stage: stage as KitchenTicket['stage'] } : t
        ),
      });
    } catch (error) {
      console.error('Failed to update ticket stage:', error);
    }
  },
  
  markItemPrepared: async (ticketId, itemId, token) => {
    try {
      await api.kitchen.markItemPrepared(ticketId, itemId, token);
      set({
        tickets: get().tickets.map((t) =>
          t.id === ticketId
            ? { ...t, items: t.items.map((i) => (i.id === itemId ? { ...i, isPrepared: true } : i)) }
            : t
        ),
      });
    } catch (error) {
      console.error('Failed to mark item prepared:', error);
    }
  },

  // Local fallback used by current /kitchen page (kanban-style interaction).
  moveTicket: (ticketId) => {
    set({
      tickets: get().tickets.map((ticket) => {
        if ((ticket as unknown as { id: number | string }).id !== ticketId) return ticket;

        const current = (ticket as unknown as { stage: string }).stage;
        const next = current === 'to-cook' || current === 'to_cook'
          ? 'preparing'
          : current === 'preparing'
            ? 'completed'
            : 'completed';

        return { ...ticket, stage: next as KitchenTicket['stage'] };
      }),
    });
  },

  // Local fallback used by current /kitchen page item toggle interaction.
  toggleItem: (ticketId, itemId) => {
    set({
      tickets: get().tickets.map((ticket) => {
        if ((ticket as unknown as { id: number | string }).id !== ticketId) return ticket;

        const nextItems = (ticket.items as unknown as Array<Record<string, unknown>>).map((item) => {
          const candidateId = (item.productId as number | string | undefined) ?? (item.id as number | string | undefined);
          if (candidateId !== itemId) return item;

          if (typeof item.done === 'boolean') {
            return { ...item, done: !item.done };
          }

          if (typeof item.isPrepared === 'boolean') {
            return { ...item, isPrepared: !item.isPrepared };
          }

          return item;
        });

        return { ...ticket, items: nextItems as KitchenTicketItem[] };
      }),
    });
  },
  
  addTicket: (ticket) => set({ tickets: [ticket, ...get().tickets] }),
}));
