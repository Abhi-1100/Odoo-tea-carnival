"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Power,
  Clock,
  TrendingUp,
  Calendar,
  Loader2,
  MoreVertical,
  LayoutGrid,
  ClipboardList,
  Wallet,
  Users,
  Box,
  Tags,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface SessionUser {
  id: number;
  name: string;
  email: string;
}

interface Session {
  id: number;
  terminalName: string;
  status: "open" | "closed";
  openingCash: number | null;
  closingCash: number | null;
  totalSales: number | null;
  openedAt: string;
  closedAt: string | null;
  createdAt: string;
  notes: string | null;
  user: SessionUser;
}

export default function TerminalPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [closing, setClosing] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [terminalName, setTerminalName] = useState("POS Terminal #1");
  const [openingCash, setOpeningCash] = useState("");
  const [closingCash, setClosingCash] = useState("");
  const [closeNotes, setCloseNotes] = useState("");
  const [showTopMenu, setShowTopMenu] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const fetchSessions = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [allRes, activeRes] = await Promise.all([
        api.sessions.getAll(token),
        api.sessions.getActive(token),
      ]);
      setSessions(allRes.data as Session[]);
      setActiveSession(activeRes.data as Session | null);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleOpenSession = async () => {
    if (!token) return;
    if (!terminalName.trim()) {
      toast.error("Terminal name is required");
      return;
    }

    try {
      setOpening(true);
      const res = await api.sessions.open({ terminalName, openingCash: parseFloat(openingCash) || 0 }, token);
      toast.success("Session opened successfully!");
      setOpenModal(false);
      setOpeningCash("");
      fetchSessions();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to open session");
    } finally {
      setOpening(false);
    }
  };

  const handleCloseSession = async () => {
    if (!token || !activeSession) return;

    try {
      setClosing(true);
      await api.sessions.close(activeSession.id, { closingCash: parseFloat(closingCash) || 0, notes: closeNotes }, token);
      toast.success("Session closed successfully!");
      setCloseModal(false);
      setClosingCash("");
      setCloseNotes("");
      fetchSessions();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to close session");
    } finally {
      setClosing(false);
    }
  };

  const fmt = (dt: string | null) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  };

  const latestClosed = sessions.find((s) => s.status === "closed");

  const navigateTo = (path: string) => {
    setShowTopMenu(false);
    router.push(path);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">POS Terminal</h1>
        <p className="text-brand-muted text-sm mt-1">Manage your POS sessions</p>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="border-b border-brand-border px-4 py-3 flex items-center justify-between relative">
          <button
            onClick={() => setShowTopMenu((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-brand-border bg-brand-bg/50 px-3 py-2 text-sm text-brand-muted hover:text-white hover:border-brand-primary/50 transition-colors"
          >
            <LayoutGrid size={14} />
            Navigation Menu
          </button>

          {showTopMenu && (
            <div className="absolute right-4 top-14 z-20 w-[min(880px,calc(100vw-3rem))] rounded-2xl border border-brand-border/70 bg-gradient-to-br from-[#181f34] via-[#171d31] to-[#121827] p-5 shadow-[0_20px_60px_rgba(3,8,23,.55)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-white text-3xl font-semibold leading-none">Menu</h3>
                  <p className="mt-1 text-xs text-brand-muted">Jump to core POS modules</p>
                </div>
                <button
                  onClick={() => setShowTopMenu(false)}
                  className="rounded-md border border-brand-border px-2.5 py-1 text-xs text-brand-muted hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="rounded-xl border border-brand-border/70 bg-brand-bg/30 p-3">
                  <div className="mb-3 flex items-center gap-2 text-white font-semibold">
                    <ClipboardList size={14} className="text-brand-primary" />
                    Orders
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => navigateTo("/backend/orders")}
                      className="w-full rounded-lg border border-transparent bg-brand-bg px-3 py-2 text-left text-brand-muted hover:text-white hover:border-brand-primary/40"
                    >
                      Orders
                    </button>
                    <button
                      onClick={() => navigateTo("/backend/payments")}
                      className="w-full rounded-lg border border-transparent px-3 py-2 text-left text-brand-muted hover:text-white hover:border-brand-primary/40 hover:bg-brand-bg/60"
                    >
                      Payment
                    </button>
                    <button
                      onClick={() => navigateTo("/pos/customer-display")}
                      className="w-full rounded-lg border border-transparent px-3 py-2 text-left text-brand-muted hover:text-white hover:border-brand-primary/40 hover:bg-brand-bg/60"
                    >
                      Customer
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-brand-border/70 bg-brand-bg/30 p-3">
                  <div className="mb-3 flex items-center gap-2 text-white font-semibold">
                    <Box size={14} className="text-brand-primary" />
                    Products
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => navigateTo("/backend/products")}
                      className="w-full rounded-lg border border-transparent bg-brand-bg px-3 py-2 text-left text-brand-muted hover:text-white hover:border-brand-primary/40"
                    >
                      Products
                    </button>
                    <button
                      onClick={() => navigateTo("/backend/products")}
                      className="w-full rounded-lg border border-transparent px-3 py-2 text-left text-brand-muted hover:text-white hover:border-brand-primary/40 hover:bg-brand-bg/60"
                    >
                      Category
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-brand-border/70 bg-brand-bg/30 p-3">
                  <div className="mb-3 flex items-center gap-2 text-white font-semibold">
                    <BarChart3 size={14} className="text-brand-primary" />
                    Reporting
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => navigateTo("/backend/reports")}
                      className="w-full rounded-lg border border-transparent bg-brand-bg px-3 py-2 text-left text-brand-muted hover:text-white hover:border-brand-primary/40"
                    >
                      Dashboard
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-brand-muted">
                <div className="rounded-lg bg-brand-bg/40 px-3 py-2 inline-flex items-center gap-2">
                  <Wallet size={13} />
                  Billing and payments
                </div>
                <div className="rounded-lg bg-brand-bg/40 px-3 py-2 inline-flex items-center gap-2">
                  <Tags size={13} />
                  Product and category setup
                </div>
                <div className="rounded-lg bg-brand-bg/40 px-3 py-2 inline-flex items-center gap-2">
                  <Users size={13} />
                  Staff and customer visibility
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="border border-brand-border rounded-md p-4 relative">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-white text-3xl font-semibold mb-3">Odoo Cafe</div>
                <div className="flex gap-8 text-brand-muted text-sm">
                  <div>
                    <div>Last open: <span className="text-white">{latestClosed ? new Date(latestClosed.openedAt).toLocaleDateString("en-IN") : "-"}</span></div>
                    <div className="mt-1">Last Sell: <span className="text-white">₹{latestClosed?.totalSales?.toLocaleString() || "0"}</span></div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowQuickMenu((v) => !v)}
                  className="h-9 w-9 rounded border border-brand-border bg-brand-bg flex items-center justify-center text-brand-muted hover:text-white"
                >
                  <MoreVertical size={16} />
                </button>
                {showQuickMenu && (
                  <div className="absolute right-0 top-11 bg-[#1c2131] border border-brand-border rounded-md min-w-[170px] z-20 shadow-lg">
                    <button onClick={() => router.push("/backend/payment-methods")} className="w-full text-left px-3 py-2 text-brand-muted hover:text-white hover:bg-brand-bg">Setting</button>
                    <button onClick={() => router.push("/backend/kitchen-settings")} className="w-full text-left px-3 py-2 text-brand-muted hover:text-white hover:bg-brand-bg">Kitchen Display</button>
                    <button onClick={() => router.push("/pos/customer-display")} className="w-full text-left px-3 py-2 text-brand-muted hover:text-white hover:bg-brand-bg">Customer Display</button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5">
              {activeSession ? (
                <Button size="sm" variant="danger" icon={<Power size={16} />} onClick={() => setCloseModal(true)}>
                  Close Session
                </Button>
              ) : (
                <Button size="sm" icon={<Power size={16} />} onClick={() => setOpenModal(true)}>
                  Open Session
                </Button>
              )}
            </div>
          <div>
            <div className="mt-4 text-xs text-brand-muted">Current terminal: {activeSession?.terminalName || terminalName}</div>
          </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-white font-semibold mb-4">Session History</h2>
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-brand-primary" size={32} />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 text-brand-muted">No sessions found.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-border">
                  {["Terminal", "Opened", "Closed", "Opening", "Total Sales", "Status"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b border-brand-border/50 hover:bg-brand-bg/40 transition-colors">
                    <td className="px-5 py-3 text-white text-sm font-medium">{s.terminalName}</td>
                    <td className="px-5 py-3 text-brand-muted text-sm">{fmt(s.openedAt)}</td>
                    <td className="px-5 py-3 text-brand-muted text-sm">
                      {s.closedAt ? fmt(s.closedAt) : <span className="text-brand-teal">Active</span>}
                    </td>
                    <td className="px-5 py-3 text-brand-muted text-sm">₹{s.openingCash?.toLocaleString() || "0"}</td>
                    <td className="px-5 py-3 text-white text-sm font-semibold">₹{s.totalSales?.toLocaleString() || "—"}</td>
                    <td className="px-5 py-3">
                      <Badge variant={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Open New Session" size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-brand-muted mb-1.5 block">Terminal Name *</label>
            <input
              value={terminalName}
              onChange={(e) => setTerminalName(e.target.value)}
              placeholder="e.g. POS Terminal #1"
              className="input-dark"
            />
          </div>
          <div>
            <label className="text-xs text-brand-muted mb-1.5 block">Opening Cash (₹)</label>
            <input
              type="number"
              value={openingCash}
              onChange={(e) => setOpeningCash(e.target.value)}
              placeholder="0"
              className="input-dark"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setOpenModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleOpenSession} disabled={opening}>
              {opening ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Open Session
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={closeModal} onClose={() => setCloseModal(false)} title="Close Session" size="sm">
        <div className="space-y-4">
          <div className="bg-brand-bg rounded-xl p-4">
            <div className="text-brand-muted text-xs mb-1">Terminal</div>
            <div className="text-white font-medium">{activeSession?.terminalName}</div>
            <div className="mt-2 text-brand-muted text-xs mb-1">Opened At</div>
            <div className="text-white text-sm">{fmt(activeSession?.openedAt || null)}</div>
          </div>
          <div>
            <label className="text-xs text-brand-muted mb-1.5 block">Closing Cash (₹) *</label>
            <input
              type="number"
              value={closingCash}
              onChange={(e) => setClosingCash(e.target.value)}
              placeholder="0"
              className="input-dark"
            />
          </div>
          <div>
            <label className="text-xs text-brand-muted mb-1.5 block">Notes (optional)</label>
            <textarea
              value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)}
              placeholder="Any notes about this session..."
              rows={2}
              className="input-dark resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setCloseModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleCloseSession} disabled={closing}>
              {closing ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Close Session
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
