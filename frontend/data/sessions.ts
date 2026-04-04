export interface Session {
  id: string;
  name: string;
  openedAt: string;
  closedAt?: string;
  totalSales: number;
  ordersCount: number;
  status: "open" | "closed";
  cashier: string;
}

export const sessions: Session[] = [
  { id: "s1", name: "POS Session #12", openedAt: "2026-04-04T09:00:00Z", totalSales: 0, ordersCount: 0, status: "open", cashier: "Admin" },
  { id: "s2", name: "POS Session #11", openedAt: "2026-04-03T09:00:00Z", closedAt: "2026-04-03T22:00:00Z", totalSales: 15420, ordersCount: 32, status: "closed", cashier: "Admin" },
  { id: "s3", name: "POS Session #10", openedAt: "2026-04-02T09:00:00Z", closedAt: "2026-04-02T21:30:00Z", totalSales: 12800, ordersCount: 27, status: "closed", cashier: "Admin" },
  { id: "s4", name: "POS Session #9", openedAt: "2026-04-01T09:00:00Z", closedAt: "2026-04-01T22:15:00Z", totalSales: 18950, ordersCount: 41, status: "closed", cashier: "Admin" },
  { id: "s5", name: "POS Session #8", openedAt: "2026-03-31T09:00:00Z", closedAt: "2026-03-31T21:00:00Z", totalSales: 9800, ordersCount: 21, status: "closed", cashier: "Admin" },
  { id: "s6", name: "POS Session #7", openedAt: "2026-03-30T09:00:00Z", closedAt: "2026-03-30T22:30:00Z", totalSales: 21300, ordersCount: 45, status: "closed", cashier: "Admin" },
  { id: "s7", name: "POS Session #6", openedAt: "2026-03-29T09:00:00Z", closedAt: "2026-03-29T21:45:00Z", totalSales: 16700, ordersCount: 35, status: "closed", cashier: "Admin" },
];

export const salesByDay = [
  { date: "Mar 29", sales: 16700 },
  { date: "Mar 30", sales: 21300 },
  { date: "Mar 31", sales: 9800 },
  { date: "Apr 1", sales: 18950 },
  { date: "Apr 2", sales: 12800 },
  { date: "Apr 3", sales: 15420 },
  { date: "Apr 4", sales: 4200 }, // today partial
];

export const paymentBreakdown = [
  { name: "Cash", value: 45, color: "#22c55e" },
  { name: "Card", value: 30, color: "#3b82f6" },
  { name: "UPI", value: 25, color: "#e84393" },
];
