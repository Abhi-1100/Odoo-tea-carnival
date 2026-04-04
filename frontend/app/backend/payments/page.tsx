"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
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
  method === "upi" ? "UPI" : method === "cash" ? "Cash" : "Card";

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
      return [p.order.orderNumber, p.paymentMethod.name, p.status, p.upiRef, p.amountPaid.toString()]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });

    const map = new Map<string, PaymentRow[]>();
    filtered.forEach((payment) => {
      const key = payment.paymentMethod.type;
      map.set(key, [...(map.get(key) || []), payment]);
    });

    return Array.from(map.entries()).map(([method, items]) => ({
      method,
      total: items.reduce((sum, item) => sum + Number(item.amountPaid || 0), 0),
      items,
    }));
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
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Payment</h1>
        <p className="text-brand-muted text-sm mt-1">Group payments by method and inspect transactions</p>
      </div>

      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payment, order, reference..."
            className="input-dark pl-9"
          />
        </div>
        <div className="text-brand-muted text-sm">Total payments: {payments.length}</div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between">
          <h2 className="text-white font-semibold">Payments</h2>
          <span className="text-brand-muted text-xs">Group by payment method</span>
        </div>

        <div className="divide-y divide-brand-border">
          {groups.map((group) => {
            const isOpen = expanded.includes(group.method);
            return (
              <div key={group.method}>
                <button
                  onClick={() => toggleExpanded(group.method)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-brand-bg/40 transition-colors text-left"
                >
                  <div>
                    <div className="text-white font-semibold">{methodLabel(group.method)}</div>
                    <div className="text-xs text-brand-muted">{group.items.length} transaction(s)</div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-xs text-brand-muted">Amount</div>
                      <div className="text-white font-semibold">₹{Math.round(group.total).toLocaleString()}</div>
                    </div>
                    <ChevronDown size={16} className={clsx("text-brand-muted transition-transform", isOpen && "rotate-180")} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-brand-border">
                          {['Order', 'Date', 'Amount', 'Status'].map((h) => (
                            <th key={h} className="text-left px-4 py-2 text-xs font-medium text-brand-muted uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map((payment) => (
                          <tr key={payment.id} className="border-b border-brand-border/40 hover:bg-brand-bg/30 transition-colors">
                            <td className="px-4 py-3 text-brand-primary text-sm font-mono">{payment.order.orderNumber}</td>
                            <td className="px-4 py-3 text-brand-muted text-sm">{payment.paidAt ? new Date(payment.paidAt).toLocaleString('en-IN') : '—'}</td>
                            <td className="px-4 py-3 text-white text-sm font-semibold">₹{Math.round(payment.amountPaid).toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <span className={clsx(
                                'px-2 py-1 rounded-md text-xs font-medium border',
                                payment.status === 'confirmed' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                              )}>
                                {payment.status === 'confirmed' ? 'Paid' : 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
