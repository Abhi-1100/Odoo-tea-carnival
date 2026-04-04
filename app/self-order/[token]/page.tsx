"use client";
import { useState } from "react";
import { ShoppingBag, Plus, Minus, Check, ChevronDown } from "lucide-react";
import { products, CATEGORIES } from "@/data/products";
import { Product } from "@/data/products";
import toast from "react-hot-toast";
import clsx from "clsx";

interface CartItem { product: Product; qty: number; }

export default function SelfOrderPage({ params }: { params: { token: string } }) {
  const [cat, setCat] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ordered, setOrdered] = useState(false);
  const [orderNum, setOrderNum] = useState("");

  const tableNum = params.token?.split("-")[1] || "?";

  const filtered = products.filter(p => p.status === "active" && (cat === "All" || p.category === cat));

  const addToCart = (p: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === p.id);
      return ex ? prev.map(i => i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { product: p, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  const total = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);

  const placeOrder = async () => {
    if (!cart.length) { toast.error("Your cart is empty!"); return; }
    await new Promise(r => setTimeout(r, 1000));
    const num = `#${Math.floor(1000 + Math.random() * 9000)}`;
    setOrderNum(num);
    setOrdered(true);
  };

  if (ordered) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border-4 border-green-500">
          <Check size={36} className="text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Order Placed!</h2>
        <p className="text-5xl font-bold text-brand-primary my-4">{orderNum}</p>
        <p className="text-brand-muted">Show this number to collect your order</p>
        <p className="text-brand-muted text-sm mt-2">Table {tableNum}</p>
        <button onClick={() => { setOrdered(false); setCart([]); }} className="mt-8 text-brand-primary text-sm underline">Order More</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg pb-32">
      {/* Header */}
      <div className="sticky top-0 bg-brand-card/95 backdrop-blur-sm border-b border-brand-border px-4 py-4 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">☕ Odoo POS Cafe</h1>
            <p className="text-brand-muted text-xs">Table {tableNum}</p>
          </div>
          {itemCount > 0 && (
            <div className="flex items-center gap-2 bg-brand-primary/20 border border-brand-primary/30 px-3 py-1.5 rounded-full">
              <ShoppingBag size={14} className="text-brand-primary" />
              <span className="text-white text-xs font-bold">{itemCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-brand-border">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)} className={clsx("px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all", cat === c ? "bg-brand-primary text-white" : "bg-brand-card text-brand-muted border border-brand-border")}>
            {c}
          </button>
        ))}
      </div>

      {/* Products */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {filtered.map(p => {
          const inCart = cart.find(i => i.product.id === p.id);
          return (
            <div key={p.id} className="card p-4 flex flex-col">
              <div className="text-3xl mb-2">{p.emoji}</div>
              <div className="text-white text-sm font-semibold flex-1">{p.name}</div>
              <div className="text-brand-primary font-bold text-sm mt-1 mb-3">₹{p.price}</div>
              {inCart ? (
                <div className="flex items-center justify-between bg-brand-bg rounded-xl px-3 py-2">
                  <button onClick={() => updateQty(p.id, -1)} className="text-brand-muted hover:text-white"><Minus size={14} /></button>
                  <span className="text-white font-bold text-sm">{inCart.qty}</span>
                  <button onClick={() => updateQty(p.id, 1)} className="text-brand-primary"><Plus size={14} /></button>
                </div>
              ) : (
                <button onClick={() => addToCart(p)} className="w-full bg-brand-primary/20 hover:bg-brand-primary text-brand-primary hover:text-white text-xs font-semibold py-2 rounded-xl transition-all border border-brand-primary/30">
                  Add
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-brand-card border-t border-brand-border p-4">
          <button onClick={placeOrder} className="w-full bg-brand-primary hover:bg-pink-600 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-between px-5 shadow-2xl shadow-brand-primary/30">
            <span className="text-sm">{itemCount} items</span>
            <span className="font-bold">Place Order</span>
            <span className="font-bold">₹{total}</span>
          </button>
        </div>
      )}
    </div>
  );
}
