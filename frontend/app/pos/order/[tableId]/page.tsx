"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, Trash2, SendHorizonal, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { products, CATEGORIES } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import { useKitchenStore } from "@/store/kitchenStore";
import { KitchenTicket } from "@/data/kitchen";
import toast from "react-hot-toast";
import clsx from "clsx";

export default function OrderPage({ params }: { params: { tableId: string } }) {
  const router = useRouter();
  const [cat, setCat] = useState("All");
  const { items, tableNumber, addItem, updateQty, removeItem, getSubtotal, getTax, getTotal } = useCartStore();
  const addTicket = useKitchenStore(s => s.addTicket);
  const [sentToKitchen, setSentToKitchen] = useState(false);

  const filtered = products.filter(p => p.status === "active" && (cat === "All" || p.category === cat));

  const sendToKitchen = () => {
    if (!items.length) { toast.error("Add items first!"); return; }
    const ticket: KitchenTicket = {
      id: `kt${Date.now()}`, orderId: `o${Date.now()}`, tableNumber,
      stage: "to-cook", receivedAt: new Date().toISOString(),
      items: items.map(i => ({ productId: i.productId, name: i.name, qty: i.qty, emoji: i.emoji, done: false })),
    };
    addTicket(ticket);
    setSentToKitchen(true);
    toast.success("Order sent to kitchen! 🍳");
  };

  const goPayment = () => {
    if (!items.length) { toast.error("Cart is empty!"); return; }
    const orderId = `o${Date.now()}`;
    router.push(`/pos/payment/${orderId}`);
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left — Product Catalog */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-brand-border">
        {/* Category Tabs */}
        <div className="flex gap-1 px-4 pt-4 pb-3 border-b border-brand-border overflow-x-auto shrink-0">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} className={clsx("px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all", cat === c ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30" : "bg-brand-card text-brand-muted hover:text-white border border-brand-border")}>
              {c}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map(p => (
              <button key={p.id} onClick={() => addItem({ productId: p.id, name: p.name, price: p.price, emoji: p.emoji })}
                className="card p-4 text-left hover:border-brand-primary/40 hover:bg-brand-primary/5 transition-all duration-150 active:scale-95 group">
                <div className="text-3xl mb-2">{p.emoji}</div>
                <div className="text-white text-sm font-semibold leading-snug group-hover:text-brand-primary transition-colors">{p.name}</div>
                <div className="text-brand-primary font-bold text-sm mt-1">₹{p.price}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Cart */}
      <div className="w-80 xl:w-96 flex flex-col bg-brand-card overflow-hidden shrink-0">
        <div className="px-5 py-4 border-b border-brand-border">
          <div className="text-white font-bold">Table {tableNumber}</div>
          <div className="text-brand-muted text-xs mt-0.5">{items.length} item{items.length !== 1 ? "s" : ""} in cart</div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {items.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🛒</div>
              <div className="text-brand-muted text-sm">Tap a product to add it</div>
            </div>
          )}
          {items.map(item => (
            <div key={item.productId} className="flex items-center gap-3 p-3 bg-brand-bg rounded-xl">
              <span className="text-lg">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-medium truncate">{item.name}</div>
                <div className="text-brand-primary text-xs font-semibold">₹{item.price * item.qty}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => updateQty(item.productId, item.qty - 1)} className="w-6 h-6 rounded-lg bg-brand-border hover:bg-brand-primary/20 hover:text-brand-primary text-brand-muted flex items-center justify-center transition-all"><Minus size={12} /></button>
                <span className="text-white text-xs w-4 text-center font-bold">{item.qty}</span>
                <button onClick={() => updateQty(item.productId, item.qty + 1)} className="w-6 h-6 rounded-lg bg-brand-border hover:bg-brand-primary/20 hover:text-brand-primary text-brand-muted flex items-center justify-center transition-all"><Plus size={12} /></button>
                <button onClick={() => removeItem(item.productId)} className="w-6 h-6 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-brand-muted flex items-center justify-center transition-all ml-1"><Trash2 size={11} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="p-5 border-t border-brand-border space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between text-brand-muted text-sm"><span>Subtotal</span><span className="text-white">₹{getSubtotal()}</span></div>
            <div className="flex justify-between text-brand-muted text-sm"><span>Tax (5%)</span><span className="text-white">₹{getTax()}</span></div>
            <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-brand-border"><span>Total</span><span className="text-brand-primary">₹{getTotal()}</span></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="teal" icon={<SendHorizonal size={15} />} onClick={sendToKitchen} className={sentToKitchen ? "opacity-70" : ""}>{sentToKitchen ? "Resend" : "Kitchen"}</Button>
            <Button variant="primary" icon={<CreditCard size={15} />} onClick={goPayment}>Payment</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
