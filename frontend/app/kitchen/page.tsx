"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Menu, Search, X } from "lucide-react";
import { io, type Socket } from "socket.io-client";
import clsx from "clsx";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

type Stage = "all" | "to_cook" | "preparing" | "completed";

interface KitchenItem {
  id: number;
  productName: string;
  categoryName?: string | null;
  quantity: number;
  isPrepared: boolean;
  notes?: string;
}

interface KitchenTicket {
  id: number;
  ticketNumber: string;
  orderId: number;
  stage: Exclude<Stage, "all">;
  sentAt: string;
  completedAt?: string | null;
  items: KitchenItem[];
}

interface StageCounts {
  all: number;
  to_cook: number;
  preparing: number;
  completed: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STAGES: Array<{ key: Stage; label: string; badgeClass: string }> = [
  { key: "all", label: "All", badgeClass: "bg-slate-600 text-white" },
  { key: "to_cook", label: "To Cook", badgeClass: "bg-pink-600 text-white" },
  { key: "preparing", label: "Preparing", badgeClass: "bg-amber-500 text-black" },
  { key: "completed", label: "Completed", badgeClass: "bg-emerald-500 text-black" },
];

const PAGE_LIMIT = 8;

export default function KitchenDisplayPage() {
  const router = useRouter();
  const { token, isAuthenticated, hasHydrated } = useAuthStore();

  const [tickets, setTickets] = useState<KitchenTicket[]>([]);
  const [counts, setCounts] = useState<StageCounts>({ all: 0, to_cook: 0, preparing: 0, completed: 0 });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: PAGE_LIMIT, total: 0, totalPages: 1 });
  const [products, setProducts] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<Stage>("all");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const loadFilters = useCallback(async () => {
    if (!token) return;
    const response = await api.kitchen.getFilters(token);
    setProducts(response.data.products || []);
    setCategories(response.data.categories || []);
  }, [token]);

  const loadTickets = useCallback(
    async (page = 1) => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await api.kitchen.getTickets(token, {
          stage: activeStage,
          product: selectedProduct || undefined,
          category: selectedCategory || undefined,
          page,
          limit: PAGE_LIMIT,
        });

        const payload = response.data as { tickets: KitchenTicket[]; stageCounts: StageCounts; pagination: Pagination };
        setTickets(payload.tickets || []);
        setCounts(payload.stageCounts || { all: 0, to_cook: 0, preparing: 0, completed: 0 });
        setPagination(payload.pagination || { page, limit: PAGE_LIMIT, total: 0, totalPages: 1 });
      } finally {
        setLoading(false);
      }
    },
    [token, activeStage, selectedProduct, selectedCategory]
  );

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated || !token) {
      router.push("/login");
      return;
    }

    loadFilters();
    loadTickets(1);
  }, [hasHydrated, isAuthenticated, token, router, loadFilters, loadTickets]);

  useEffect(() => {
    if (!token) return;

    const socket: Socket = io("http://localhost:5000/kitchen", {
      transports: ["websocket"],
      withCredentials: false,
    });

    socket.on("new_kitchen_order", () => {
      loadTickets(1);
      loadFilters();
    });

    socket.on("ticket_stage_updated", (payload: { stageCounts?: StageCounts }) => {
      if (payload?.stageCounts) setCounts(payload.stageCounts);
      loadTickets(pagination.page);
      loadFilters();
    });

    socket.on("item_prepared", () => {
      loadTickets(pagination.page);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, loadTickets, loadFilters, pagination.page]);

  useEffect(() => {
    if (!token) return;
    loadTickets(1);
  }, [activeStage, selectedProduct, selectedCategory, token, loadTickets]);

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tickets;

    return tickets.filter((ticket) => {
      const orderMatch = ticket.ticketNumber.toLowerCase().includes(query) || `#${ticket.orderId}`.toLowerCase().includes(query);
      const productMatch = ticket.items.some((item) => item.productName.toLowerCase().includes(query));
      return orderMatch || productMatch;
    });
  }, [tickets, search]);

  const handleMoveCard = async (ticket: KitchenTicket) => {
    if (!token) return;
    const nextStage = ticket.stage === "to_cook" ? "preparing" : ticket.stage === "preparing" ? "completed" : "completed";
    await api.kitchen.updateStage(ticket.id, nextStage, token);
    await loadTickets(pagination.page);
  };

  const handleToggleItem = async (ticket: KitchenTicket, item: KitchenItem) => {
    if (!token) return;
    await api.kitchen.markItemPrepared(ticket.id, item.id, !item.isPrepared, token);
    await loadTickets(pagination.page);
  };

  const clearFilters = () => {
    setSelectedProduct("");
    setSelectedCategory("");
    setSearch("");
  };

  const startRange = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endRange = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white flex">
      <aside className="w-[260px] border-r border-slate-700 bg-[#1f2433] p-3">
        <div className="mb-4 space-y-1 text-sm">
          <button className="w-full text-left rounded px-2 py-1 text-slate-300 hover:bg-slate-800">Setting</button>
          <button className="w-full text-left rounded px-2 py-1 bg-slate-700 text-white font-semibold">Kitchen Display</button>
          <button onClick={() => router.push("/pos/customer-display")} className="w-full text-left rounded px-2 py-1 text-slate-300 hover:bg-slate-800">Customer Display</button>
        </div>

        <button onClick={clearFilters} className="mb-3 w-full flex items-center justify-between rounded bg-slate-800 px-2 py-1.5 text-sm text-cyan-300">
          <span>Clear Filter</span>
          <X size={14} />
        </button>

        <div className="mb-3">
          <div className="bg-slate-600 px-2 py-1 text-sm font-semibold">Product</div>
          <div className="space-y-1 bg-[#141824] px-2 py-2">
            {products.map((name) => (
              <button
                key={name}
                onClick={() => setSelectedProduct((prev) => (prev === name ? "" : name))}
                className={clsx(
                  "w-full text-left px-1 py-0.5 rounded text-sm",
                  selectedProduct === name ? "bg-sky-900 text-sky-200 font-semibold" : "text-slate-200 hover:bg-slate-800"
                )}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="bg-slate-600 px-2 py-1 text-sm font-semibold">Category</div>
          <div className="space-y-1 bg-[#141824] px-2 py-2">
            {categories.map((name) => (
              <button
                key={name}
                onClick={() => setSelectedCategory((prev) => (prev === name ? "" : name))}
                className={clsx(
                  "w-full text-left px-1 py-0.5 rounded text-sm",
                  selectedCategory === name ? "bg-sky-900 text-sky-200 font-semibold" : "text-slate-200 hover:bg-slate-800"
                )}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4">
        <h1 className="text-2xl font-semibold mb-3">Kitchen Display</h1>

        <div className="rounded border border-slate-700 bg-[#111522] px-3 py-2 mb-4 flex items-center gap-3">
          <Menu size={18} className="text-slate-300" />

          {STAGES.map((stage) => {
            const value = counts[stage.key as keyof StageCounts] || 0;
            return (
              <button
                key={stage.key}
                onClick={() => setActiveStage(stage.key)}
                className={clsx(
                  "inline-flex items-center gap-2 rounded px-3 py-1.5 text-sm",
                  activeStage === stage.key ? "bg-slate-700" : "hover:bg-slate-800"
                )}
              >
                <span>{stage.label}</span>
                <span className={clsx("rounded px-2 py-0.5 text-xs font-semibold", stage.badgeClass)}>{value}</span>
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-3">
            <div className="relative w-[260px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded border border-slate-600 bg-[#0f1320] pl-9 pr-3 text-sm text-white placeholder:text-slate-500"
                placeholder="Search......"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span>{startRange}-{endRange}</span>
              <button
                onClick={() => loadTickets(Math.max(1, pagination.page - 1))}
                disabled={pagination.page <= 1}
                className="disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => loadTickets(Math.min(pagination.totalPages, pagination.page + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-slate-400 p-8">Loading tickets...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => handleMoveCard(ticket)}
                className={clsx(
                  "rounded border border-slate-700 bg-[#232934] p-4 cursor-pointer",
                  ticket.stage === "completed" && "opacity-70"
                )}
              >
                <div className="text-4xl font-bold mb-3">{ticket.ticketNumber}</div>
                <div className="space-y-1">
                  {ticket.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleToggleItem(ticket, item);
                      }}
                      className={clsx(
                        "block w-full text-left text-lg",
                        item.isPrepared ? "line-through text-slate-500" : "text-slate-100"
                      )}
                    >
                      {item.quantity} X {item.productName}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
