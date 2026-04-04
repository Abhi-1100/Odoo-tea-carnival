"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2, Search, Menu } from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface PaymentRow {
  id: number;
  status: string;
  amountPaid: number;
  changeAmount: number;
  upiRef?: string | null;
  paidAt?: string;
  paymentMethod: { id: number; name: string; type: string };
  order: { id: number; orderNumber: string; totalAmount: number };
}

interface Group {
  method: string;
  total: number;
  items: PaymentRow[];
}

const methodLabel = (method: string) =>
  method === "upi" ? "UPI" : method === "cash" ? "Cash" : method === "digital" ? "Card" : "Other";

const methodOrder: Record<string, number> = {
  digital: 1,
  cash: 2,
  upi: 3,
};

export default function BackendPaymentsPage() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string[]>(["cash"]);

  const loadPayments = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.payments.getAll(token);
      setPayments((res.data as PaymentRow[]) || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const groups = useMemo<Group[]>(() => {
    const filtered = payments.filter((p) => {
      const term = search.toLowerCase().trim();
      if (!term) return true;
      return [p.order.orderNumber, p.paymentMethod.name, p.status, p.upiRef, p.amountPaid.toString(), p.paymentMethod.type]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });

    const map = new Map<string, PaymentRow[]>();
    filtered.forEach((payment) => {
      const key = payment.paymentMethod.type;
      map.set(key, [...(map.get(key) || []), payment]);
    });

    return Array.from(map.entries())
      .map(([method, items]) => ({
        method,
        total: items.reduce((sum, item) => sum + Number(item.amountPaid || 0), 0),
        items,
      }))
      .sort((a, b) => (methodOrder[a.method] || 99) - (methodOrder[b.method] || 99));
  }, [payments, search]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-brand-primary" size={36} />
      </div>
    );
  }

  const toggleExpanded = (method: string) => {
    setExpanded((prev) => (prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]));
  };

  return (
    <div className="p-8">
      <div className="card overflow-hidden border border-brand-border/70">
        <div className="border-b border-brand-border px-5 py-3 flex items-center justify-between text-sm text-brand-muted">
          <div className="flex items-center gap-6">
            <span className="hover:text-white">Orders</span>
            <span className="hover:text-white">Products</span>
            <span className="text-white">Reporting</span>
          </div>
          <button className="text-brand-muted hover:text-white">
            <Menu size={16} />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-brand-border/60">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-white">Payments</h1>
              <p className="text-brand-muted text-sm mt-1">Group by payment method</p>
            </div>
            <div className="relative w-full max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search payment..."
                className="input-dark pl-9"
              />
            </div>
          </div>
        </div>

        <div className="px-5 py-2 bg-brand-bg/40 border-b border-brand-border/60">
          <div className="grid grid-cols-12 text-[13px] text-brand-muted font-semibold">
            <div className="col-span-5">Payment method</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-4 text-right">Amount</div>
          </div>
        </div>

        <div>
          {groups.length === 0 ? (
            <div className="px-5 py-10 text-center text-brand-muted">No payment records found</div>
          ) : (
            groups.map((group) => {
              const isOpen = expanded.includes(group.method);

              return (
                <div key={group.method} className="border-b border-brand-border/50 last:border-b-0">
                  <button
                    onClick={() => toggleExpanded(group.method)}
                    className="w-full px-5 py-2.5 grid grid-cols-12 items-center hover:bg-brand-bg/40 transition-colors"
                  >
                    <div className="col-span-5 flex items-center gap-2 text-left text-white font-medium">
                      <ChevronDown
                        size={14}
                        className={clsx("text-brand-muted transition-transform", isOpen ? "rotate-0" : "-rotate-90")}
                      />
                      {methodLabel(group.method)}
                    </div>
                    <div className="col-span-3 text-left text-brand-muted">&nbsp;</div>
                    <div className="col-span-4 text-right text-white font-semibold">${Math.round(group.total).toLocaleString()}</div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-2">
                      {group.items.map((payment) => (
                        <div key={payment.id} className="grid grid-cols-12 items-center py-2 text-sm border-t border-brand-border/40">
                          <div className="col-span-5 text-brand-muted">[] {methodLabel(group.method)}</div>
                          <div className="col-span-3 text-brand-muted">
                            {payment.paidAt
                              ? new Date(payment.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })
                              : "-"}
                          </div>
                          <div className="col-span-4 text-right text-white">${Math.round(payment.amountPaid).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
