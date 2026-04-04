"use client";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function CustomerDisplay() {
  const { items, tableNumber, getSubtotal, getTax, getTotal } = useCartStore();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(t);
  }, []);

  const total = getTotal();
  const isPaid = false; // simulate

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-8 text-center">
      {/* Header */}
      <div className="mb-10">
        <div className="text-5xl mb-4">☕</div>
        <h1 className="text-4xl font-bold text-white">Odoo POS Cafe</h1>
        {tableNumber > 0 && <p className="text-brand-muted text-xl mt-2">Table {tableNumber}</p>}
      </div>

      {items.length > 0 ? (
        <>
          {/* Order Items */}
          <div className="w-full max-w-md bg-brand-card border border-brand-border rounded-2xl p-6 mb-8">
            <h2 className="text-brand-muted text-sm font-semibold uppercase tracking-wider mb-4">Your Order</h2>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.productId} className="flex justify-between items-center">
                  <span className="text-white text-lg">{item.emoji} {item.name} × {item.qty}</span>
                  <span className="text-brand-primary font-bold text-lg">₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-brand-border mt-4 pt-4">
              <div className="flex justify-between text-brand-muted text-base mb-1"><span>Tax</span><span>₹{getTax()}</span></div>
              <div className="flex justify-between text-white font-bold text-3xl mt-2"><span>Total</span><span className="text-brand-primary">₹{total}</span></div>
            </div>
          </div>

          {/* Payment Status */}
          <div className={`px-8 py-4 rounded-2xl border text-2xl font-bold transition-all ${isPaid ? "bg-green-500/20 border-green-500/40 text-green-400" : "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"}`}>
            {isPaid ? <><Check className="inline mr-2" />Paid ✓</> : <span className={pulse ? "opacity-100" : "opacity-70"}>⏳ Pending Payment</span>}
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="text-8xl mb-6">👋</div>
          <h2 className="text-3xl font-bold text-white mb-3">Welcome!</h2>
          <p className="text-brand-muted text-xl">Your order will appear here.</p>
          <p className="text-brand-muted text-base mt-3">Thank you for dining with us!</p>
        </div>
      )}
    </div>
  );
}
