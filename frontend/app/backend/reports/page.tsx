"use client";
import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";
import { TrendingUp, ShoppingCart, DollarSign, Star, Download, Loader2, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import clsx from "clsx";

const periods = ["Today", "Weekly", "Monthly", "365 Days", "Custom"] as const;
type PeriodLabel = (typeof periods)[number];

const periodMap: Partial<Record<PeriodLabel, string>> = {
  Today: "today",
  Weekly: "week",
  Monthly: "month",
};

interface SalesOrder {
  id: number;
  sessionId: number | null;
  createdBy: number | null;
  totalAmount: number;
  createdAt: string;
  table: { tableNumber: number } | null;
  createdByUser?: { name: string };
  payments?: Array<{ paymentMethod?: { type?: string } | null; amountPaid: number }>;
}

interface ProductsReportRow {
  productId: number;
  productName: string;
  category: string;
  totalQuantity: number;
  totalRevenue: number;
}

export default function ReportsPage() {
  const { token } = useAuthStore();
  const [period, setPeriod] = useState<PeriodLabel>("Weekly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [responsibleId, setResponsibleId] = useState<string>("all");
  const [sessionId, setSessionId] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [productsData, setProductsData] = useState<ProductsReportRow[]>([]);
  const [sessions, setSessions] = useState<Array<{ id: number; terminalName?: string | null }>>([]);

  const toYmd = (date: Date) => date.toISOString().split("T")[0];

  const buildQueryParams = () => {
    const params: Record<string, string> = {};

    if (period === "365 Days") {
      const today = new Date();
      const from = new Date(today);
      from.setDate(today.getDate() - 365);
      params.period = "custom";
      params.startDate = toYmd(from);
      params.endDate = toYmd(today);
    } else if (period === "Custom") {
      if (startDate && endDate) {
        params.period = "custom";
        params.startDate = startDate;
        params.endDate = endDate;
      }
    } else {
      const mapped = periodMap[period];
      if (mapped) params.period = mapped;
    }

    return params;
  };

  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const params = buildQueryParams();
        const [salesRes, productsRes, sessionsRes] = await Promise.all([
          api.reports.sales(token, params),
          api.reports.products(token, params),
          api.sessions.getAll(token),
        ]);

        const salesData = (salesRes.data as { orders?: SalesOrder[] }) || {};
        setSalesOrders(salesData.orders || []);
        setProductsData((productsRes.data as ProductsReportRow[]) || []);
        setSessions((sessionsRes.data as Array<{ id: number; terminalName?: string | null }>) || []);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, period, startDate, endDate]);

  const responsibles = useMemo(() => {
    const map = new Map<number, string>();
    salesOrders.forEach((order) => {
      if (typeof order.createdBy === "number") {
        map.set(order.createdBy, order.createdByUser?.name || `User ${order.createdBy}`);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [salesOrders]);

  const filteredOrders = useMemo(() => {
    return salesOrders.filter((order) => {
      if (sessionId !== "all" && String(order.sessionId) !== sessionId) return false;
      if (responsibleId !== "all" && String(order.createdBy) !== responsibleId) return false;
      return true;
    });
  }, [salesOrders, sessionId, responsibleId]);

  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    productsData
      .filter((p) => selectedProduct === "all" || String(p.productId) === selectedProduct)
      .forEach((row) => {
        map.set(row.category, (map.get(row.category) || 0) + Number(row.totalRevenue || 0));
      });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [productsData, selectedProduct]);

  const totalRevenue = filteredOrders.reduce((sum, row) => sum + Number(row.totalAmount || 0), 0);
  const totalOrders = filteredOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const salesTimeline = useMemo(() => {
    const map = new Map<string, number>();
    filteredOrders.forEach((order) => {
      const dt = new Date(order.createdAt);
      const key = period === "Today"
        ? dt.toLocaleTimeString("en-IN", { hour: "numeric" })
        : dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      map.set(key, (map.get(key) || 0) + Number(order.totalAmount || 0));
    });
    return Array.from(map.entries()).map(([time, sales]) => ({ time, sales }));
  }, [filteredOrders, period]);

  const pieColors = ["#f3b26b", "#f97316", "#60a5fa", "#22c55e", "#2563eb", "#a855f7"];

  const topOrders = useMemo(
    () => [...filteredOrders].sort((a, b) => Number(b.totalAmount) - Number(a.totalAmount)).slice(0, 5),
    [filteredOrders],
  );

  const topProducts = useMemo(
    () => [...productsData]
      .filter((p) => selectedProduct === "all" || String(p.productId) === selectedProduct)
      .sort((a, b) => Number(b.totalRevenue) - Number(a.totalRevenue))
      .slice(0, 6),
    [productsData, selectedProduct],
  );

  const handleExport = async (type: "pdf" | "xls") => {
    if (!token) return;
    try {
      const params = buildQueryParams();
      if (sessionId !== "all") params.sessionId = sessionId;
      if (responsibleId !== "all") params.responsibleId = responsibleId;

      const blob = type === "pdf"
        ? await api.reports.exportPdf(token, params)
        : await api.reports.exportXls(token, params);

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `report-${period.toLowerCase().replace(/\s+/g, "-")}.${type === "pdf" ? "pdf" : "xlsx"}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported ${type.toUpperCase()} successfully`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to export ${type.toUpperCase()}`);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Dashboard Reporting</h1>
          <p className="text-brand-muted text-sm mt-1">Real-time reporting based on selected filters</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" icon={<Download size={14} />} onClick={() => handleExport("pdf")}>PDF</Button>
          <Button size="sm" variant="ghost" icon={<Download size={14} />} onClick={() => handleExport("xls")}>XLS</Button>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          <div className="flex items-center gap-2 text-xs text-brand-muted">
            <CalendarClock size={14} />
            Duration
          </div>
          <div className="lg:col-span-4 flex flex-wrap gap-2">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={clsx(
                  "px-3 py-1.5 rounded-md text-xs border transition-all",
                  period === p
                    ? "bg-brand-primary text-brand-text border-brand-primary"
                    : "bg-brand-bg text-brand-muted border-brand-border hover:text-brand-text",
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {period === "Custom" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-dark" />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-dark" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select className="input-dark" value={responsibleId} onChange={(e) => setResponsibleId(e.target.value)}>
            <option value="all">Responsible: All</option>
            {responsibles.map((r) => (
              <option key={r.id} value={String(r.id)}>{r.name}</option>
            ))}
          </select>

          <select className="input-dark" value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
            <option value="all">Session: All</option>
            {sessions.map((s) => (
              <option key={s.id} value={String(s.id)}>{s.terminalName || `Session ${s.id}`}</option>
            ))}
          </select>

          <select className="input-dark" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
            <option value="all">Product: All</option>
            {productsData.map((p) => (
              <option key={p.productId} value={String(p.productId)}>{p.productName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-brand-muted text-xs mb-2">Total orders</p>
              <p className="text-3xl font-bold text-brand-text">{totalOrders}</p>
              <p className="text-green-400 text-xs mt-1">Based on selection</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-brand-teal bg-brand-teal/20"><ShoppingCart size={18} /></div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-brand-muted text-xs mb-2">Revenue</p>
              <p className="text-3xl font-bold text-brand-text">₹{Math.round(totalRevenue).toLocaleString()}</p>
              <p className="text-green-400 text-xs mt-1">Since last period</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-brand-primary bg-brand-primary/20"><DollarSign size={18} /></div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-brand-muted text-xs mb-2">Average Order</p>
              <p className="text-3xl font-bold text-brand-text">₹{Math.round(averageOrderValue).toLocaleString()}</p>
              <p className="text-red-400 text-xs mt-1">Calculated live</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-orange-400 bg-orange-400/20"><TrendingUp size={18} /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="card p-6 xl:col-span-3">
          <h2 className="text-brand-text font-semibold mb-4">Sales</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={salesTimeline} margin={{ left: 12, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#31354a" />
              <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip contentStyle={{ background: "#1f2233", border: "1px solid #343a56", borderRadius: "8px", color: "#fff" }} formatter={(v: number) => [`₹${Math.round(v).toLocaleString()}`, "Sales"]} />
              <Line type="monotone" dataKey="sales" stroke="#7dd3fc" strokeWidth={2.5} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6 xl:col-span-2">
          <h2 className="text-brand-text font-semibold mb-4">Top selling Category</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={categoryTotals}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={88}
                innerRadius={46}
              >
                {categoryTotals.map((entry, i) => <Cell key={entry.name} fill={pieColors[i % pieColors.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`₹${Math.round(v).toLocaleString()}`, "Revenue"]} contentStyle={{ background: "#1f2233", border: "1px solid #343a56", borderRadius: "8px", color: "#fff" }} />
              <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between">
          <h2 className="text-brand-text font-semibold">Top Orders</h2>
          <span className="text-brand-muted text-xs">High amount among available orders</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-border">
              {["Order", "Session", "Point of Sale", "Date", "Employee", "Total"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topOrders.length > 0 ? (
              topOrders.map((o) => (
                <tr key={o.id} className="border-b border-brand-border/40 hover:bg-brand-bg/40 transition-colors">
                  <td className="px-5 py-3 text-brand-primary text-sm font-mono">SHOP{o.id}</td>
                  <td className="px-5 py-3 text-brand-muted text-sm">POS/{o.sessionId || "-"}</td>
                  <td className="px-5 py-3 text-brand-muted text-sm">Shop Virtual Admin</td>
                  <td className="px-5 py-3 text-brand-muted text-sm">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-3 text-brand-muted text-sm">{o.createdByUser?.name || "-"}</td>
                  <td className="px-5 py-3 text-brand-text text-sm font-semibold">₹{Math.round(Number(o.totalAmount)).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-brand-muted">No top orders for this selection</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-brand-primary font-semibold mb-4">Top Product</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border">
                {["Product", "Qty", "Revenue"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-medium text-brand-muted uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topProducts.length > 0 ? (
                topProducts.map((p) => (
                  <tr key={p.productId} className="border-b border-brand-border/30">
                    <td className="px-3 py-2 text-brand-text text-sm">{p.productName}</td>
                    <td className="px-3 py-2 text-brand-muted text-sm">{p.totalQuantity}</td>
                    <td className="px-3 py-2 text-brand-text text-sm">₹{Math.round(Number(p.totalRevenue)).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-brand-muted">No product data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card p-6">
          <h2 className="text-brand-primary font-semibold mb-4">Top Category</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border">
                {["Category", "Revenue"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-medium text-brand-muted uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categoryTotals.length > 0 ? (
                categoryTotals.slice(0, 6).map((c) => (
                  <tr key={c.name} className="border-b border-brand-border/30">
                    <td className="px-3 py-2 text-brand-text text-sm">{c.name}</td>
                    <td className="px-3 py-2 text-brand-text text-sm">₹{Math.round(Number(c.value)).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-3 py-6 text-center text-brand-muted">No category data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
