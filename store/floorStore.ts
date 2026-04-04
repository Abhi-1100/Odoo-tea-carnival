"use client";
import { create } from "zustand";
import { Floor, floors as initialFloors } from "@/data/floors";

interface FloorState {
  floors: Floor[];
  activeFloorId: string;
  setActiveFloor: (id: string) => void;
  updateTableStatus: (tableId: string, status: "available" | "occupied" | "reserved") => void;
}

export const useFloorStore = create<FloorState>((set, get) => ({
  floors: initialFloors,
  activeFloorId: initialFloors[0]?.id || "",
  setActiveFloor: (id) => set({ activeFloorId: id }),
  updateTableStatus: (tableId, status) => {
    set({
      floors: get().floors.map((f) => ({
        ...f,
        tables: f.tables.map((t) => (t.id === tableId ? { ...t, status } : t)),
      })),
    });
  },
}));
