"use client";
import Link from "next/link";
import { TrendingUp, Package, ShoppingCart, DollarSign, ArrowRight, Coffee } from "lucide-react";
import { sessions, salesByDay } from "@/data/sessions";
import { products } from "@/data/products";
import { orders } from "@/data/orders";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const kpis = [
  { label: "Today's Sales", value: "₹4,200", icon: DollarSign, color: "bg-brand-primary/20 text-brand-primary", change: "+12%" },
  { label: "Total Orders", value: "14", icon: ShoppingCart, color: "bg-brand-teal/20 text-brand-teal", change: "+5%" },
  { label: "Active Products", value: products.filter(p => p.status === "active").length.toString(), icon: Package, color: "bg-purple-500/20 text-purple-400", change: "" },
  { label: "Avg Order Value", value: "₹300", icon: TrendingUp, color: "bg-orange-500/20 text-orange-400", change: "+8%" },
];

const quickLinks = [
  { label: "Manage Products", href: "/backend/products", icon: Package },
  { label: "Floor Plan", href: "/backend/floors", icon: Coffee },
  { label: "Open POS", href: "/pos", icon: ShoppingCart },
  { label: "View Reports", href: "/backend/reports", icon: TrendingUp },
];

export default function BackendDashboard() {
  const recentOrders = orders.slice(0, 4);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-brand-muted text-sm mt-1">Welcome back, Admin — here{"'"}s what{"'"}s happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-brand-muted text-xs font-medium mb-2">{k.label}</p>
                <p className="text-2xl font-bold text-white">{k.value}</p>
                {k.change && <p className="text-green-400 text-xs mt-1 font-medium">{k.change} vs yesterday</p>}
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${k.color}`}>
                <k.icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="card p-6 xl:col-span-2">
          <h2 className="text-white font-semibold mb-4">Sales This Week</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={salesByDay} barSize={32}>
              <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#2a2a3e", border: "1px solid #3a3a5e", borderRadius: "8px", color: "#fff" }} formatter={(v: number) => [`₹${v.toLocaleString()}`, "Sales"]} />
              <Bar dataKey="sales" fill="#e84393" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Links */}
        <div className="card p-6">
          <h2 className="text-white font-semibold mb-4">Quick Links</h2>
          <div className="space-y-2">
            {quickLinks.map((q) => (
              <Link key={q.href} href={q.href} className="flex items-center justify-between p-3 rounded-lg hover:bg-brand-bg transition-colors group">
                <div className="flex items-center gap-3">
                  <q.icon size={16} className="text-brand-primary" />
                  <span className="text-sm text-white">{q.label}</span>
                </div>
                <ArrowRight size={14} className="text-brand-muted group-hover:text-brand-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-border">
          <h2 className="text-white font-semibold">Recent Orders</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-border">
              {["Order ID", "Table", "Items", "Total", "Status"].map((h) => (
                <th key={h} className="text-left px-6 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id} className="border-b border-brand-border/50 hover:bg-brand-bg/50 transition-colors">
                <td className="px-6 py-3 text-brand-primary font-mono text-sm">#{o.id.toUpperCase()}</td>
                <td className="px-6 py-3 text-white text-sm">Table {o.tableNumber}</td>
                <td className="px-6 py-3 text-brand-muted text-sm">{o.items.length} items</td>
                <td className="px-6 py-3 text-white text-sm font-medium">₹{o.total}</td>
                <td className="px-6 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${o.status === "completed" ? "bg-green-500/20 text-green-400 border-green-500/30" : o.status === "preparing" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-orange-500/20 text-orange-400 border-orange-500/30"}`}>
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
