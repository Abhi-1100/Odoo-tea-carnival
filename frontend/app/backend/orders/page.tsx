"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Archive, Check, ChevronDown, FileDown, Loader2, Menu, Search, Trash2, X } from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  product: { id: number; name: string };
  variant?: { id: number; attribute: string; value: string } | null;
}

interface Payment {
  id: number;
  method?: string;
  status?: string;
}

interface Order {
  id: number;
  orderNumber: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  notes?: string | null;
  table?: { id: number; tableNumber: number } | null;
  session?: { id: number; terminalName: string } | null;
  createdByUser?: { id: number; name: string } | null;
  items: OrderItem[];
  payments?: Payment[];
}

const statusStyles: Record<string, string> = {
  draft: "bg-slate-500/20 text-slate-200 border-slate-500/30",
  sent_to_kitchen: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  preparing: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  completed: "bg-green-500/20 text-green-300 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
};

const statusLabel = (status: string) =>
  status
    .replace(/_/g, " ")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function BackendOrdersPage() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [actionOpen, setActionOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchOrders = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.orders.getAll(token);
      const nextOrders = (res.data as Order[]) || [];
      setOrders(nextOrders);

      // Keep selection only if the selected order still exists after refresh.
      if (selectedOrderId && !nextOrders.some((order) => order.id === selectedOrderId)) {
        setSelectedOrderId(null);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredOrders = useMemo(() => {
    const term = search.toLowerCase().trim();
    return orders.filter((order) => {
      if (!term) return true;
      return [order.orderNumber, order.table?.tableNumber?.toString(), order.session?.terminalName, order.createdByUser?.name, order.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [orders, search]);

  const selectedOrders = useMemo(
    () => orders.filter((order) => selectedIds.includes(order.id)),
    [orders, selectedIds],
  );

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) || null;

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    const ids = filteredOrders.map((order) => order.id);
    const allSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : ids);
  };

  const deleteSelected = async () => {
    if (!token || selectedIds.length === 0) return;

    const draftOnly = selectedOrders.every((order) => order.status === "draft");
    if (!draftOnly) {
      toast.error("Only draft orders can be deleted");
      return;
    }

    if (!confirm(`Delete ${selectedIds.length} selected order(s)?`)) return;

    setDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => api.orders.delete(id, token)));
      toast.success("Selected orders deleted");
      setSelectedIds([]);
      fetchOrders();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete selected orders");
    } finally {
      setDeleting(false);
    }
  };

  const archiveSelected = async () => {
    if (!token || selectedIds.length === 0) return;

    const draftOnly = selectedOrders.every((order) => order.status === "draft");
    if (!draftOnly) {
      toast.error("Only draft orders can be archived");
      return;
    }

    try {
      await Promise.all(selectedIds.map((id) => api.orders.updateStatus(id, "cancelled", token)));
      toast.success("Selected orders archived");
      setSelectedIds([]);
      fetchOrders();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to archive orders");
    }
  };

  const updateStatus = async (orderId: number, status: string) => {
    if (!token) return;
    try {
      await api.orders.updateStatus(orderId, status, token);
      toast.success(`Order marked as ${statusLabel(status)}`);
      fetchOrders();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update order status");
    }
  };

  const orderTotals = (order: Order) => {
    const subtotal = order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = order.totalAmount - subtotal;
    return { subtotal, tax, total: order.totalAmount };
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-brand-primary" size={36} />
      </div>
    );
  }

  const allSelected = filteredOrders.length > 0 && filteredOrders.every((order) => selectedIds.includes(order.id));

  return (
    <div className="p-8 space-y-6">
      <div className="-mx-8 -mt-8 border-b border-brand-border/60 bg-[#2b2e4a] px-5 py-3 flex items-center justify-between text-sm text-brand-muted">
        <div className="flex items-center gap-6">
          <Link href="/backend/orders" className="text-white">Orders</Link>
          <Link href="/backend/products" className="hover:text-white">Products</Link>
          <Link href="/backend/reports" className="hover:text-white">Reporting</Link>
        </div>
        <button className="text-brand-muted hover:text-white" aria-label="Open menu">
          <Menu size={16} />
        </button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-white">Orders</h1>
        <p className="text-brand-muted text-sm mt-1">Manage draft, paid, and kitchen-sent orders</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
        <div className="xl:col-span-3 space-y-4">
          <div className="card p-4 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search order, table, customer, session..."
                  className="input-dark pl-9"
                />
              </div>
              <div className="flex items-center gap-2 relative">
                {selectedIds.length > 0 && (
                  <span className="px-3 py-2 rounded-md bg-brand-primary/20 text-brand-primary text-sm">{selectedIds.length} selected</span>
                )}
                <Button variant="ghost" icon={<ChevronDown size={14} />} onClick={() => setActionOpen((v) => !v)}>
                  Action
                </Button>
                {actionOpen && (
                  <div className="absolute right-0 top-12 z-20 min-w-40 rounded-xl border border-brand-border bg-[#1b2030] shadow-2xl overflow-hidden">
                    <button onClick={archiveSelected} className="flex w-full items-center gap-2 px-4 py-3 text-sm text-brand-muted hover:text-white hover:bg-brand-bg">
                      <Archive size={14} /> Archived
                    </button>
                    <button onClick={deleteSelected} className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-300 hover:text-white hover:bg-brand-bg">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-brand-muted">
              <button onClick={toggleSelectAll} className="inline-flex items-center gap-2 rounded-md border border-brand-border px-3 py-1.5 hover:text-white">
                {allSelected ? <Check size={14} /> : <span className="w-3.5 h-3.5 rounded border border-brand-border" />} Select all
              </button>
              <span className="ml-auto">Draft orders can be archived or deleted</span>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-brand-border bg-brand-bg/30 flex items-center justify-between">
              <h2 className="text-white font-semibold">Orders</h2>
              <button className="text-brand-muted hover:text-white text-xs inline-flex items-center gap-1" onClick={() => fetchOrders()}>
                <FileDown size={12} /> Refresh
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-border">
                  {["", "Order No", "Session", "Date", "Total", "Customer", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? filteredOrders.map((order) => {
                  const totals = orderTotals(order);
                  const isSelected = selectedIds.includes(order.id);
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={clsx(
                        "border-b border-brand-border/40 cursor-pointer hover:bg-brand-bg/40 transition-colors",
                        isSelected && "bg-brand-primary/10",
                        selectedOrderId === order.id && "bg-white/[0.03]"
                      )}
                    >
                      <td className="px-4 py-3">
                        <button onClick={(e) => { e.stopPropagation(); toggleSelect(order.id); }} className="inline-flex h-5 w-5 items-center justify-center rounded border border-brand-border text-brand-muted hover:text-white">
                          {isSelected ? <Check size={12} /> : null}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-brand-primary font-mono text-sm">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-brand-muted text-sm">{order.session?.terminalName || `Session ${order.session?.id || "-"}`}</td>
                      <td className="px-4 py-3 text-brand-muted text-sm">{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-3 text-white text-sm font-semibold">₹{Math.round(totals.total).toLocaleString()}</td>
                      <td className="px-4 py-3 text-brand-muted text-sm">{order.createdByUser?.name || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={clsx("px-2 py-1 rounded-md text-xs font-medium border", statusStyles[order.status] || statusStyles.draft)}>
                          {statusLabel(order.status)}
                        </span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-brand-muted">No orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-2">
          {selectedOrder ? (
            <div className="card overflow-hidden sticky top-8">
              <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
                <div>
                  <div className="text-xl font-bold text-white">{selectedOrder.orderNumber}</div>
                  <div className="text-brand-muted text-sm">{new Date(selectedOrder.createdAt).toLocaleString("en-IN")}</div>
                </div>
                <div className="flex gap-2">
                  {selectedOrder.status === "draft" ? (
                    <>
                      <button onClick={() => updateStatus(selectedOrder.id, "cancelled")} className="px-3 py-1.5 rounded-md border border-red-500/30 text-red-300 text-sm">Draft</button>
                      <button onClick={() => updateStatus(selectedOrder.id, "completed")} className="px-3 py-1.5 rounded-md border border-green-500/30 text-green-300 text-sm">Paid</button>
                    </>
                  ) : (
                    <span className={clsx("px-3 py-1.5 rounded-md border text-sm", statusStyles[selectedOrder.status] || statusStyles.completed)}>{statusLabel(selectedOrder.status)}</span>
                  )}
                </div>
              </div>

              <div className="px-5 py-4 space-y-2 text-sm text-brand-muted border-b border-brand-border">
                <div className="flex justify-between"><span>Order number</span><span className="text-white">{selectedOrder.orderNumber}</span></div>
                <div className="flex justify-between"><span>Date</span><span className="text-white">{new Date(selectedOrder.createdAt).toLocaleDateString("en-IN")}</span></div>
                <div className="flex justify-between"><span>Session</span><span className="text-white">{selectedOrder.session?.terminalName || "-"}</span></div>
                <div className="flex justify-between"><span>Customer</span><span className="text-white">{selectedOrder.createdByUser?.name || "-"}</span></div>
              </div>

              <div className="px-5 pt-4 flex gap-2 border-b border-brand-border">
                <button className="px-3 py-2 text-sm bg-brand-bg rounded-t-md text-white border border-brand-border border-b-0">Product</button>
                <button className="px-3 py-2 text-sm text-brand-muted">Extra Info</button>
              </div>

              <div className="px-5 py-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-border">
                      {["Product", "QTY", "amount", "Tax", "UOM", "Sub-Total", "Total"].map((h) => (
                        <th key={h} className="text-left py-2 text-xs text-brand-muted uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item) => {
                      const lineTotal = item.quantity * item.unitPrice;
                      const tax = lineTotal * 0.05;
                      return (
                        <tr key={item.id} className="border-b border-brand-border/30">
                          <td className="py-2 text-sky-300">{item.product.name} →</td>
                          <td className="py-2 text-white">{item.quantity}</td>
                          <td className="py-2 text-white">{item.unitPrice ? `₹${item.unitPrice}` : "-"}</td>
                          <td className="py-2 text-white">5%</td>
                          <td className="py-2 text-white">Unit</td>
                          <td className="py-2 text-white">₹{Math.round(lineTotal).toLocaleString()}</td>
                          <td className="py-2 text-white">₹{Math.round(lineTotal + tax).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="mt-4 space-y-2 text-sm">
                  {(() => {
                    const totals = orderTotals(selectedOrder);
                    return (
                      <>
                        <div className="flex justify-between text-brand-muted"><span>Total w/t</span><span>{Math.round(totals.subtotal).toLocaleString()}</span></div>
                        <div className="flex justify-between text-brand-muted"><span>Tax:</span><span>{Math.round(totals.tax).toLocaleString()}</span></div>
                        <div className="flex justify-between text-white font-bold text-lg"><span>Final Total</span><span>{Math.round(totals.total).toLocaleString()}</span></div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center text-brand-muted">Select an order to view details</div>
          )}
        </div>
      </div>

      <Modal open={deleting} onClose={() => setDeleting(false)} title="Deleting Orders" size="sm">
        <div className="flex items-center justify-center py-6 text-brand-muted gap-3">
          <Loader2 className="animate-spin" size={18} />
          Working...
        </div>
      </Modal>
    </div>
  );
}
