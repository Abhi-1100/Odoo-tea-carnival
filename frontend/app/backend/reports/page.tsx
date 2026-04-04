"use client";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, ShoppingCart, DollarSign, Star, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { salesByDay, paymentBreakdown, sessions } from "@/data/sessions";
import { products } from "@/data/products";
import { orders } from "@/data/orders";
import toast from "react-hot-toast";

const periods = ["Today", "This Week", "This Month", "Custom Range"];

export default function ReportsPage() {
  const [period, setPeriod] = useState("This Week");

  const totalSales = salesByDay.reduce((s, d) => s + d.sales, 0);
  const orderCount = sessions.filter(s => s.status === "closed").reduce((s, v) => s + v.ordersCount, 0);
  const avgOrder = Math.round(totalSales / Math.max(orderCount, 1));

  const kpis = [
    { label: "Total Sales", value: `₹${totalSales.toLocaleString()}`, icon: DollarSign, color: "text-brand-primary bg-brand-primary/20", change: "+18%" },
    { label: "Orders Count", value: orderCount.toString(), icon: ShoppingCart, color: "text-brand-teal bg-brand-teal/20", change: "+12%" },
    { label: "Avg Order Value", value: `₹${avgOrder}`, icon: TrendingUp, color: "text-orange-400 bg-orange-400/20", change: "+5%" },
    { label: "Top Product", value: "Margherita Pizza", icon: Star, color: "text-purple-400 bg-purple-400/20", change: "38 sold" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-white">Reports</h1><p className="text-brand-muted text-sm mt-1">Sales analytics and performance</p></div>
        <div className="flex gap-2 flex-wrap">
          {periods.map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${period === p ? "bg-brand-primary text-white" : "bg-brand-card text-brand-muted hover:text-white border border-brand-border"}`}>{p}</button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-brand-muted text-xs mb-2">{k.label}</p>
                <p className="text-2xl font-bold text-white truncate">{k.value}</p>
                <p className="text-green-400 text-xs mt-1 font-medium">{k.change}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${k.color}`}><k.icon size={18} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Bar Chart */}
        <div className="card p-6 xl:col-span-3">
          <h2 className="text-white font-semibold mb-4">Sales Over Time</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salesByDay} barSize={30}>
              <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#2a2a3e", border: "1px solid #3a3a5e", borderRadius: "8px", color: "#fff" }} formatter={(v: number) => [`₹${v.toLocaleString()}`, "Sales"]} />
              <Bar dataKey="sales" fill="#e84393" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card p-6 xl:col-span-2">
          <h2 className="text-white font-semibold mb-4">Payment Breakdown</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={paymentBreakdown} dataKey="value" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                {paymentBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`, ""]} contentStyle={{ background: "#2a2a3e", border: "1px solid #3a3a5e", borderRadius: "8px", color: "#fff" }} />
              <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between">
          <h2 className="text-white font-semibold">All Orders</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" icon={<Download size={14} />} onClick={() => toast.success("Exporting PDF...")}>PDF</Button>
            <Button size="sm" variant="ghost" icon={<Download size={14} />} onClick={() => toast.success("Exporting XLS...")}>XLS</Button>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-border">
              {["Order ID", "Table", "Items", "Subtotal", "Tax", "Total", "Method", "Status"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b border-brand-border/50 hover:bg-brand-bg/40 transition-colors">
                <td className="px-5 py-3 text-brand-primary font-mono text-sm">#{o.id.toUpperCase()}</td>
                <td className="px-5 py-3 text-white text-sm">T{o.tableNumber}</td>
                <td className="px-5 py-3 text-brand-muted text-sm">{o.items.map(i => i.name).join(", ").slice(0, 30)}…</td>
                <td className="px-5 py-3 text-white text-sm">₹{o.subtotal}</td>
                <td className="px-5 py-3 text-brand-muted text-sm">₹{o.tax}</td>
                <td className="px-5 py-3 text-white font-semibold text-sm">₹{o.total}</td>
                <td className="px-5 py-3 text-brand-muted text-sm capitalize">{o.paymentMethod || "—"}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${o.status === "completed" ? "bg-green-500/20 text-green-400 border-green-500/30" : o.status === "preparing" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-orange-500/20 text-orange-400 border-orange-500/30"}`}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
