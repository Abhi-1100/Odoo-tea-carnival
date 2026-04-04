"use client";

import { useEffect, useState } from "react";
import { Loader2, ClipboardList, Clock3, Table2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface OrderSummary {
  id: number;
  orderNumber?: string;
  status?: string;
  tableId?: number | null;
  totalAmount?: number;
  createdAt?: string;
}

export default function POSOrdersPage() {
  const router = useRouter();
  const { token, isAuthenticated, hasHydrated } = useAuthStore();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated || !token) {
      router.push("/login");
      return;
    }

    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await api.orders.getAll(token, { limit: "50" });
        setOrders((response.data as OrderSummary[]) || []);
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [hasHydrated, isAuthenticated, token, router]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary" size={36} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-4">
      <div className="card p-0 overflow-hidden">
        <div className="border-b border-brand-border px-4 py-3 bg-brand-bg/30 flex items-center gap-2 text-white font-medium">
          <ClipboardList size={16} className="text-brand-primary" />
          Orders
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center text-brand-muted">
            No orders yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-border bg-brand-bg/20">
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-brand-muted">Order</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-brand-muted">Table</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-brand-muted">Status</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-brand-muted">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-brand-border/60 hover:bg-brand-bg/40">
                    <td className="px-4 py-3 text-white font-medium">{order.orderNumber || `#${order.id}`}</td>
                    <td className="px-4 py-3 text-brand-muted">
                      <span className="inline-flex items-center gap-1">
                        <Table2 size={13} />
                        {order.tableId || "Takeaway"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brand-muted">{order.status || "open"}</td>
                    <td className="px-4 py-3 text-brand-muted">
                      <span className="inline-flex items-center gap-1">
                        <Clock3 size={13} />
                        {order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
