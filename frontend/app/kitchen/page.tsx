"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Clock, ChevronRight, Search, ChevronLeft } from "lucide-react";
import { useKitchenStore } from "@/store/kitchenStore";
import { useAuthStore } from "@/store/authStore";
import { KitchenStage } from "@/data/kitchen";
import clsx from "clsx";

type KitchenTicketItemView = {
  productId?: string;
  id?: number;
  name?: string;
  productName?: string;
  qty?: number;
  quantity?: number;
  emoji?: string;
  done?: boolean;
  isPrepared?: boolean;
};

type KitchenTicketView = {
  id: string | number;
  orderId: string | number;
  tableNumber?: string | number;
  ticketNumber?: string;
  receivedAt?: string;
  sentAt?: string;
  stage: string;
  items: KitchenTicketItemView[];
};

const columns: { id: KitchenStage; label: string; color: string; bg: string }[] = [
  { id: "to-cook", label: "To Cook", color: "text-red-400", bg: "bg-red-500/20 border-red-500/30" },
  { id: "preparing", label: "Preparing", color: "text-yellow-400", bg: "bg-yellow-500/20 border-yellow-500/30" },
  { id: "completed", label: "Completed", color: "text-green-400", bg: "bg-green-500/20 border-green-500/30" },
];

function elapsed(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  return diff < 1 ? "Just now" : `${diff}m ago`;
}

function getCategoryFromProductName(name: string) {
  const n = name.toLowerCase();
  if (n.includes("pizza")) return "Pizza";
  if (n.includes("burger")) return "Burger";
  if (n.includes("pasta") || n.includes("spaghetti") || n.includes("penne")) return "Pasta";
  if (n.includes("coffee") || n.includes("espresso") || n.includes("cappuccino")) return "Coffee";
  if (n.includes("drink") || n.includes("soda") || n.includes("smoothie") || n.includes("water")) return "Drink";
  if (n.includes("dessert") || n.includes("brownie") || n.includes("ice cream") || n.includes("sundae")) return "Desert";
  return "Quick Bites";
}

export default function KitchenPage() {
  const router = useRouter();
  const tickets = useKitchenStore((s) => s.tickets) as unknown as KitchenTicketView[];
  const fetchTickets = useKitchenStore((s) => s.fetchTickets);
  const moveTicket = useKitchenStore((s) => s.moveTicket);
  const toggleItem = useKitchenStore((s) => s.toggleItem);
  const [, forceUpdate] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 3;
  const [productFilter, setProductFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const { token, hasHydrated, isAuthenticated } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleTimeString("en-IN"));
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString("en-IN")), 1000);
    return () => clearInterval(timer);
  }, []);

  const clearAllFilters = () => {
    setProductFilter(null);
    setCategoryFilter(null);
    setSearchTerm("");
    setPage(1);
  };

  // Auto-refresh every 15s
  useEffect(() => { const t = setInterval(() => forceUpdate(n => n + 1), 15000); return () => clearInterval(t); }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated || !token) return;

    fetchTickets(token);
    const interval = setInterval(() => fetchTickets(token), 15000);
    return () => clearInterval(interval);
  }, [hasHydrated, isAuthenticated, token, fetchTickets]);

  const filterOptions = useMemo(() => {
    const products = new Set<string>();
    const categories = new Set<string>();

    tickets.forEach((ticket) => {
      ticket.items.forEach((item) => {
        const productName = item.name || item.productName || "Item";
        products.add(productName);
        categories.add(getCategoryFromProductName(productName));
      });
    });

    return {
      products: Array.from(products).sort((a, b) => a.localeCompare(b)),
      categories: Array.from(categories).sort((a, b) => a.localeCompare(b)),
    };
  }, [tickets]);

  const ticketMatchesFilters = (ticket: KitchenTicketView) => {
    const term = searchTerm.trim().toLowerCase();
    const bySearch =
      !term ||
      String(ticket.orderId).toLowerCase().includes(term) ||
      String(ticket.ticketNumber || "").toLowerCase().includes(term) ||
      ticket.items.some((item) => (item.name || item.productName || "").toLowerCase().includes(term));

    const byProduct =
      !productFilter ||
      ticket.items.some((item) => (item.name || item.productName || "Item") === productFilter);

    const byCategory =
      !categoryFilter ||
      ticket.items.some((item) => getCategoryFromProductName(item.name || item.productName || "Item") === categoryFilter);

    return bySearch && byProduct && byCategory;
  };

  const filteredTickets = useMemo(() => tickets.filter((t) => ticketMatchesFilters(t)), [tickets, searchTerm, productFilter, categoryFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  const pageStart = filteredTickets.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, filteredTickets.length);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, productFilter, categoryFilter]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  if (hasHydrated && (!isAuthenticated || !token)) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 text-white">
        <div className="card p-6 max-w-md text-center space-y-2">
          <div className="text-lg font-semibold">Kitchen login required</div>
          <div className="text-brand-muted text-sm">Please sign in again so the kitchen display can load live orders from the server.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Header */}
      <header className="bg-brand-card border-b border-brand-border px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push("/backend/terminal")}
            className="h-9 px-3 rounded-lg bg-brand-bg border border-brand-border text-white text-sm hover:border-brand-primary/50 hover:bg-brand-bg/80 transition-colors"
          >
            Back
          </button>
          <div className="text-2xl">👨‍🍳</div>
          <div>
            <h1 className="text-white font-bold text-lg">Kitchen Display</h1>
            <p className="text-brand-muted text-xs">Auto-refreshes every 15s</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product, order..."
              className="w-64 rounded-lg border border-brand-border bg-brand-bg pl-9 pr-3 py-1.5 text-sm text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-primary"
            />
          </div>
          <div className="flex items-center gap-2 text-brand-muted text-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1 rounded hover:bg-brand-bg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span>{pageStart}-{pageEnd}</span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page >= pageCount}
              className="p-1 rounded hover:bg-brand-bg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="text-brand-muted text-sm" suppressHydrationWarning>
            {mounted ? currentTime : "--:--:--"}
          </div>
        </div>
      </header>

      {/* Filters + Kanban Board */}
      <div className="flex-1 flex gap-4 p-6 overflow-hidden">
        <aside className="w-56 shrink-0 border border-brand-border rounded-xl bg-brand-card overflow-hidden">
          <div className="px-3 py-2 border-b border-brand-border flex items-center justify-between">
            <button
              onClick={clearAllFilters}
              className="text-sm text-sky-300 hover:text-sky-200"
            >
              Clear Filter
            </button>
            <button
              onClick={clearAllFilters}
              className="text-brand-muted hover:text-white"
              title="Clear filter"
            >
              x
            </button>
          </div>

          <div className="px-3 py-2 text-xs font-semibold bg-brand-border text-brand-muted uppercase">Product</div>
          <div className="max-h-40 overflow-y-auto">
            {filterOptions.products.map((product) => (
              <button
                key={product}
                onClick={() => setProductFilter((prev) => (prev === product ? null : product))}
                className={clsx(
                  "w-full text-left px-3 py-1.5 text-sm border-b border-brand-border/30",
                  productFilter === product ? "bg-sky-500/20 text-sky-200" : "text-white hover:bg-brand-bg",
                )}
              >
                {product}
              </button>
            ))}
          </div>

          <div className="px-3 py-2 text-xs font-semibold bg-brand-border text-brand-muted uppercase">Category</div>
          <div className="max-h-40 overflow-y-auto">
            {filterOptions.categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter((prev) => (prev === category ? null : category))}
                className={clsx(
                  "w-full text-left px-3 py-1.5 text-sm border-b border-brand-border/30",
                  categoryFilter === category ? "bg-sky-500/20 text-sky-200" : "text-white hover:bg-brand-bg",
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
          {columns.map(col => {
            const colTickets = filteredTickets.filter((t) => {
              if (!ticketMatchesFilters(t)) return false;

            if (col.id === "to-cook") return t.stage === "to-cook" || t.stage === "to_cook";
            return t.stage === col.id;
          });
            const pageSliceStart = (page - 1) * pageSize;
            const pageSliceEnd = pageSliceStart + pageSize;
            const pagedColTickets = colTickets.slice(pageSliceStart, pageSliceEnd);
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
                {pagedColTickets.map(ticket => (
                  <TicketCard
                    key={String(ticket.id)}
                    ticket={ticket}
                    onMove={() => moveTicket(ticket.id)}
                    onToggleItem={(pid) => toggleItem(ticket.id, pid)}
                    stage={col.id}
                    mounted={mounted}
                  />
                ))}
                {pagedColTickets.length === 0 && (
                  <div className="text-center py-12 text-brand-muted/50 text-sm">No orders here</div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

function TicketCard({ ticket, onMove, onToggleItem, stage, mounted }: { ticket: KitchenTicketView; onMove: () => void; onToggleItem: (pid: string | number) => void; stage: KitchenStage; mounted: boolean }) {
  const allDone = ticket.items.every((i) => i.done || i.isPrepared);
  const displayOrder = typeof ticket.orderId === "string" ? ticket.orderId : `#${ticket.orderId}`;
  const displayTable = ticket.tableNumber || ticket.ticketNumber || "-";
  const ticketTime = ticket.receivedAt || ticket.sentAt || new Date().toISOString();

  return (
    <div className={clsx("card p-4 cursor-pointer hover:border-brand-primary/30 transition-all duration-150", allDone && stage !== "completed" && "border-green-500/30")}>
      {/* Ticket header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-white font-bold text-sm">Table {displayTable}</div>
          <div className="text-brand-muted text-xs font-mono">{String(displayOrder).toUpperCase()}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-brand-muted text-xs" suppressHydrationWarning>
            <Clock size={11} />
            {mounted ? elapsed(ticketTime) : "--"}
          </div>
          {stage !== "completed" && (
            <button onClick={onMove} className="p-1.5 rounded-lg bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary transition-all" title="Move to next stage">
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {ticket.items.map((item, index) => {
          const key = item.productId || item.id || index;
          const itemDone = item.done || item.isPrepared;
          const itemName = item.name || item.productName || "Item";
          const itemQty = item.qty ?? item.quantity ?? 1;

          return (
          <button key={String(key)} onClick={() => onToggleItem(key)} className={clsx("w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all", itemDone ? "bg-green-500/10 border border-green-500/20" : "bg-brand-bg hover:bg-brand-bg/80")}>
            <span className="text-base">{item.emoji || "🍽️"}</span>
            <span className={clsx("text-sm flex-1", itemDone ? "line-through text-brand-muted" : "text-white")}>{itemName}</span>
            <span className={clsx("text-xs font-bold", itemDone ? "text-green-400" : "text-brand-muted")}>×{itemQty}</span>
          </button>
        );})}
      </div>
    </div>
  );
}
