"use client";
import { create } from "zustand";
import { api } from "@/lib/api";

export interface Floor {
  id: number;
  name: string;
  isActive: boolean;
  tables: Table[];
}

export interface Table {
  id: number;
  floorId: number;
  tableNumber: string;
  seats: number;
  status: "available" | "occupied" | "reserved";
  appointmentResource?: string;
  isActive: boolean;
}

interface FloorState {
  floors: Floor[];
  loading: boolean;
  error: string | null;
  activeFloorId: number | null;
  setActiveFloor: (id: number) => void;
  fetchFloors: (token: string) => Promise<void>;
  updateTableStatus: (tableId: number, status: "available" | "occupied" | "reserved") => void;
}

export const useFloorStore = create<FloorState>((set, get) => ({
  floors: [],
  loading: false,
  error: null,
  activeFloorId: null,
  
  setActiveFloor: (id) => set({ activeFloorId: id }),
  
  fetchFloors: async (token) => {
    set({ loading: true, error: null });
    try {
      const response = await api.floors.getAll(token);
      const floors = response.data as Floor[];
      set({ 
        floors, 
        loading: false,
        activeFloorId: floors[0]?.id || null 
      });
    } catch (error) {
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch floors' 
      });
    }
  },
  
  updateTableStatus: (tableId, status) => {
    set({
      floors: get().floors.map((f) => ({
        ...f,
        tables: f.tables.map((t) => (t.id === tableId ? { ...t, status } : t)),
      })),
    });
  },
}));
