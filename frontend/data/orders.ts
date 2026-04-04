export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  emoji: string;
}

export type OrderStatus = "pending" | "preparing" | "completed" | "paid";

export interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod?: "cash" | "card" | "upi";
  createdAt: string;
}

export const orders: Order[] = [
  {
    id: "o1",
    tableId: "t2",
    tableNumber: 2,
    items: [
      { productId: "p1", name: "Margherita Pizza", price: 299, qty: 1, emoji: "🍕" },
      { productId: "p9", name: "Espresso", price: 89, qty: 2, emoji: "☕" },
    ],
    subtotal: 477,
    tax: 24,
    total: 501,
    status: "preparing",
    createdAt: "2026-04-04T07:15:00Z",
  },
  {
    id: "o2",
    tableId: "t4",
    tableNumber: 4,
    items: [
      { productId: "p2", name: "Pepperoni Pizza", price: 349, qty: 2, emoji: "🍕" },
      { productId: "p6", name: "Classic Burger", price: 199, qty: 1, emoji: "🍔" },
    ],
    subtotal: 897,
    tax: 50,
    total: 947,
    status: "pending",
    createdAt: "2026-04-04T07:45:00Z",
  },
  {
    id: "o3",
    tableId: "t8",
    tableNumber: 8,
    items: [
      { productId: "p10", name: "Cappuccino", price: 129, qty: 2, emoji: "☕" },
      { productId: "p14", name: "Chocolate Brownie", price: 149, qty: 1, emoji: "🍫" },
    ],
    subtotal: 407,
    tax: 0,
    total: 407,
    status: "completed",
    createdAt: "2026-04-04T06:30:00Z",
  },
  {
    id: "o4",
    tableId: "t11",
    tableNumber: 11,
    items: [{ productId: "p1", name: "Margherita Pizza", price: 299, qty: 1, emoji: "🍕" }],
    subtotal: 299,
    tax: 15,
    total: 314,
    status: "pending",
    createdAt: "2026-04-04T08:00:00Z",
  },
];
