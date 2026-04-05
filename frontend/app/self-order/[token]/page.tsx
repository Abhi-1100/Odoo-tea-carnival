"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Coffee, Minus, Plus, Search } from "lucide-react";
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
  description?: string;
  emoji?: string;
  variants: { id: number; attribute: string; value: string; extraPrice: number }[];
  addons: { id: number; name: string; price: number }[];
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
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
  const [processingPayment, setProcessingPayment] = useState(false);

  const resolveBackgroundUrl = (rawUrl: string) => {
    if (!rawUrl) return "";
    if (rawUrl.startsWith("/")) return rawUrl;

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const apiOrigin = apiBase.replace(/\/api\/?$/, "");

    try {
      const parsed = new URL(rawUrl);
      if (parsed.pathname.startsWith("/uploads/")) {
        return `${apiOrigin}${parsed.pathname}`;
      }
      return rawUrl;
    } catch {
      return rawUrl;
    }
  };

  const isViewOnly = mode === "qr_menu";

  const [isLoading, setIsLoading] = useState(true);

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
        
        // If QR menu mode, go straight to menu
        if (settingsRes.data.mode === "qr_menu") {
          setScreen("menu");
        }
      } catch {
        if (!mounted) return;
        toast.error("Invalid or expired self-order token");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadContext();

    return () => {
      mounted = false;
    };
  }, [params.token]);

  useEffect(() => {
    if (!pageSettings?.backgroundImages?.length) return;
    const timer = setInterval(() => {
      const sliderLength = Math.min(3, pageSettings.backgroundImages.length);
      setSplashIndex((prev) => (prev + 1) % sliderLength);
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

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return products.filter((p) => {
      const inSelectedCategory = cat === "all" || p.categoryId === cat;
      const matchesSearch =
        query.length === 0 ||
        p.name.toLowerCase().includes(query) ||
        (p.description || "").toLowerCase().includes(query) ||
        p.variants.some((v) => (`${v.attribute} ${v.value}`).toLowerCase().includes(query)) ||
        p.addons.some((a) => a.name.toLowerCase().includes(query));

      // When user searches, show matches from all categories.
      return query.length > 0 ? matchesSearch : inSelectedCategory;
    });
  }, [products, cat, searchTerm]);

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

  const placeOrder = async (payment?: { method?: 'cash' | 'digital' | 'upi'; amountPaid: number; reference?: string; status?: 'pending' | 'confirmed' | 'failed' | 'refunded' }) => {
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
        payment,
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

  const loadRazorpayScript = async () => {
    if (window.Razorpay) return true;
    return await new Promise<boolean>((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const payAndPlaceOrder = async () => {
    if (isViewOnly) {
      toast.error('Ordering is disabled in QR Menu mode');
      return;
    }
    if (!cart.length) {
      toast.error('Your cart is empty!');
      return;
    }

    try {
      setProcessingPayment(true);
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady || !window.Razorpay) {
        toast.error('Failed to load Razorpay SDK');
        return;
      }

      const createOrderRes = await api.selfOrder.createRazorpayOrderByToken(params.token, {
        amount: total,
        currency: 'INR',
      });

      const { keyId, order } = createOrderRes.data;

      const rz = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: pageSettings?.restaurantName || 'Odoo Cafe',
        description: `Self order payment - ${tableLabel}`,
        order_id: order.id,
        handler: async (response: Record<string, string>) => {
          try {
            await api.selfOrder.verifyRazorpayPaymentByToken(params.token, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            await placeOrder({
              method: 'digital',
              amountPaid: total,
              reference: response.razorpay_payment_id,
              status: 'confirmed',
            });
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Payment verification failed');
          } finally {
            setProcessingPayment(false);
          }
        },
        theme: { color: '#95416a' },
        modal: {
          ondismiss: () => setProcessingPayment(false),
        },
      });

      rz.open();
    } catch (error) {
      setProcessingPayment(false);
      toast.error(error instanceof Error ? error.message : 'Unable to start payment');
    }
  };

  const sliderImages = useMemo(
    () => (pageSettings?.backgroundImages || []).map(resolveBackgroundUrl).filter(Boolean).slice(0, 3),
    [pageSettings?.backgroundImages],
  );

  const activeBackground = sliderImages[splashIndex] || null;

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

  const backgroundStyle = screen === "splash" ? pageBackgroundStyle : pageBackgroundStyle;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-[#c9b1c6] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white/60 font-medium animate-pulse">Loading Menu...</p>
      </div>
    );
  }

  // QR Menu View - Digital menu card (view-only)
  if (isViewOnly && screen === "menu") {
    const filtered = products.filter((p) => {
      const query = searchTerm.trim().toLowerCase();
      const inSelectedCategory = cat === "all" || p.categoryId === cat;
      const matchesSearch =
        query.length === 0 ||
        p.name.toLowerCase().includes(query) ||
        (p.description || "").toLowerCase().includes(query) ||
        p.variants.some((v) => (`${v.attribute} ${v.value}`).toLowerCase().includes(query)) ||
        p.addons.some((a) => a.name.toLowerCase().includes(query));

      return query.length > 0 ? matchesSearch : inSelectedCategory;
    });

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
        <div className="w-[320px] max-w-full h-[640px] rounded-2xl border border-brand-border bg-black/65 backdrop-blur-sm overflow-hidden flex flex-col">
          <div className="relative flex-1">
            {sliderImages.length > 0 ? (
              sliderImages.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className={`absolute inset-0 transition-opacity duration-700 ${index === splashIndex ? "opacity-100" : "opacity-0"}`}
                  style={{
                    backgroundImage: `linear-gradient(rgba(11,14,20,0.35), rgba(11,14,20,0.6)), url(${image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ))
            ) : (
              <div className="absolute inset-0" style={{ backgroundColor: pageSettings?.backgroundColor || "#95416a" }} />
            )}

            <div className="absolute inset-0 p-5 flex flex-col items-center justify-between">
              <div className="mt-1">
                {pageSettings?.logo ? (
                  <img
                    src={resolveBackgroundUrl(pageSettings.logo)}
                    alt="Cafe logo"
                    className="h-12 w-12 rounded-xl object-cover border border-white/50 bg-black/25"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-2xl bg-[#e8a838] flex items-center justify-center shadow-xl shadow-[#e8a838]/40 border border-[#ffd77a]/40">
                    <Coffee size={24} className="text-white" />
                  </div>
                )}
              </div>

              {sliderImages.length > 1 && (
                <div className="flex items-center gap-2 mb-2">
                  {sliderImages.map((_, index) => (
                    <button
                      key={`dot-${index}`}
                      type="button"
                      aria-label={`Slide ${index + 1}`}
                      onClick={() => setSplashIndex(index)}
                      className={`h-2.5 rounded-full transition-all ${index === splashIndex ? "w-6 bg-white" : "w-2.5 bg-white/50"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setScreen("menu")}
            disabled={isViewOnly}
            className={`m-5 mt-4 w-[calc(100%-40px)] py-3 rounded-lg font-semibold ${isViewOnly ? "bg-gray-500 text-gray-300 cursor-not-allowed" : "bg-[#c9b1c6] text-black"}`}
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
            <button
              onClick={payAndPlaceOrder}
              disabled={processingPayment}
              className="px-4 py-1.5 bg-black text-white rounded-md text-sm disabled:opacity-60"
            >
              {processingPayment ? 'Opening...' : 'Confirmed'}
            </button>
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
      <div className="w-[360px] max-w-full h-[660px] border border-[#7d3f72] bg-[#20223a] flex flex-col rounded-md overflow-hidden">
        <div className="p-3 flex items-center gap-2 border-b border-brand-border/50">
          <button
            className="h-9 px-4 text-sm bg-[#2a2f45] text-white rounded-lg inline-flex items-center gap-1.5"
            onClick={() => setScreen("splash")}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="relative flex-1 h-9">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product"
              className="w-full h-full pl-9 pr-3 text-sm bg-[#181c31] border border-brand-border rounded-md text-white placeholder:text-brand-muted"
            />
          </div>
        </div>

        <div className="flex gap-2 px-3 py-2 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={clsx(
                "px-3 py-1.5 text-[12px] rounded-md border whitespace-nowrap",
                cat === c.id ? "text-white" : "bg-[#1b1f34] border-brand-border text-[#c7cae0]",
              )}
              style={cat === c.id ? { backgroundColor: c.color, borderColor: c.color } : undefined}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="px-3 grid grid-cols-3 gap-3 flex-1 overflow-y-auto pb-3 content-start">
          {filtered.slice(0, 12).map((p) => {
            const inCart = cart.find((i) => i.product.id === p.id);
            return (
              <div
                key={p.id}
                className="border border-[#343955] bg-[#232842] min-h-[150px] rounded-sm overflow-hidden flex flex-col"
              >
                <button
                  onClick={() => {
                    setSelectedProduct(p);
                    setScreen("detail");
                  }}
                  className="flex-1 w-full flex items-center justify-center text-4xl text-white/80"
                >
                  {p.emoji || "🍽️"}
                </button>

                <div className="px-2 py-1.5 border-t border-[#4b3ea1] bg-[#1f2438]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] text-white leading-tight truncate">{p.name}</div>
                    <div className="text-[11px] text-white font-semibold">₹{p.price}</div>
                  </div>
                  {!isViewOnly && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <button
                        onClick={() => updateQty(p.id, -1)}
                        className="w-5 h-5 border border-brand-border rounded-sm text-[10px] inline-flex items-center justify-center text-white"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-[11px] text-white min-w-3 text-center">{inCart?.qty || 0}</span>
                      <button
                        onClick={() => addToCart(p)}
                        className="w-5 h-5 border border-brand-border rounded-sm text-[10px] inline-flex items-center justify-center text-white"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-10 text-sm text-brand-muted">No products found</div>
          )}
        </div>

        <div className="border-t border-brand-border p-3 bg-[#c8adc7] text-black flex items-center justify-between">
          <div className="text-[13px] leading-tight">
            <div>{itemCount} QTY</div>
            <div className="mt-1 font-medium">Total: ₹{total}</div>
          </div>
          <button
            onClick={goNextFromMenu}
            className="px-5 py-2 bg-black text-white rounded-xl text-sm disabled:opacity-60"
            disabled={isViewOnly}
          >
            {isViewOnly ? "View Only" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
