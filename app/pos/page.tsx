"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { floors } from "@/data/floors";
import { useCartStore } from "@/store/cartStore";
import clsx from "clsx";

const statusColor = {
  available: "border-green-500/30 hover:border-green-400 bg-green-500/5",
  occupied: "border-orange-500/30 hover:border-orange-400 bg-orange-500/5",
  reserved: "border-gray-500/30 bg-gray-500/5 cursor-not-allowed opacity-60",
};

export default function POSFloorPage() {
  const router = useRouter();
  const setTable = useCartStore(s => s.setTable);
  const [activeFloor, setActiveFloor] = useState(floors[0]?.id);
  const currentFloor = floors.find(f => f.id === activeFloor);

  const handleSelectTable = (tableId: string, tableNumber: number, status: string) => {
    if (status === "reserved") return;
    setTable(tableId, tableNumber);
    router.push(`/pos/order/${tableId}`);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Floor Tabs */}
      <div className="flex gap-1 px-6 pt-4 border-b border-brand-border shrink-0">
        {floors.map(f => (
          <button key={f.id} onClick={() => setActiveFloor(f.id)} className={clsx("px-4 py-2 text-sm font-medium rounded-t-lg transition-all -mb-px border-b-2", f.id === activeFloor ? "border-brand-primary text-white" : "border-transparent text-brand-muted hover:text-white")}>
            {f.name}
          </button>
        ))}
      </div>

      {/* Table Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {currentFloor?.tables.map(t => (
            <button key={t.id} onClick={() => handleSelectTable(t.id, t.number, t.status)} className={clsx("card p-5 border text-left transition-all duration-200 rounded-xl", statusColor[t.status], t.status !== "reserved" && "hover:scale-[1.02] active:scale-95")}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl font-bold text-white">T{t.number}</span>
                <Badge variant={t.status} dot />
              </div>
              <div className="flex items-center gap-1.5 text-brand-muted text-xs mb-3">
                <Users size={12} /> {t.seats} seats
              </div>
              {t.status === "occupied" && t.orderAmount && (
                <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg px-2 py-1.5">
                  <div className="text-orange-300 text-xs font-medium">₹{t.orderAmount}</div>
                  <div className="text-orange-400/60 text-xs">{t.itemsCount} items</div>
                </div>
              )}
              {t.status === "available" && (
                <div className="text-green-400/70 text-xs">Tap to open</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
