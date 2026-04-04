export type KitchenStage = "to-cook" | "preparing" | "completed";

export interface KitchenItem {
  productId: string;
  name: string;
  qty: number;
  emoji: string;
  done: boolean;
}

export interface KitchenTicket {
  id: string;
  orderId: string;
  tableNumber: number;
  items: KitchenItem[];
  stage: KitchenStage;
  receivedAt: string;
}

export const kitchenTickets: KitchenTicket[] = [
  {
    id: "kt1",
    orderId: "o2",
    tableNumber: 4,
    stage: "to-cook",
    receivedAt: "2026-04-04T07:45:00Z",
    items: [
      { productId: "p2", name: "Pepperoni Pizza", qty: 2, emoji: "🍕", done: false },
      { productId: "p6", name: "Classic Burger", qty: 1, emoji: "🍔", done: false },
    ],
  },
  {
    id: "kt2",
    orderId: "o4",
    tableNumber: 11,
    stage: "to-cook",
    receivedAt: "2026-04-04T08:00:00Z",
    items: [
      { productId: "p1", name: "Margherita Pizza", qty: 1, emoji: "🍕", done: false },
    ],
  },
  {
    id: "kt3",
    orderId: "o1",
    tableNumber: 2,
    stage: "preparing",
    receivedAt: "2026-04-04T07:15:00Z",
    items: [
      { productId: "p1", name: "Margherita Pizza", qty: 1, emoji: "🍕", done: true },
      { productId: "p9", name: "Espresso", qty: 2, emoji: "☕", done: false },
    ],
  },
  {
    id: "kt4",
    orderId: "o3",
    tableNumber: 8,
    stage: "completed",
    receivedAt: "2026-04-04T06:30:00Z",
    items: [
      { productId: "p10", name: "Cappuccino", qty: 2, emoji: "☕", done: true },
      { productId: "p14", name: "Chocolate Brownie", qty: 1, emoji: "🍫", done: true },
    ],
  },
];
