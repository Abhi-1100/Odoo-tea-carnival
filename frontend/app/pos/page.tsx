"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/store/authStore";
import { useFloorStore } from "@/store/floorStore";
import { useCartStore } from "@/store/cartStore";
import clsx from "clsx";

const statusColor = {
  available: "border-green-500/30 hover:border-green-400 bg-green-500/5",
  occupied: "border-orange-500/30 hover:border-orange-400 bg-orange-500/5",
  reserved: "border-gray-500/30 bg-gray-500/5 cursor-not-allowed opacity-60",
};

export default function POSFloorPage() {
  const router = useRouter();
  const { token, isAuthenticated, hasHydrated } = useAuthStore();
  const { floors, loading, error, activeFloorId, setActiveFloor, fetchFloors } = useFloorStore();
  const { setSession } = useCartStore();
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated || !token) {
      router.push("/login");
      return;
    }

    const init = async () => {
      try {
        const { api } = await import("@/lib/api");
        const sessionRes = await api.sessions.getActive(token);
        
        if (!sessionRes.data) {
          setInitError("No active session. Please open a session first.");
          return;
        }
        
        const session = sessionRes.data as { id: number };
        setSession(session.id);
        await fetchFloors(token);
      } catch (err) {
        setInitError(err instanceof Error ? err.message : "Failed to initialize");
      }
    };

    init();
  }, [hasHydrated, isAuthenticated, token, router, fetchFloors, setSession]);

  const currentFloor = floors.find((f) => f.id === activeFloorId);

  const handleSelectTable = (tableId: number, status: string) => {
    if (status === "reserved") return;
    router.push(`/pos/order/${tableId}`);
  };

  if (initError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-brand-danger mb-4">{initError}</p>
          <button onClick={() => router.push("/dashboard")} className="btn-primary">
            Go to Backend
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Floor Tabs */}
      <div className="flex gap-1 px-6 pt-4 border-b border-brand-border shrink-0">
        {floors.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFloor(f.id)}
            className={clsx(
              "px-4 py-2 text-sm font-medium rounded-t-lg transition-all -mb-px border-b-2",
              f.id === activeFloorId
                ? "border-brand-primary text-white"
                : "border-transparent text-brand-muted hover:text-white"
            )}
          >
            {f.name}
          </button>
        ))}
      </div>

      {/* Table Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {error ? (
          <div className="text-center text-brand-danger">{error}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {currentFloor?.tables.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTable(t.id, t.status)}
                className={clsx(
                  "card p-5 border text-left transition-all duration-200 rounded-xl",
                  statusColor[t.status],
                  t.status !== "reserved" && "hover:scale-[1.02] active:scale-95"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl font-bold text-white">{t.tableNumber}</span>
                  <Badge variant={t.status} dot />
                </div>
                <div className="flex items-center gap-1.5 text-brand-muted text-xs mb-3">
                  <Users size={12} /> {t.seats} seats
                </div>
                {t.status === "available" && (
                  <div className="text-green-400/70 text-xs">Tap to open</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
