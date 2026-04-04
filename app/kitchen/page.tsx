"use client";
import { useState, useEffect } from "react";
import { Clock, ChevronRight } from "lucide-react";
import { useKitchenStore } from "@/store/kitchenStore";
import { KitchenStage, KitchenTicket } from "@/data/kitchen";
import clsx from "clsx";

const columns: { id: KitchenStage; label: string; color: string; bg: string }[] = [
  { id: "to-cook", label: "To Cook", color: "text-red-400", bg: "bg-red-500/20 border-red-500/30" },
  { id: "preparing", label: "Preparing", color: "text-yellow-400", bg: "bg-yellow-500/20 border-yellow-500/30" },
  { id: "completed", label: "Completed", color: "text-green-400", bg: "bg-green-500/20 border-green-500/30" },
];

function elapsed(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  return diff < 1 ? "Just now" : `${diff}m ago`;
}

export default function KitchenPage() {
  const { tickets, moveTicket, toggleItem } = useKitchenStore();
  const [, forceUpdate] = useState(0);

  // Auto-refresh every 15s
  useEffect(() => { const t = setInterval(() => forceUpdate(n => n + 1), 15000); return () => clearInterval(t); }, []);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Header */}
      <header className="bg-brand-card border-b border-brand-border px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-2xl">👨‍🍳</div>
          <div>
            <h1 className="text-white font-bold text-lg">Kitchen Display</h1>
            <p className="text-brand-muted text-xs">Auto-refreshes every 15s</p>
          </div>
        </div>
        <div className="text-brand-muted text-sm">{new Date().toLocaleTimeString("en-IN")}</div>
      </header>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-3 gap-4 p-6 overflow-hidden">
        {columns.map(col => {
          const colTickets = tickets.filter(t => t.stage === col.id);
          return (
            <div key={col.id} className="flex flex-col overflow-hidden">
              {/* Column Header */}
              <div className={clsx("flex items-center justify-between px-4 py-3 rounded-xl mb-4 border", col.bg)}>
                <span className={clsx("font-bold text-sm", col.color)}>{col.label}</span>
                <span className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white", col.id === "to-cook" ? "bg-red-500" : col.id === "preparing" ? "bg-yellow-500" : "bg-green-500")}>
                  {colTickets.length}
                </span>
              </div>

              {/* Tickets */}
              <div className="flex-1 overflow-y-auto space-y-3">
                {colTickets.map(ticket => (
                  <TicketCard key={ticket.id} ticket={ticket} onMove={() => moveTicket(ticket.id)} onToggleItem={(pid) => toggleItem(ticket.id, pid)} stage={col.id} />
                ))}
                {colTickets.length === 0 && (
                  <div className="text-center py-12 text-brand-muted/50 text-sm">No orders here</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TicketCard({ ticket, onMove, onToggleItem, stage }: { ticket: KitchenTicket; onMove: () => void; onToggleItem: (pid: string) => void; stage: KitchenStage }) {
  const allDone = ticket.items.every(i => i.done);
  return (
    <div className={clsx("card p-4 cursor-pointer hover:border-brand-primary/30 transition-all duration-150", allDone && stage !== "completed" && "border-green-500/30")}>
      {/* Ticket header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-white font-bold text-sm">Table {ticket.tableNumber}</div>
          <div className="text-brand-muted text-xs font-mono">#{ticket.orderId.slice(-6).toUpperCase()}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-brand-muted text-xs"><Clock size={11} />{elapsed(ticket.receivedAt)}</div>
          {stage !== "completed" && (
            <button onClick={onMove} className="p-1.5 rounded-lg bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary transition-all" title="Move to next stage">
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {ticket.items.map(item => (
          <button key={item.productId} onClick={() => onToggleItem(item.productId)} className={clsx("w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all", item.done ? "bg-green-500/10 border border-green-500/20" : "bg-brand-bg hover:bg-brand-bg/80")}>
            <span className="text-base">{item.emoji}</span>
            <span className={clsx("text-sm flex-1", item.done ? "line-through text-brand-muted" : "text-white")}>{item.name}</span>
            <span className={clsx("text-xs font-bold", item.done ? "text-green-400" : "text-brand-muted")}>×{item.qty}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
