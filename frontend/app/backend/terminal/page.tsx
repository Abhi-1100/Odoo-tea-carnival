"use client";
import { useState, useEffect, useCallback } from "react";
import { Power, Clock, TrendingUp, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

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

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">POS Terminal</h1>
        <p className="text-brand-muted text-sm mt-1">Manage your POS sessions</p>
      </div>

      <div className="card p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center">
            <Power size={22} className="text-brand-primary" />
          </div>
          <div>
            <div className="text-white font-bold text-lg">{activeSession?.terminalName || "No Active Session"}</div>
            <div className="text-brand-muted text-sm">{user?.name || "Cashier"} — {user?.role || "Staff"}</div>
          </div>
          <Badge variant={activeSession?.status === "open" ? "open" : "closed"} className="ml-auto" />
        </div>

        {activeSession && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-brand-bg rounded-xl p-4">
              <div className="text-brand-muted text-xs mb-1 flex items-center gap-1.5">
                <Clock size={12} /> Opened At
              </div>
              <div className="text-white text-sm font-medium">{fmt(activeSession.openedAt)}</div>
            </div>
            <div className="bg-brand-bg rounded-xl p-4">
              <div className="text-brand-muted text-xs mb-1 flex items-center gap-1.5">
                <TrendingUp size={12} /> Opening Cash
              </div>
              <div className="text-white text-sm font-medium">₹{activeSession.openingCash?.toLocaleString() || "0"}</div>
            </div>
          </div>
        )}

        {!activeSession && (
          <div className="bg-brand-bg rounded-xl p-4 mb-6">
            <div className="text-brand-muted text-sm text-center">No active session. Open a new session to start taking orders.</div>
          </div>
        )}

        {activeSession ? (
          <Button
            fullWidth
            size="lg"
            variant="danger"
            icon={<Power size={18} />}
            onClick={() => setCloseModal(true)}
          >
            Close Session
          </Button>
        ) : (
          <Button
            fullWidth
            size="lg"
            variant="success"
            icon={<Power size={18} />}
            onClick={() => setOpenModal(true)}
          >
            Open New Session
          </Button>
        )}
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
