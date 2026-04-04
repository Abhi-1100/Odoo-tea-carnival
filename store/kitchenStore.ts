"use client";
import { create } from "zustand";
import { KitchenTicket, KitchenStage, kitchenTickets as initialTickets } from "@/data/kitchen";

interface KitchenState {
  tickets: KitchenTicket[];
  moveTicket: (id: string) => void;
  toggleItem: (ticketId: string, productId: string) => void;
  addTicket: (ticket: KitchenTicket) => void;
}

const stageOrder: KitchenStage[] = ["to-cook", "preparing", "completed"];

export const useKitchenStore = create<KitchenState>((set, get) => ({
  tickets: initialTickets,
  moveTicket: (id) => {
    set({
      tickets: get().tickets.map((t) => {
        if (t.id !== id) return t;
        const idx = stageOrder.indexOf(t.stage);
        const nextStage = stageOrder[Math.min(idx + 1, stageOrder.length - 1)];
        return { ...t, stage: nextStage };
      }),
    });
  },
  toggleItem: (ticketId, productId) => {
    set({
      tickets: get().tickets.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          items: t.items.map((i) =>
            i.productId === productId ? { ...i, done: !i.done } : i
          ),
        };
      }),
    });
  },
  addTicket: (ticket) => set({ tickets: [ticket, ...get().tickets] }),
}));
