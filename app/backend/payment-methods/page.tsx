"use client";
import { useState } from "react";
import { CreditCard, Smartphone, Building2, QrCode, Save, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";

interface PaymentMethod {
  id: string; name: string; icon: React.ElementType; enabled: boolean;
  description: string; upiId?: string; color: string;
}

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    { id: "cash", name: "Cash", icon: Building2, enabled: true, description: "Accept cash payments at the counter.", color: "text-green-400" },
    { id: "card", name: "Digital / Card", icon: CreditCard, enabled: true, description: "Accept debit/credit card and digital wallets.", color: "text-blue-400" },
    { id: "upi", name: "UPI QR", icon: Smartphone, enabled: false, description: "Generate a QR code for UPI payments.", color: "text-brand-primary", upiId: "" },
  ]);
  const [upiInput, setUpiInput] = useState("");
  const [savedUpi, setSavedUpi] = useState("");
  const [qrVisible, setQrVisible] = useState(false);

  const toggle = (id: string) => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
    toast.success(`Payment method ${methods.find(m => m.id === id)?.enabled ? "disabled" : "enabled"}`);
  };

  const saveUpi = () => {
    if (!upiInput.includes("@")) { toast.error("Enter a valid UPI ID (e.g. 123@ybl)"); return; }
    setSavedUpi(upiInput);
    setQrVisible(true);
    setMethods(prev => prev.map(m => m.id === "upi" ? { ...m, enabled: true, upiId: upiInput } : m));
    toast.success("UPI ID saved & QR generated!");
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Payment Methods</h1>
        <p className="text-brand-muted text-sm mt-1">Configure which payment methods are available at your POS terminal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {methods.map(m => (
          <div key={m.id} className={`card p-6 transition-all duration-200 ${m.enabled ? "border-brand-primary/40 shadow-lg shadow-brand-primary/10" : ""}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center`}><m.icon size={20} className={m.color} /></div>
                <div><div className="text-white font-semibold">{m.name}</div><div className="text-brand-muted text-xs mt-0.5">{m.enabled ? "Enabled" : "Disabled"}</div></div>
              </div>
              {/* Toggle */}
              <button onClick={() => toggle(m.id)} className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${m.enabled ? "bg-brand-primary" : "bg-brand-border"}`}>
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${m.enabled ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
            <p className="text-brand-muted text-sm mb-4">{m.description}</p>

            {/* UPI extra fields */}
            {m.id === "upi" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-brand-muted mb-1.5 block">UPI ID</label>
                  <div className="flex gap-2">
                    <input value={upiInput} onChange={e => setUpiInput(e.target.value)} placeholder="123@ybl.com" className="input-dark flex-1 text-sm" />
                    <Button size="sm" onClick={saveUpi} icon={<Save size={14} />}>Save</Button>
                  </div>
                </div>
                {qrVisible && savedUpi && (
                  <div className="bg-white rounded-xl p-4 flex flex-col items-center gap-2">
                    <QRCodeSVG value={`upi://pay?pa=${savedUpi}&pn=Odoo+POS+Cafe`} size={140} />
                    <p className="text-gray-800 text-xs font-medium">{savedUpi}</p>
                    <div className="flex items-center gap-1 text-green-600 text-xs font-semibold"><Check size={12} /> Ready to accept payments</div>
                  </div>
                )}
              </div>
            )}

            {m.id === "cash" && m.enabled && (
              <div className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20">
                <Check size={12} /> Cash payments active
              </div>
            )}
            {m.id === "card" && m.enabled && (
              <div className="flex items-center gap-2 text-blue-400 text-xs bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20">
                <Check size={12} /> Card/Digital payments active
              </div>
            )}
            {!m.enabled && (
              <div className="flex items-center gap-2 text-brand-muted text-xs bg-brand-bg px-3 py-2 rounded-lg border border-brand-border">
                <AlertCircle size={12} /> This method is currently disabled
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
