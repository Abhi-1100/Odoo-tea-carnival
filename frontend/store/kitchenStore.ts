"use client";
import { create } from "zustand";
import { api } from "@/lib/api";
import { kitchenTickets, type KitchenStage, type KitchenTicket } from "@/data/kitchen";

interface KitchenState {
  tickets: KitchenTicket[];
  loading: boolean;
  error: string | null;
  fetchTickets: (token: string, stage?: string) => Promise<void>;
  moveTicket: (id: string) => void;
  toggleItem: (ticketId: string, productId: string) => void;
  addTicket: (ticket: KitchenTicket) => void;
}

export const useKitchenStore = create<KitchenState>((set, get) => ({
  tickets: kitchenTickets,
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
  
  moveTicket: (id) => {
    const order: KitchenStage[] = ["to-cook", "preparing", "completed"];
    set({
      tickets: get().tickets.map((ticket) => {
        if (ticket.id !== id) return ticket;
        const nextIndex = Math.min(order.indexOf(ticket.stage) + 1, order.length - 1);
        return { ...ticket, stage: order[nextIndex] };
      }),
    });
  },
  
  toggleItem: (ticketId, productId) => {
    set({
      tickets: get().tickets.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, items: ticket.items.map((item) => (item.productId === productId ? { ...item, done: !item.done } : item)) }
          : ticket
      ),
    });
  },
  
  addTicket: (ticket) => set({ tickets: [ticket, ...get().tickets] }),
}));
