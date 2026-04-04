"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Search, SendHorizonal, Trash2, CreditCard } from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

interface POSProduct {
  id: number;
  name: string;
  price: number;
  isActive: boolean;
  category?: { id: number; name: string } | null;
}

export default function OrderPage({ params }: { params: { tableId: string } }) {
  const router = useRouter();
  const tableId = Number(params.tableId);
  const { token, isAuthenticated, hasHydrated } = useAuthStore();
  const { items, tableNumber, setTable, setSession, addItem, removeItem, getSubtotal, getTax, getTotal, createOrder } = useCartStore();

  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sentToKitchen, setSentToKitchen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<POSProduct[]>([]);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated || !token) {
      router.push("/login");
      return;
    }

    const init = async () => {
      try {
        setLoading(true);
        const [sessionRes, tableRes, productsRes] = await Promise.all([
          api.sessions.getActive(token),
          api.tables.getById(tableId, token),
          api.products.getAll(token),
        ]);

        const session = sessionRes.data as { id: number } | null;
        if (session) {
          setSession(session.id);
        }

        const table = tableRes.data as { id: number; tableNumber: string };
        setTable(table.id, Number(table.tableNumber) || table.id);

        setProducts((productsRes.data as POSProduct[]).filter((product) => product.isActive));
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "Failed to open table");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [hasHydrated, isAuthenticated, token, router, tableId, setSession, setTable]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const categoryMatches = (product: POSProduct) =>
      category === "All" || (product.category?.name || "Uncategorized") === category;

    return products.filter((product) => {
      const matchesQuery = !query || product.name.toLowerCase().includes(query);
      return categoryMatches(product) && matchesQuery;
    });
  }, [category, search]);

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(new Set(products.map((product) => product.category?.name || "Uncategorized"))),
    ];
  }, [products]);

  const totalQty = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items]);

  const currentTableLabel = tableNumber > 0 ? `Table ${tableNumber}` : `Table ${params.tableId}`;

  const sendToKitchen = () => {
    if (!items.length || !token) {
      toast.error("Add items first!");
      return;
    }

    (async () => {
      try {
        const order = await createOrder(token);
        await api.orders.sendToKitchen(order.id, token);
        setSentToKitchen(true);
        toast.success("Order sent to kitchen display!");
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "Failed to send to kitchen");
      }
    })();
  };

  const goPayment = () => {
    if (!items.length) {
      toast.error("Cart is empty!");
      return;
    }

    router.push(`/pos/payment/${Date.now()}`);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-brand-muted">Loading table...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden flex flex-col bg-brand-bg">
      <div className="px-6 pt-4 pb-2 text-sm text-brand-muted">
        {currentTableLabel}
      </div>

      <div className="flex items-center justify-between px-6 pb-3 border-b border-brand-border">
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/pos")}
            className="px-3 py-1.5 rounded-lg border border-brand-border bg-brand-card text-white text-sm font-semibold"
          >
            Table
          </button>
          <button
            className="px-3 py-1.5 rounded-lg border border-brand-border bg-brand-card text-brand-muted text-sm font-semibold"
          >
            Register
          </button>
          <button
            onClick={() => router.push("/pos/orders")}
            className="px-3 py-1.5 rounded-lg border border-brand-border bg-brand-card text-white text-sm font-semibold"
          >
            Orders
          </button>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="h-8 w-8 rounded-md border border-brand-border bg-brand-card text-brand-muted flex items-center justify-center"
          title="Reload data"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden border-r border-brand-border">
          <div className="px-6 pt-4 pb-2 flex items-center gap-2 overflow-x-auto">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={clsx(
                  "px-4 py-2 rounded-md text-sm font-semibold whitespace-nowrap border transition-all",
                  category === item
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-brand-card text-brand-muted border-brand-border hover:text-white"
                )}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="px-6 pb-3 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product......"
                className="input-dark pl-10"
              />
            </div>
            <div className="text-xs text-brand-muted hidden lg:block">
              {filteredProducts.length} products
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addItem({ productId: product.id, name: product.name, price: product.price })}
                  className="group h-36 rounded-xl border border-brand-border bg-brand-card hover:border-brand-primary/50 transition-all text-left flex flex-col justify-between overflow-hidden"
                >
                  <div className="flex-1 bg-brand-bg/80" />
                  <div className="px-3 py-2 border-t border-brand-border flex items-center justify-between">
                    <span className="text-sm text-white font-medium truncate">{product.name}</span>
                    <span className="text-sm text-brand-primary font-semibold shrink-0 ml-2">₹{product.price}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="w-[360px] xl:w-[390px] shrink-0 bg-brand-card flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border">
            <div className="text-white font-semibold text-lg">Payment</div>
            <div className="mt-3 text-brand-primary text-3xl font-bold">₹{getTotal().toLocaleString()}</div>
          </div>

          <div className="px-5 py-4 border-b border-brand-border space-y-2">
            <div className="flex justify-between text-sm text-brand-muted">
              <span>Order</span>
              <span>{currentTableLabel}</span>
            </div>
            <div className="flex justify-between text-sm text-brand-muted">
              <span>Subtotal</span>
              <span className="text-white">₹{getSubtotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-brand-muted">
              <span>Tax</span>
              <span className="text-white">₹{getTax().toLocaleString()}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
            {items.length === 0 ? (
              <div className="text-brand-muted text-sm text-center py-10">Cart is empty</div>
            ) : (
              items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between rounded-lg border border-brand-border bg-brand-bg px-3 py-2">
                  <div className="min-w-0">
                    <div className="text-white text-sm truncate">{item.qty} x {item.name}</div>
                    <div className="text-brand-muted text-xs">₹{(item.price * item.qty).toLocaleString()}</div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="ml-3 h-7 w-7 rounded-md border border-brand-border flex items-center justify-center text-brand-muted hover:text-red-300"
                    title="Remove"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="px-5 pb-5 pt-3 border-t border-brand-border space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                icon={<SendHorizonal size={15} />}
                onClick={sendToKitchen}
                className={sentToKitchen ? "opacity-75" : ""}
                fullWidth
              >
                {sentToKitchen ? `Send Again Qty: ${totalQty}` : `Send Qty: ${totalQty}`}
              </Button>
              <Button variant="primary" icon={<CreditCard size={15} />} onClick={goPayment} fullWidth>
                Payment
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
