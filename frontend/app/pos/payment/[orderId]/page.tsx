"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, X, QrCode, Banknote, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { QRCodeSVG } from "qrcode.react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import clsx from "clsx";

type Method = "cash" | "card" | "upi";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function PaymentPage({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuthStore();
  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "cafe@ybl";
  const { items, tableNumber, getSubtotal, getTax, getTotal, clearCart } = useCartStore();
  const queryTable = Number(searchParams.get("tableId") || 0);
  const displayTableNumber = tableNumber || queryTable || 0;
  const total = getTotal();

  const [method, setMethod] = useState<Method>("cash");
  const [tendered, setTendered] = useState(total.toString());
  const [upiModal, setUpiModal] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [paidTotal, setPaidTotal] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [processingCard, setProcessingCard] = useState(false);

  const change = method === "cash" ? Math.max(0, parseInt(tendered || "0") - total) : 0;

  // Auto-dismiss after confirm
  useEffect(() => {
    if (!confirmed) return;
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    const r = setTimeout(() => { clearCart(); router.push("/pos"); }, 3000);
    return () => { clearInterval(t); clearTimeout(r); };
  }, [confirmed]);

  const handleValidate = () => {
    if (method === "upi") { setUpiModal(true); return; }
    if (method === "card") { handleCardPayment(); return; }
    finalisePayment();
  };

  const loadRazorpayScript = async () => {
    if (window.Razorpay) return true;

    return await new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCardPayment = async () => {
    if (!token) {
      toast.error("Please login again");
      router.push("/login");
      return;
    }

    try {
      setProcessingCard(true);

      const scriptReady = await loadRazorpayScript();
      if (!scriptReady || !window.Razorpay) {
        toast.error("Failed to load Razorpay SDK");
        return;
      }

      const createOrderRes = await api.payments.createRazorpayOrder(
        {
          amount: total,
          currency: "INR",
          receipt: String(params.orderId),
        },
        token,
      );

      const { keyId, order } = createOrderRes.data;

      const razorpay = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Odoo Cafe",
        description: `Payment for Table ${displayTableNumber}`,
        order_id: order.id,
        handler: async (response: Record<string, string>) => {
          try {
            await api.payments.verifyRazorpayPayment(
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              token,
            );

            finalisePayment();
          } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Card payment verification failed");
          }
        },
        theme: { color: "#ec4899" },
        modal: {
          ondismiss: () => {
            setProcessingCard(false);
          },
        },
      });

      razorpay.open();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Unable to start card payment");
    } finally {
      setProcessingCard(false);
    }
  };

  const finalisePayment = () => {
    setUpiModal(false);
    setPaidTotal(total);
    toast.success("Payment confirmed! ✅");
    setConfirmed(true);
  };

  const methods = [
    { id: "cash" as Method, label: "Cash", icon: Banknote, color: "green" },
    { id: "card" as Method, label: "Card / Digital", icon: CreditCard, color: "blue" },
    { id: "upi" as Method, label: "UPI QR", icon: QrCode, color: "pink" },
  ];

  if (confirmed) {
    return (
      <div className="h-full flex items-center justify-center bg-brand-bg">
        <div className="text-center px-8">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-500 animate-pulse">
            <Check size={40} className="text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Payment Confirmed!</h2>
          <p className="text-5xl font-bold text-brand-primary mt-4 mb-2">₹{paidTotal}</p>
          <p className="text-brand-muted text-sm mb-2">Receipt #{params.orderId.slice(-6).toUpperCase()}</p>
          <p className="text-brand-muted text-xs">Redirecting in {countdown}s…</p>
          <Button className="mt-6" onClick={() => { clearCart(); router.push("/pos"); }}>Back to Floor</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white">Payment — Table {displayTableNumber}</h1>

        {/* Order Summary */}
        <div className="card p-5">
          <h2 className="text-white font-semibold mb-3">Order Summary</h2>
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-brand-muted">{item.emoji} {item.name} × {item.qty}</span>
                <span className="text-white">₹{item.price * item.qty}</span>
              </div>
            ))}
            {!items.length && <p className="text-brand-muted text-sm">No items in cart</p>}
          </div>
          <div className="border-t border-brand-border mt-3 pt-3 space-y-1">
            <div className="flex justify-between text-brand-muted text-sm"><span>Subtotal</span><span>₹{getSubtotal()}</span></div>
            <div className="flex justify-between text-brand-muted text-sm"><span>Tax</span><span>₹{getTax()}</span></div>
            <div className="flex justify-between text-white font-bold text-lg mt-2"><span>Total</span><span className="text-brand-primary">₹{total}</span></div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="card p-5">
          <h2 className="text-white font-semibold mb-3">Payment Method</h2>
          <div className="grid grid-cols-3 gap-3">
            {methods.map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)} className={clsx("p-4 rounded-xl border text-center transition-all duration-150", method === m.id ? "border-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/20" : "border-brand-border hover:border-brand-border/80 bg-brand-bg")}>
                <m.icon size={22} className={clsx("mx-auto mb-2", method === m.id ? "text-brand-primary" : "text-brand-muted")} />
                <div className={clsx("text-xs font-medium", method === m.id ? "text-white" : "text-brand-muted")}>{m.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Cash fields */}
        {method === "cash" && (
          <div className="card p-5 space-y-3">
            <div>
              <label className="text-xs text-brand-muted mb-1.5 block">Amount Tendered (₹)</label>
              <input type="number" value={tendered} onChange={e => setTendered(e.target.value)} className="input-dark text-xl font-bold" />
            </div>
            {parseInt(tendered || "0") >= total && (
              <div className="flex justify-between text-green-400 font-semibold bg-green-500/10 border border-green-500/20 px-4 py-3 rounded-xl">
                <span>Change</span><span>₹{change}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth size="lg" icon={<X size={18} />} onClick={() => router.back()}>Cancel</Button>
          <Button
            variant="success"
            fullWidth
            size="lg"
            icon={<Check size={18} />}
            onClick={handleValidate}
            disabled={processingCard}
          >
            {processingCard ? "Opening Razorpay..." : "Validate Payment"}
          </Button>
        </div>
      </div>

      {/* UPI Modal */}
      <Modal open={upiModal} onClose={() => setUpiModal(false)} title="UPI QR Payment" size="sm">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-xl">
            <QRCodeSVG value={`upi://pay?pa=${upiId}&pn=Odoo+POS+Cafe&am=${total}`} size={180} />
          </div>
          <div className="text-center">
            <div className="text-brand-muted text-sm">Amount to Pay</div>
            <div className="text-4xl font-bold text-white mt-1">₹{total}</div>
            <div className="text-brand-primary text-xs mt-1">{upiId}</div>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button variant="danger" icon={<X size={16} />} onClick={() => setUpiModal(false)}>Cancel</Button>
            <Button variant="success" icon={<Check size={16} />} onClick={finalisePayment}>Confirmed</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
