"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Minus, Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";
import { api } from "@/lib/api";

interface CartItem {
  product: MobileProduct;
  variantId: number | null;
  addonIds: number[];
  qty: number;
  notes?: string;
}

type ScreenStep = "splash" | "menu" | "detail" | "payment" | "confirmed" | "history";

const HISTORY_STATUSES = ["To-Cook", "Preparing", "Completed", "Completed"] as const;

interface PageSettings {
  restaurantName: string;
  logo: string | null;
  backgroundImages: string[];
  backgroundColor: string;
  tableId: number;
  tableName: string;
  mode: "online_ordering" | "qr_menu";
}

interface CategoryItem {
  id: number;
  name: string;
  color: string;
}

interface MobileProduct {
  id: number;
  name: string;
  price: number;
  categoryId: number | null;
  image: string | null;
  emoji?: string;
  variants: { id: number; attribute: string; value: string; extraPrice: number }[];
  addons: { id: number; name: string; price: number }[];
}

export default function SelfOrderPage({ params }: { params: { token: string } }) {
  const [screen, setScreen] = useState<ScreenStep>("splash");
  const [cat, setCat] = useState<number | "all">("all");
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<MobileProduct[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<MobileProduct | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<number[]>([]);
  const [orderNum, setOrderNum] = useState("");
  const [tableLabel, setTableLabel] = useState("Table");
  const [pageSettings, setPageSettings] = useState<PageSettings | null>(null);
  const [mode, setMode] = useState<"online_ordering" | "qr_menu">("online_ordering");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const [historyOrders, setHistoryOrders] = useState<Array<{ orderId: number; orderNumber: string; kitchenStage: string }>>([]);
  const [splashIndex, setSplashIndex] = useState(0);

  const isViewOnly = mode === "qr_menu";

  useEffect(() => {
    let mounted = true;

    const loadContext = async () => {
      try {
        const [settingsRes, productsRes] = await Promise.all([
          api.selfOrder.getPageSettings(params.token),
          api.selfOrder.getProductsForPage(params.token),
        ]);
        if (!mounted) return;

        setPageSettings(settingsRes.data);
        setTableLabel(settingsRes.data.tableName || "Table");
        setMode(settingsRes.data.mode);
        setCategories(productsRes.categories);
        setProducts(productsRes.products);
        setCat(productsRes.categories[0]?.id || "all");
        
        // If QR menu mode, skip splash and go straight to menu
        if (settingsRes.data.mode === "qr_menu") {
          setScreen("menu");
        }
      } catch {
        if (!mounted) return;
        toast.error("Invalid or expired self-order token");
      }
    };

    loadContext();

    return () => {
      mounted = false;
    };
  }, [params.token]);

  useEffect(() => {
    if (isViewOnly) return; // Skip splash auto-advance in QR menu mode
    const timer = setTimeout(() => setScreen("menu"), 1700);
    return () => clearTimeout(timer);
  }, [isViewOnly]);

  useEffect(() => {
    if (!pageSettings?.backgroundImages?.length) return;
    const timer = setInterval(() => {
      setSplashIndex((prev) => (prev + 1) % pageSettings.backgroundImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [pageSettings?.backgroundImages]);

  useEffect(() => {
    if (screen !== "history") return;

    let active = true;
    const run = async () => {
      try {
        const historyRes = await api.selfOrder.getOrderHistory(params.token);
        if (!active) return;

        let mapped = historyRes.orders.map((o) => ({
          orderId: o.orderId,
          orderNumber: o.orderNumber,
          kitchenStage: o.kitchenStage,
        }));

        if (currentOrderId) {
          const trackRes = await api.selfOrder.trackOrder(currentOrderId);
          if (!active) return;
          mapped = mapped.map((item) =>
            item.orderId === currentOrderId ? { ...item, kitchenStage: trackRes.kitchenStage } : item,
          );
        }

        setHistoryOrders(mapped.slice(0, 8));
      } catch {
        // Quiet polling failure.
      }
    };

    run();
    const interval = setInterval(run, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [screen, params.token, currentOrderId]);

  const filtered = products.filter(
    (p) =>
      (cat === "all" || p.categoryId === cat) &&
      p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const addToCart = (p: MobileProduct, variantId: number | null = null, addonIds: number[] = []) => {
    if (isViewOnly) {
      toast("QR Menu mode: view-only menu");
      return;
    }

    setCart((prev) => {
      const ex = prev.find(
        (i) =>
          i.product.id === p.id &&
          i.variantId === variantId &&
          JSON.stringify(i.addonIds.sort()) === JSON.stringify(addonIds.slice().sort()),
      );
      return ex
        ? prev.map((i) => (i === ex ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { product: p, variantId, addonIds, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    if (isViewOnly) return;

    setCart((prev) =>
      prev
        .map((i) => (i.product.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0),
    );
  };

  const total = useMemo(
    () =>
      cart.reduce((s, i) => {
        const variant = i.product.variants.find((v) => v.id === i.variantId);
        const addonsTotal = i.addonIds.reduce(
          (acc, addonId) => acc + (i.product.addons.find((a) => a.id === addonId)?.price || 0),
          0,
        );
        return s + (i.product.price + (variant?.extraPrice || 0) + addonsTotal) * i.qty;
      }, 0),
    [cart],
  );
  const itemCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);

  const goNextFromMenu = () => {
    if (isViewOnly) {
      toast("QR Menu mode: view-only menu");
      return;
    }

    if (!cart.length) {
      toast.error("Please add at least one item");
      return;
    }

    setScreen("payment");
  };

  const placeOrder = async () => {
    if (isViewOnly) {
      toast.error("Ordering is disabled in QR Menu mode");
      return;
    }
    if (!cart.length) {
      toast.error("Your cart is empty!");
      return;
    }
    try {
      const res = await api.selfOrder.placeOrderByToken(params.token, {
        customerName: 'AK',
        totalAmount: total,
        items: cart.map((item) => {
          const variant = item.product.variants.find((v) => v.id === item.variantId);
          const addonsTotal = item.addonIds.reduce(
            (acc, addonId) => acc + (item.product.addons.find((a) => a.id === addonId)?.price || 0),
            0,
          );

          return {
            productId: item.product.id,
            variantId: item.variantId,
            addons: item.addonIds,
            quantity: item.qty,
            unitPrice: item.product.price + (variant?.extraPrice || 0) + addonsTotal,
            notes: '',
          };
        }),
      });

      setOrderNum(res.orderNumber);
      setCurrentOrderId(res.orderId);
      setScreen("confirmed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to place order');
    }
  };

  const activeBackground = pageSettings?.backgroundImages?.[splashIndex] || null;

  const splashBackgroundStyle = activeBackground
    ? {
        backgroundImage: `linear-gradient(rgba(11,14,20,0.72), rgba(11,14,20,0.84)), url(${activeBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: 'background-image 0.8s ease',
      }
    : {
        backgroundColor: pageSettings?.backgroundColor || '#0b0e14',
      };

  const pageBackgroundStyle = {
    backgroundColor: pageSettings?.backgroundColor || '#0b0e14',
  };

  const backgroundStyle = screen === "splash" ? splashBackgroundStyle : pageBackgroundStyle;

  // QR Menu View - Digital menu card (view-only)
  if (isViewOnly && screen === "menu") {
    const filtered = products.filter(
      (p) =>
        (cat === "all" || p.categoryId === cat) &&
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={pageBackgroundStyle}>
        <div className="w-[360px] max-w-full h-[660px] border border-brand-border bg-brand-card flex flex-col rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#95416a] to-[#c9b1c6] p-6 text-center">
            <h1 className="text-3xl font-bold text-white">{pageSettings?.restaurantName || "Menu"}</h1>
            <p className="text-white/80 text-sm mt-1">Digital Menu Card</p>
          </div>

          {/* Search & Categories */}
          <div className="px-4 pt-4 pb-2 space-y-3 border-b border-brand-border/30">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-brand-muted" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search items..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-brand-bg border border-brand-border rounded-lg text-white placeholder-brand-muted"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setCat("all")}
                className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all ${
                  cat === "all"
                    ? "bg-[#95416a] text-white"
                    : "bg-brand-bg text-brand-muted border border-brand-border"
                }`}
              >
                All Items
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all ${
                    cat === c.id ? "text-white" : "bg-brand-bg text-brand-muted border border-brand-border"
                  }`}
                  style={cat === c.id ? { backgroundColor: c.color, borderColor: c.color } : undefined}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {filtered.length > 0 ? (
              filtered.map((p) => (
                <div key={p.id} className="border-b border-brand-border/30 pb-3 last:border-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{p.emoji || "🍽️"}</span>
                        <div>
                          <h3 className="text-white font-semibold text-sm leading-tight">{p.name}</h3>
                          {p.variants.length > 0 && (
                            <p className="text-brand-muted text-xs mt-0.5">
                              {p.variants.map((v) => v.value).join(" • ")}
                            </p>
                          )}
                        </div>
                      </div>
                      {p.description && (
                        <p className="text-brand-muted text-xs mt-1 ml-8">{p.description}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[#c9b1c6] font-bold text-sm">₹{p.price}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-brand-muted text-sm">
                No items found
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-brand-border/30 p-4 bg-brand-bg/50 text-center">
            <p className="text-brand-muted text-xs">
              Showing {filtered.length} of {products.length} items
            </p>
            <p className="text-brand-muted text-xs mt-1">View only - No ordering available</p>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "splash") {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6" style={backgroundStyle}>
        <div className="w-[320px] max-w-full h-[640px] rounded-2xl border border-brand-border bg-black/65 backdrop-blur-sm flex flex-col items-center justify-between p-5">
          <div className="text-white/90 text-sm border border-white/40 rounded-md px-5 py-1">{pageSettings?.logo ? 'Logo' : 'Logo'}</div>
          <button
            onClick={() => setScreen("menu")}
            disabled={isViewOnly}
            className={`w-full py-3 rounded-lg font-semibold ${isViewOnly ? "bg-gray-500 text-gray-300 cursor-not-allowed" : "bg-[#c9b1c6] text-black"}`}
          >
            {isViewOnly ? "Menu Only" : "Order Here"}
          </button>
        </div>
      </div>
    );
  }

  if (screen === "detail" && selectedProduct) {
    if (isViewOnly) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={pageBackgroundStyle}>
          <div className="w-[360px] max-w-full h-[660px] border border-brand-border bg-brand-card flex flex-col rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-brand-border/30 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Item Details</h2>
              <button onClick={() => setScreen("menu")} className="text-brand-muted hover:text-white">
                <ArrowLeft size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
              <div className="text-6xl text-center">{selectedProduct.emoji || "🍽️"}</div>
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedProduct.name}</h3>
                <p className="text-3xl font-bold text-[#c9b1c6] mt-2">₹{selectedProduct.price}</p>
              </div>

              {selectedProduct.variants.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Available Sizes:</h4>
                  <div className="space-y-1">
                    {selectedProduct.variants.map((v) => (
                      <p key={v.id} className="text-brand-muted text-sm">
                        • {v.value}
                        {v.extraPrice > 0 && <span> +₹{v.extraPrice}</span>}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {selectedProduct.addons.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Add-ons Available:</h4>
                  <div className="space-y-1">
                    {selectedProduct.addons.map((a) => (
                      <p key={a.id} className="text-brand-muted text-sm">
                        • {a.name} +₹{a.price}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-brand-border/30 p-4">
              <button
                onClick={() => setScreen("menu")}
                className="w-full py-3 bg-[#95416a] text-white rounded-lg font-semibold"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      );
    }

    const inCart = cart.find((i) => i.product.id === selectedProduct.id);

    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4" style={backgroundStyle}>
        <div className="w-[360px] max-w-full h-[660px] border border-brand-border bg-brand-card flex flex-col">
          <div className="p-3">
            <button className="px-3 py-1 text-xs bg-brand-bg rounded" onClick={() => setScreen("menu")}>Back</button>
          </div>

          <div className="px-4 pt-2 flex-1">
            <div className="h-56 bg-[#9f8ca2] border border-brand-border flex items-end justify-between p-4">
              <span className="text-white text-xl">{selectedProduct.emoji || "🍽️"}</span>
              <div className="text-white text-xl font-semibold">₹{selectedProduct.price}</div>
            </div>
            <div className="mt-3 text-white font-semibold">{selectedProduct.name}</div>
            <div className="mt-2 text-sm text-brand-muted space-y-1">
              {selectedProduct.variants.map((variant) => (
                <label key={variant.id} className="mr-4 block">
                  <input
                    type="radio"
                    name="type"
                    checked={selectedVariantId === variant.id}
                    onChange={() => setSelectedVariantId(variant.id)}
                  />{' '}
                  {variant.value}
                </label>
              ))}
            </div>
            <div className="mt-2 text-sm text-brand-primary">
              {selectedProduct.variants.find((v) => v.id === selectedVariantId)?.extraPrice
                ? `Extra ₹${selectedProduct.variants.find((v) => v.id === selectedVariantId)?.extraPrice}`
                : 'Extra ₹0'}
            </div>
            <div className="mt-3 text-sm text-brand-muted space-y-1">
              {selectedProduct.addons.map((addon) => (
                <label key={addon.id} className="block">
                  <input
                    type="checkbox"
                    checked={selectedAddonIds.includes(addon.id)}
                    onChange={(e) =>
                      setSelectedAddonIds((prev) =>
                        e.target.checked ? [...prev, addon.id] : prev.filter((id) => id !== addon.id),
                      )
                    }
                  />{' '}
                  {addon.name}
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-brand-border p-3 bg-[#c8adc7] text-black flex items-center justify-between">
            <div className="text-xs">{itemCount || 0} QTY<br />Total: ₹{total || selectedProduct.price}</div>
            <button
              onClick={() => {
                if (isViewOnly) {
                  toast("QR Menu mode: view-only menu");
                  return;
                }

                if (!inCart) addToCart(selectedProduct, selectedVariantId, selectedAddonIds);
                setScreen("payment");
              }}
              className="px-4 py-1.5 bg-black text-white rounded-md text-sm"
            >
              {isViewOnly ? "View" : "Next"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "payment") {
    if (isViewOnly) {
      setScreen("menu");
      return null;
    }

    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4" style={backgroundStyle}>
        <div className="w-[360px] max-w-full h-[660px] border border-brand-border bg-brand-card flex flex-col">
          <div className="p-3 flex items-center justify-between">
            <button className="px-3 py-1 text-xs bg-brand-bg rounded" onClick={() => setScreen("menu")}>Back</button>
            <h2 className="text-3xl text-sky-300">Payment</h2>
            <div />
          </div>

          <div className="px-4 space-y-4 flex-1 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between text-white">
                <div>
                  <div>{item.product.name}</div>
                  <div className="text-xs text-brand-muted">
                    {item.variantId
                      ? item.product.variants.find((v) => v.id === item.variantId)?.value
                      : 'Regular'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.product.id, -1)} className="w-7 h-7 border border-brand-border rounded">-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(item.product.id, 1)} className="w-7 h-7 border border-brand-border rounded">+</button>
                  <span className="w-14 text-right">₹{Math.round((item.product.price + (item.product.variants.find((v) => v.id === item.variantId)?.extraPrice || 0)) * item.qty)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-brand-border p-3 bg-[#c8adc7] text-black flex items-center justify-between">
            <div className="text-sm">Total: ₹{total}</div>
            <button onClick={placeOrder} className="px-4 py-1.5 bg-black text-white rounded-md text-sm">Confirmed</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "confirmed") {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4" style={backgroundStyle}>
        <div className="w-[360px] max-w-full h-[660px] border border-brand-border bg-brand-card flex flex-col items-center justify-center text-center p-6">
          <div className="w-28 h-28 rounded-full border-4 border-green-500/70 flex items-center justify-center mb-4">
            <Check size={56} className="text-green-400" />
          </div>
          <div className="text-5xl text-white font-bold">{orderNum || "#2205"}</div>
          <div className="text-green-400 mt-2 text-2xl">Order Confirmed</div>
          <div className="text-white text-5xl mt-3">₹{total}</div>
          <button onClick={() => setScreen("history")} className="mt-10 px-6 py-2 bg-[#c9b1c6] text-black rounded-lg font-semibold">Track My Order</button>
        </div>
      </div>
    );
  }

  if (screen === "history") {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4" style={backgroundStyle}>
        <div className="w-[360px] max-w-full h-[660px] border border-brand-border bg-brand-card flex flex-col">
          <div className="px-4 py-5 text-4xl text-white">Order History</div>
          <div className="px-4 space-y-3 flex-1">
            {(historyOrders.length ? historyOrders : HISTORY_STATUSES.map((status, idx) => ({ orderId: idx + 1, orderNumber: orderNum || '#1205', kitchenStage: status.toLowerCase().replace('-', '_') }))).map((row, idx) => (
              <div key={`order-${row.orderId}-${idx}`} className="flex items-center justify-between border-b border-brand-border/40 pb-2 text-white">
                <span>{row.orderNumber}</span>
                <span
                  className={clsx(
                    "px-3 py-1 rounded text-xs",
                    row.kitchenStage === "to_cook" && "bg-pink-600/70",
                    row.kitchenStage === "preparing" && "bg-purple-600/70",
                    row.kitchenStage === "completed" && "bg-amber-500/80 text-black",
                  )}
                >
                  {row.kitchenStage === "to_cook" ? "To-Cook" : row.kitchenStage === "preparing" ? "Preparing" : "Completed"}
                </span>
              </div>
            ))}
          </div>
          <div className="p-4">
            <button onClick={() => setScreen("confirmed")} className="w-full py-3 bg-[#c9b1c6] text-black rounded-lg text-xl">Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4" style={backgroundStyle}>
      <div className="w-[360px] max-w-full h-[660px] border border-brand-border bg-brand-card flex flex-col">
        <div className="p-3 flex items-center gap-2">
          <button className="px-3 py-1 text-xs bg-brand-bg rounded inline-flex items-center gap-1" onClick={() => setScreen("splash")}>
            <ArrowLeft size={12} /> Back
          </button>
          <div className="relative flex-1">
            <Search size={12} className="absolute left-2 top-2.5 text-brand-muted" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product"
              className="w-full pl-7 pr-2 py-1.5 text-xs bg-brand-bg border border-brand-border rounded text-white"
            />
          </div>
        </div>

        <div className="flex gap-2 px-3 pb-2 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={clsx(
                "px-3 py-1 text-[11px] rounded border",
                cat === c.id ? "text-white" : "bg-brand-bg border-brand-border text-brand-muted",
              )}
              style={cat === c.id ? { backgroundColor: c.color, borderColor: c.color } : undefined}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="px-3 grid grid-cols-3 gap-2 flex-1 overflow-y-auto pb-2">
          {filtered.slice(0, 12).map((p) => {
            const inCart = cart.find((i) => i.product.id === p.id);
            return (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedProduct(p);
                  setScreen("detail");
                }}
                className="border border-brand-border bg-brand-bg/50 min-h-[88px] p-2 text-left"
              >
                <div className="text-lg">{p.emoji || "🍽️"}</div>
                <div className="text-[11px] text-white leading-tight mt-1">{p.name.split(" ")[0]}</div>
                <div className="text-[10px] text-brand-muted mt-1">₹{p.price}</div>
                {!isViewOnly && (
                  <div className="mt-1 flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQty(p.id, -1);
                      }}
                      className="w-4 h-4 border border-brand-border text-[10px]"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="text-[10px] text-white">{inCart?.qty || 0}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(p);
                      }}
                      className="w-4 h-4 border border-brand-border text-[10px]"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="border-t border-brand-border p-3 bg-[#c8adc7] text-black flex items-center justify-between">
          <div className="text-xs">{itemCount} QTY<br />Total: ₹{total}</div>
          <button
            onClick={goNextFromMenu}
            className="px-4 py-1.5 bg-black text-white rounded-md text-sm disabled:opacity-60"
            disabled={isViewOnly}
          >
            {isViewOnly ? "View Only" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
