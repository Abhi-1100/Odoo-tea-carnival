export type TableStatus = "available" | "occupied" | "reserved";

export interface Table {
  id: string;
  number: number;
  seats: number;
  status: TableStatus;
  active: boolean;
  orderId?: string;
  orderAmount?: number;
  itemsCount?: number;
}

export interface Floor {
  id: string;
  name: string;
  tables: Table[];
}

export const floors: Floor[] = [
  {
    id: "f1",
    name: "Ground Floor",
    tables: [
      { id: "t1", number: 1, seats: 2, status: "available", active: true },
      { id: "t2", number: 2, seats: 4, status: "occupied", active: true, orderId: "o1", orderAmount: 648, itemsCount: 3 },
      { id: "t3", number: 3, seats: 4, status: "available", active: true },
      { id: "t4", number: 4, seats: 6, status: "occupied", active: true, orderId: "o2", orderAmount: 980, itemsCount: 5 },
      { id: "t5", number: 5, seats: 2, status: "reserved", active: true },
      { id: "t6", number: 6, seats: 4, status: "available", active: true },
      { id: "t7", number: 7, seats: 8, status: "available", active: true },
      { id: "t8", number: 8, seats: 4, status: "occupied", active: true, orderId: "o3", orderAmount: 420, itemsCount: 2 },
    ],
  },
  {
    id: "f2",
    name: "First Floor",
    tables: [
      { id: "t9", number: 9, seats: 4, status: "available", active: true },
      { id: "t10", number: 10, seats: 6, status: "available", active: true },
      { id: "t11", number: 11, seats: 2, status: "occupied", active: true, orderId: "o4", orderAmount: 299, itemsCount: 1 },
      { id: "t12", number: 12, seats: 4, status: "reserved", active: true },
    ],
  },
];
