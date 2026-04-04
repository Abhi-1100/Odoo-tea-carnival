"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, Trash2, SendHorizonal, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { useKitchenStore } from "@/store/kitchenStore";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import clsx from "clsx";

interface PosProduct {
  id: number;
  name: string;
  price: number;
  isActive: boolean;
  category: { id: number; name: string } | null;
}

const emojiByCategory: Record<string, string> = {
  Pizza: "🍕",
  Pasta: "🍝",
  Burger: "🍔",
  Coffee: "☕",
  Drinks: "🥤",
  Desserts: "🍨",
};

export default function OrderPage({ params }: { params: { tableId: string } }) {
  const router = useRouter();
  const [cat, setCat] = useState("All");
  const { token } = useAuthStore();
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const { items, tableNumber, setTable, addItem, updateQty, removeItem, getSubtotal, getTax, getTotal } = useCartStore();
  const addTicket = useKitchenStore(s => s.addTicket);
  const [sentToKitchen, setSentToKitchen] = useState(false);

  useEffect(() => {
    const id = Number(params.tableId);
    if (!Number.isNaN(id) && id > 0) {
      setTable(id, id);
    }
  }, [params.tableId, setTable]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!token) {
        setLoadingProducts(false);
        return;
      }

      try {
        setLoadingProducts(true);
        const response = await api.products.getAll(token);
        setProducts((response.data as PosProduct[]) || []);
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [token]);

  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category?.name).filter((name): name is string => Boolean(name)))),
  ];

  const filtered = products.filter((p) => p.isActive && (cat === "All" || p.category?.name === cat));

  const sendToKitchen = () => {
    if (!items.length) { toast.error("Add items first!"); return; }

    try {
      const ticket = {
        id: Date.now(), orderId: Date.now(), ticketNumber: `TK-${Date.now()}`,
        stage: "to_cook" as const, sentAt: new Date().toISOString(),
        order: { id: Date.now(), orderNumber: `ORD-${Date.now()}`, orderType: "dine_in", table: { id: tableNumber, tableNumber: String(tableNumber) } },
        items: items.map((i, index) => ({
          id: Date.now() + index,
          orderItemId: Number(i.productId),
          productName: i.name,
          quantity: i.qty,
          isPrepared: false,
        })),
      };

      addTicket(ticket);
      setSentToKitchen(true);
      toast.success("Order sent to kitchen! 🍳");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to send order to kitchen");
    }

    // Always move the user to kitchen display after pressing Send.
    router.push("/kitchen");
  };

  const goPayment = () => {
    if (!items.length) { toast.error("Cart is empty!"); return; }
    const orderId = `o${Date.now()}`;
    const tableId = tableNumber || Number(params.tableId) || 0;
    router.push(`/pos/payment/${orderId}?tableId=${tableId}`);
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left — Product Catalog */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-brand-border">
        {/* Category Tabs */}
        <div className="flex gap-1 px-4 pt-4 pb-3 border-b border-brand-border overflow-x-auto shrink-0">
          {categories.map(c => (
            <button key={c} onClick={() => setCat(c)} className={clsx("px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all", cat === c ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30" : "bg-brand-card text-brand-muted hover:text-white border border-brand-border")}>
              {c}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loadingProducts ? (
            <div className="h-full flex items-center justify-center text-brand-muted">
              <Loader2 className="animate-spin mr-2" size={18} /> Loading products...
            </div>
          ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map(p => (
              <button key={p.id} onClick={() => addItem({ productId: p.id, name: p.name, price: p.price, emoji: emojiByCategory[p.category?.name || ""] || "🍽️" })}
                className="card p-4 text-left hover:border-brand-primary/40 hover:bg-brand-primary/5 transition-all duration-150 active:scale-95 group">
                <div className="text-3xl mb-2">{emojiByCategory[p.category?.name || ""] || "🍽️"}</div>
                <div className="text-white text-sm font-semibold leading-snug group-hover:text-brand-primary transition-colors">{p.name}</div>
                <div className="text-brand-primary font-bold text-sm mt-1">₹{p.price}</div>
              </button>
            ))}
            {!filtered.length && (
              <div className="col-span-full text-center py-12 text-brand-muted">No active products found</div>
            )}
          </div>
          )}
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
            <Button variant="teal" icon={<SendHorizonal size={15} />} onClick={sendToKitchen} className={sentToKitchen ? "opacity-70" : ""}>{sentToKitchen ? "Resend" : "Send"}</Button>
            <Button variant="primary" icon={<CreditCard size={15} />} onClick={goPayment}>Payment</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
