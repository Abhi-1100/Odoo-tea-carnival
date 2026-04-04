"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, CreditCard, Landmark, Loader2, Plus, QrCode, Save, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

interface PaymentMethod {
  id: number;
  name: string;
  type: "cash" | "digital" | "upi";
  isEnabled: boolean;
  upiId?: string;
}

interface Session {
  id: number;
  terminalName: string;
  status: "open" | "closed";
  openedAt: string;
  totalSales: number | null;
}

const UPI_REGEX = /^[a-zA-Z0-9._-]{2,100}@[a-zA-Z][a-zA-Z0-9.-]{1,80}$/;
const BLOCKED_HANDLES = new Set(["fake", "test", "demo", "example", "temp", "invalid"]);

export default function PaymentMethodsPage() {
  const { token } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [savingUpi, setSavingUpi] = useState(false);
  const [loadingQr, setLoadingQr] = useState(false);

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  const [pointOfSale, setPointOfSale] = useState("Odoo Cafe");
  const [newPosModal, setNewPosModal] = useState(false);
  const [newPosName, setNewPosName] = useState("");
  const [posNames, setPosNames] = useState<string[]>(["Odoo Cafe"]);

  const [upiInput, setUpiInput] = useState("");
  const [qrBase64, setQrBase64] = useState("");
  const [savedUpiId, setSavedUpiId] = useState("");

  const validateUpi = (rawValue: string) => {
    const value = rawValue.trim().toLowerCase();
    if (!value) return "UPI ID is required";
    if (!UPI_REGEX.test(value)) return "Invalid UPI ID format (example: yourname@okhdfcbank)";

    const handle = value.split("@")[1] || "";
    if (BLOCKED_HANDLES.has(handle)) return "UPI handle appears invalid";

    return null;
  };

  const fetchQr = async (upiMethodId: number) => {
    if (!token) return;
    setLoadingQr(true);
    try {
      const qrRes = await api.paymentMethods.getQR(upiMethodId, token);
      setQrBase64(qrRes.qrBase64 || "");
      setSavedUpiId(qrRes.upiId || "");
    } catch {
      setQrBase64("");
    } finally {
      setLoadingQr(false);
    }
  };

  const loadData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const [pmRes, sessionRes] = await Promise.all([
        api.paymentMethods.getAll(token),
        api.sessions.getAll(token),
      ]);

      const serverMethods = (pmRes.data || []) as PaymentMethod[];
      setMethods(serverMethods);

      const allSessions = (sessionRes.data || []) as Session[];
      setSessions(allSessions);

      const uniqueTerminalNames = Array.from(new Set(allSessions.map((s) => s.terminalName).filter(Boolean)));
      setPosNames((prev) => {
        const merged = Array.from(new Set(["Odoo Cafe", ...prev, ...uniqueTerminalNames]));
        return merged;
      });

      const upi = serverMethods.find((m) => m.type === "upi");
      setUpiInput(upi?.upiId || "");
      if (upi?.id && upi?.upiId) {
        await fetchQr(upi.id);
      } else {
        setQrBase64("");
        setSavedUpiId("");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load payment settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const latestClosed = useMemo(
    () => sessions.find((s) => s.status === "closed") || null,
    [sessions],
  );

  const methodByType = (type: PaymentMethod["type"]) => methods.find((m) => m.type === type);

  const toggleMethod = async (type: PaymentMethod["type"]) => {
    if (!token) return;
    const method = methodByType(type);
    if (!method) return;

    const oldValue = method.isEnabled;
    setMethods((prev) => prev.map((m) => (m.id === method.id ? { ...m, isEnabled: !m.isEnabled } : m)));

    try {
      await api.paymentMethods.toggle(method.id, token);
      toast.success(`${method.name} ${oldValue ? "disabled" : "enabled"}`);
    } catch (error) {
      setMethods((prev) => prev.map((m) => (m.id === method.id ? { ...m, isEnabled: oldValue } : m)));
      toast.error(error instanceof Error ? error.message : "Failed to update payment method");
    }
  };

  const saveUpi = async () => {
    if (!token) return;
    const validationError = validateUpi(upiInput);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const upiMethod = methodByType("upi");
    if (!upiMethod) {
      toast.error("UPI method not found");
      return;
    }

    setSavingUpi(true);
    try {
      const normalizedUpi = upiInput.trim().toLowerCase();
      await api.paymentMethods.saveUPI(upiMethod.id, normalizedUpi, token);
      setMethods((prev) =>
        prev.map((m) =>
          m.id === upiMethod.id ? { ...m, upiId: normalizedUpi, isEnabled: true } : m,
        ),
      );
      await fetchQr(upiMethod.id);
      toast.success("UPI ID saved and QR generated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save UPI ID");
    } finally {
      setSavingUpi(false);
    }
  };

  const createNewPos = () => {
    const clean = newPosName.trim();
    if (!clean) {
      toast.error("Name is required");
      return;
    }
    if (posNames.some((p) => p.toLowerCase() === clean.toLowerCase())) {
      toast.error("POS with this name already exists");
      return;
    }

    setPosNames((prev) => [...prev, clean]);
    setPointOfSale(clean);
    setNewPosName("");
    setNewPosModal(false);
    toast.success("New POS config created");
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
      </div>
    );
  }

  const cash = methodByType("cash");
  const digital = methodByType("digital");
  const upi = methodByType("upi");

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-text">POS Settings</h1>
        <p className="text-brand-muted text-sm mt-1">Manage payment methods and terminal-level payment behavior</p>
      </div>

      <div className="card p-0 overflow-hidden border border-brand-border/60">
        <div className="relative overflow-hidden border-b border-brand-border bg-gradient-to-r from-[#2f2b14] via-[#3a3418] to-[#2a2420] px-6 py-5">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,#f97316_0%,transparent_45%),radial-gradient(circle_at_80%_10%,#22d3ee_0%,transparent_35%)]" />
          <div className="relative flex flex-wrap items-center gap-4 text-brand-text">
            <span className="text-base uppercase tracking-wider text-brand-text/80">Point of Sale</span>
            <select
              value={pointOfSale}
              onChange={(e) => setPointOfSale(e.target.value)}
              className="bg-transparent border-b border-white/50 px-2 py-1 text-2xl font-semibold outline-none"
            >
              {posNames.map((name) => (
                <option key={name} value={name} className="bg-[#1d1f2d] text-brand-text">
                  {name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setNewPosModal(true)}
              className="inline-flex items-center gap-1 rounded-md border border-fuchsia-300/40 bg-fuchsia-300/10 px-3 py-1.5 text-fuchsia-200 font-semibold hover:bg-fuchsia-300/20"
            >
              <Plus size={16} /> New
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-brand-border bg-brand-bg/30 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-brand-text">Payment Methods</h2>
          <span className="text-xs text-brand-muted">Changes are applied to this POS config</span>
        </div>

        <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-brand-border bg-brand-bg/40 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/15 text-emerald-300 flex items-center justify-center">
                  <Landmark size={18} />
                </div>
                <div>
                  <div className="text-brand-text font-semibold">Cash</div>
                  <div className="text-xs text-brand-muted">Accept cash payments</div>
                </div>
              </div>
              <input type="checkbox" checked={!!cash?.isEnabled} onChange={() => toggleMethod("cash")} className="w-5 h-5 accent-brand-primary" />
            </div>
          </div>

          <div className="rounded-xl border border-brand-border bg-brand-bg/40 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-sky-500/15 text-brand-primary flex items-center justify-center">
                  <CreditCard size={18} />
                </div>
                <div>
                  <div className="text-brand-text font-semibold">Digital (Bank, Card)</div>
                  <div className="text-xs text-brand-muted">Cards and digital wallets</div>
                </div>
              </div>
              <input type="checkbox" checked={!!digital?.isEnabled} onChange={() => toggleMethod("digital")} className="w-5 h-5 accent-brand-primary" />
            </div>
          </div>

          <div className="rounded-xl border border-brand-border bg-brand-bg/40 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-fuchsia-500/15 text-fuchsia-300 flex items-center justify-center">
                  <QrCode size={18} />
                </div>
                <div>
                  <div className="text-brand-text font-semibold">QR Payment (UPI)</div>
                  <div className="text-xs text-brand-muted">Generate QR at checkout</div>
                </div>
              </div>
              <input type="checkbox" checked={!!upi?.isEnabled} onChange={() => toggleMethod("upi")} className="w-5 h-5 accent-brand-primary" />
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-xl border border-brand-border bg-brand-bg/30 p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm text-brand-text font-medium">UPI ID</label>
              <input
                value={upiInput}
                onChange={(e) => setUpiInput(e.target.value)}
                placeholder="e.g. 123@ybl.com"
                className="input-dark max-w-sm"
              />
              <Button size="sm" onClick={saveUpi} disabled={savingUpi} icon={savingUpi ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}>
                Save
              </Button>
              {upi?.upiId && <span className="text-green-400 text-sm inline-flex items-center gap-1"><Check size={12} />Saved</span>}
            </div>

            <div className="rounded-xl border border-brand-border/70 bg-[#161a29] p-4">
              <div className="text-sm text-brand-text font-semibold mb-3">Generated UPI QR</div>
              {loadingQr ? (
                <div className="flex items-center gap-2 text-brand-muted text-sm">
                  <Loader2 size={14} className="animate-spin" />
                  Generating QR...
                </div>
              ) : qrBase64 ? (
                <div className="flex flex-wrap items-center gap-4">
                  <img src={qrBase64} alt="UPI QR" className="h-32 w-32 rounded-md border border-brand-border bg-white p-1" />
                  <div>
                    <div className="text-xs text-brand-muted">UPI ID</div>
                    <div className="text-sm text-brand-text font-medium">{savedUpiId}</div>
                    <div className="text-xs text-green-400 mt-1">Ready for customer scan</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-brand-muted">Save a valid UPI ID to generate QR.</div>
              )}
            </div>

            <div className="text-sm text-brand-muted space-y-1">
              <div>Cash: if enabled, it is available on this POS location.</div>
              <div>UPI: QR is generated on payment screen based on this UPI ID.</div>
              <div className="text-amber-300/90">Owner authenticity cannot be verified offline; it requires a bank/PSP verification service.</div>
            </div>

            {latestClosed && (
              <div className="text-xs text-brand-muted border-t border-brand-border pt-3">
                Last open: {new Date(latestClosed.openedAt).toLocaleDateString("en-IN")} | Last close sell amount: ₹{latestClosed.totalSales?.toLocaleString() || "0"}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={newPosModal} onClose={() => setNewPosModal(false)} title="Create POS Config" size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-brand-muted mb-1.5 block">Name</label>
            <input
              value={newPosName}
              onChange={(e) => setNewPosName(e.target.value)}
              placeholder="POS Terminal #2"
              className="input-dark"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setNewPosModal(false)} icon={<X size={14} />}>
              Discard
            </Button>
            <Button onClick={createNewPos} icon={<Save size={14} />}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
