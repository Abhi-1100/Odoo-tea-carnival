"use client";
import { useState } from "react";
import { Power, Clock, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { sessions } from "@/data/sessions";
import toast from "react-hot-toast";

export default function TerminalPage() {
  const [sessionOpen, setSessionOpen] = useState(true);

  const fmt = (dt: string) => new Date(dt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  const latestClosed = sessions.find(s => s.status === "closed");

  const handleToggleSession = () => {
    setSessionOpen(p => !p);
    toast.success(sessionOpen ? "Session closed successfully." : "New session opened!");
  };

  return (
    <div className="p-8 space-y-8">
      <div><h1 className="text-2xl font-bold text-white">POS Terminal</h1><p className="text-brand-muted text-sm mt-1">Manage your POS sessions</p></div>

      {/* Terminal Card */}
      <div className="card p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center"><Power size={22} className="text-brand-primary" /></div>
          <div>
            <div className="text-white font-bold text-lg">POS Terminal #1</div>
            <div className="text-brand-muted text-sm">Main Counter — Cafe Manager</div>
          </div>
          <Badge variant={sessionOpen ? "open" : "closed"} className="ml-auto" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-brand-bg rounded-xl p-4">
            <div className="text-brand-muted text-xs mb-1 flex items-center gap-1.5"><Calendar size={12} /> Last Session</div>
            <div className="text-white text-sm font-medium">{latestClosed ? fmt(latestClosed.openedAt) : "—"}</div>
          </div>
          <div className="bg-brand-bg rounded-xl p-4">
            <div className="text-brand-muted text-xs mb-1 flex items-center gap-1.5"><TrendingUp size={12} /> Last Closing Sale</div>
            <div className="text-white text-sm font-medium">₹{latestClosed?.totalSales.toLocaleString() || "—"}</div>
          </div>
        </div>

        <Button fullWidth size="lg" variant={sessionOpen ? "danger" : "success"} icon={<Power size={18} />} onClick={handleToggleSession}>
          {sessionOpen ? "Close Session" : "Open New Session"}
        </Button>
      </div>

      {/* Session History */}
      <div>
        <h2 className="text-white font-semibold mb-4">Session History</h2>
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border">
                {["Session", "Opened", "Closed", "Orders", "Total Sales", "Status"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id} className="border-b border-brand-border/50 hover:bg-brand-bg/40 transition-colors">
                  <td className="px-5 py-3 text-white text-sm font-medium">{s.name}</td>
                  <td className="px-5 py-3 text-brand-muted text-sm">{fmt(s.openedAt)}</td>
                  <td className="px-5 py-3 text-brand-muted text-sm">{s.closedAt ? fmt(s.closedAt) : <span className="text-brand-teal">Active</span>}</td>
                  <td className="px-5 py-3 text-brand-muted text-sm">{s.ordersCount}</td>
                  <td className="px-5 py-3 text-white text-sm font-semibold">₹{s.totalSales.toLocaleString()}</td>
                  <td className="px-5 py-3"><Badge variant={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
