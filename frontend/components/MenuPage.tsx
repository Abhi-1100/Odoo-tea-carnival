'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ShoppingBag, Plus, Info, Search, X, Minus, Trash2, Loader } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { getPublicOrderToken, setPublicOrderToken, loadPublicOrderCart, savePublicOrderCart, clearPublicOrderCart } from '../lib/publicOrderSession';
import toast from 'react-hot-toast';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  emoji: string;
}

interface MenuCategory {
  id: number | string;
  name: string;
  color?: string;
}

interface MenuProduct {
  id: number | string;
  name: string;
  price: number;
  categoryId: number | string;
  image: string | null;
  description?: string;
  emoji?: string;
}

const MenuPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [restaurantName, setRestaurantName] = useState('COFFEE LEO');
  const [activeCategory, setActiveCategory] = useState<number | string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null);

  // Load token from URL or localStorage
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      setPublicOrderToken(urlToken);
    } else {
      const savedToken = getPublicOrderToken();
      setToken(savedToken);
    }
  }, [searchParams]);

  // Load menu data from API
  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('No table token found. Please scan QR code.');
      return;
    }

    const loadMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch page settings and products
        const [settingsRes, productsRes] = await Promise.all([
          api.selfOrder.getPageSettings(token),
          api.selfOrder.getProductsForPage(token)
        ]);

        if (settingsRes?.data?.restaurantName) {
          setRestaurantName(settingsRes.data.restaurantName);
        }

        setCategories(productsRes?.categories || []);
        setProducts(productsRes?.products || []);
        
        if (productsRes?.categories?.length > 0) {
          setActiveCategory(productsRes.categories[0].id);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to load menu:', err);
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Failed to load menu. Please try again.');
        }
        setLoading(false);
      }
    };

    loadMenu();
  }, [token]);

  // Load cart from localStorage when token changes
  useEffect(() => {
    if (token) {
      const savedCart = loadPublicOrderCart<CartItem>(token);
      setCart(savedCart);
    }
  }, [token]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (token) {
      savePublicOrderCart(token, cart);
    }
  }, [cart, token]);

  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your bucket is empty');
      return;
    }
    if (!token) {
      toast.error('Invalid table token');
      return;
    }
    router.push(`/checkout?token=${token}`);
  };

  const filteredProducts = products.filter(p => {
    const categoryMatch = activeCategory === 'all' || p.categoryId === activeCategory;
    const searchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  const showAddedToast = (productName: string) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-[#161614]/95 backdrop-blur-2xl border border-[#e8a838]/30 shadow-[0_32px_64px_-12px_rgba(232,168,56,0.15)] rounded-3xl pointer-events-auto flex items-center justify-between p-5 mb-6 transform translate-y-[-24px] md:translate-y-0 active:scale-95 transition-all duration-300`}
      >
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-[#e8a838]/10 flex items-center justify-center border border-[#e8a838]/20 transition-transform group-hover:scale-110">
            <ShoppingBag size={24} className="text-[#e8a838]" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-[#e8a838]/50 uppercase tracking-[4px] leading-none mb-1.5">Atmospheric Selection</p>
            <p className="text-[#f0dfdb] font-serif text-xl leading-tight tracking-tight">{productName}</p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsCartOpen(true);
            toast.dismiss(t.id);
          }}
          className="bg-[#e8a838] text-[#161614] px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-[4px] hover:bg-white transition-all transform active:scale-95 shadow-lg shadow-[#e8a838]/20 whitespace-nowrap ml-4"
        >
          View Bucket
        </button>
      </div>
    ), {
      position: 'bottom-center',
      duration: 5000
    });
  };

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        quantity: 1, 
        image: product.image,
        emoji: product.emoji 
      }];
    });
    showAddedToast(product.name);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#191210] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#d4af37] animate-spin mx-auto mb-4" />
          <p className="text-[#f0dfdb]">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#191210] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-serif text-[#d4af37] mb-4">Oops!</h2>
          <p className="text-[#f0dfdb] mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-[#d4af37] text-[#191210] px-6 py-3 rounded-2xl font-bold uppercase tracking-widest hover:bg-[#f2ca50] transition-all"
          >
            Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#191210] text-[#f0dfdb] font-sans selection:bg-[#d4af37] selection:text-[#191210] pb-24">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#191210]/95 backdrop-blur-xl border-b border-[#d4af37]/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#d4af37] hover:opacity-80 transition-opacity">
            <ChevronLeft size={20} />
            <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Back</span>
          </Link>
          
          <div className="flex flex-col items-center">
            <span className="text-xl font-serif font-bold tracking-tight text-[#d4af37]">{restaurantName}</span>
            <span className="text-[8px] tracking-[4px] uppercase opacity-40">Menu Selection</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-[#f0dfdb]/60 hover:text-[#d4af37] transition-colors">
              <Search size={20} />
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#d4af37] hover:scale-110 transition-transform"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-[#d4af37] text-[#191210] text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce-short">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="pt-24 px-4 relative z-40">
        {/* Category Tabs */}
        <div className="sticky top-24 z-40 bg-[#161614]/85 backdrop-blur-xl py-3 px-6 shadow-2xl shadow-[#161614]/20 rounded-full max-w-5xl mx-auto border border-[#d4af37]/20">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex items-center gap-8 min-w-max pb-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`group relative flex flex-col items-center transition-all ${
                activeCategory === 'all' ? 'text-[#d4af37]' : 'text-[#f0dfdb]/40 hover:text-[#f0dfdb]/80'
              }`}
            >
              <span className="text-sm font-bold uppercase tracking-[4px] mb-2 opacity-100">
                All
              </span>
              <div className={`h-[2px] bg-[#d4af37] transition-all duration-300 rounded-full ${
                activeCategory === 'all' ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-4 group-hover:opacity-50'
              }`} />
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`group relative flex flex-col items-center transition-all ${
                  activeCategory === cat.id ? 'text-[#d4af37]' : 'text-[#f0dfdb]/40 hover:text-[#f0dfdb]/80'
                }`}
              >
                <span className={`text-sm font-bold uppercase tracking-[4px] mb-2 ${activeCategory === cat.id ? 'opacity-100' : 'opacity-100'}`}>
                  {cat.name}
                </span>
                <div className={`h-[2px] bg-[#d4af37] transition-all duration-300 rounded-full ${
                  activeCategory === cat.id ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-4 group-hover:opacity-50'
                }`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product List */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group flex flex-col">
              <div 
                onClick={() => setSelectedProduct(product)}
                className="relative aspect-square overflow-hidden rounded-[32px] mb-6 bg-[#261e1b] border border-[#d4af37]/5 cursor-pointer"
              >
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : product.emoji ? (
                  <div className="w-full h-full flex items-center justify-center text-6xl opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500">
                    {product.emoji}
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#d4af37]/20 to-[#191210] flex items-center justify-center">
                    <ShoppingBag className="text-[#d4af37] opacity-30" size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#191210]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Quick Add Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                  }}
                  className="absolute bottom-6 right-6 w-12 h-12 bg-[#d4af37] text-[#191210] rounded-2xl flex items-center justify-center shadow-xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all active:scale-90 z-10"
                >
                  <Plus size={24} strokeWidth={3} />
                </button>
              </div>

              <div className="flex-1 px-2">
                <div className="flex justify-between items-start mb-3">
                  <h3 
                    onClick={() => setSelectedProduct(product)}
                    className="text-xl font-serif font-medium group-hover:text-[#d4af37] transition-colors cursor-pointer"
                  >
                    {product.name}
                  </h3>
                  <span className="font-mono text-[#d4af37] font-semibold tracking-tighter">
                    ₹{product.price}
                  </span>
                </div>
                
                <p className="text-xs text-[#f0dfdb]/50 leading-relaxed line-clamp-2 mb-6">
                  {product.description || "Indulge in our masterfully crafted selection, prepared with passion and the finest local ingredients."}
                </p>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedProduct(product)}
                    className="flex-1 bg-[#261e1b] hover:bg-[#322825] text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl border border-[#d4af37]/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Info size={14} className="text-[#d4af37]" />
                    See Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      </div>

      {/* Cart (Bucket) Side Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsCartOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[#191210] h-full shadow-2xl flex flex-col border-l border-[#d4af37]/20 transform transition-transform duration-300 translate-x-0">
            <div className="px-8 py-6 border-b border-[#d4af37]/10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif text-[#d4af37]">Your Bucket</h2>
                <p className="text-[10px] uppercase tracking-widest opacity-40">{cartCount} Delicacies Selected</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="w-10 h-10 rounded-full bg-[#261e1b] flex items-center justify-center text-[#d4af37] hover:scale-110 transition-transform"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6 no-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 italic font-serif">
                  <ShoppingBag size={64} className="mb-4 text-[#d4af37] opacity-20" />
                  <p className="text-xl">Your bucket is currently empty...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="w-20 h-20 rounded-2xl bg-[#261e1b] overflow-hidden flex-shrink-0 border border-[#d4af37]/10">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">{item.emoji}</div>
                        )}
                      </div>
                      <div className="flex-1 py-1">
                        <div className="flex justify-between mb-1">
                          <h4 className="font-serif text-lg">{item.name}</h4>
                          <span className="font-mono text-[#d4af37]">₹{item.price * item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3 bg-[#261e1b] rounded-lg px-2 py-1">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-6 h-6 flex items-center justify-center text-[#d4af37] hover:bg-[#d4af37]/10 rounded"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-xs font-mono w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-6 h-6 flex items-center justify-center text-[#d4af37] hover:bg-[#d4af37]/10 rounded"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button 
                            onClick={() => updateQuantity(item.id, -item.quantity)}
                            className="text-[#ef4444] opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="px-8 pt-6 pb-12 bg-[#221a18] border-t border-[#d4af37]/20">
                <div className="flex justify-between items-end mb-8">
                  <span className="text-xs font-bold uppercase tracking-[4px] opacity-40">Subtotal</span>
                  <span className="text-3xl font-mono text-[#d4af37]">₹{subtotal}</span>
                </div>
                <button 
                  onClick={handleProceedToCheckout}
                  className="w-full bg-[#d4af37] text-[#191210] py-5 rounded-2xl font-bold uppercase tracking-[4px] hover:bg-[#f2ca50] transition-all transform active:scale-95 shadow-xl shadow-[#d4af37]/10"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            onClick={() => setSelectedProduct(null)}
          />
          <div className="relative w-full max-w-2xl bg-[#191210] rounded-[40px] overflow-hidden shadow-2xl border border-[#d4af37]/20 flex flex-col md:flex-row">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:scale-110 transition-transform"
            >
              <X size={20} />
            </button>
            <div className="w-full md:w-1/2 aspect-square md:aspect-auto">
              {selectedProduct.image ? (
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl bg-[#261e1b]">{selectedProduct.emoji}</div>
              )}
            </div>
            <div className="flex-1 p-10 flex flex-col justify-center">
              <span className="text-[#d4af37] text-[10px] font-bold uppercase tracking-[4px] mb-4">Masterpiece Collection</span>
              <h3 className="text-3xl font-serif mb-4 leading-tight">{selectedProduct.name}</h3>
              <p className="text-[#f0dfdb]/60 text-sm leading-relaxed mb-8">
                {selectedProduct.description || "Our artisanal approach ensures every sip is an exploration of depth and character. Sourced from the finest estates and roasted to bring out unique flavor notes."}
              </p>
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-[#d4af37]/10">
                <span className="text-3xl font-mono text-[#d4af37]">₹{selectedProduct.price}</span>
                <button 
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="bg-[#d4af37] text-[#191210] px-8 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-[#f2ca50] transition-all flex items-center gap-3"
                >
                  <Plus size={18} strokeWidth={3} />
                  Add to Bucket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart Button (Mobile) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 md:hidden z-50">
        <button 
          onClick={() => setIsCartOpen(true)}
          className="bg-[#d4af37] text-[#191210] px-8 py-4 rounded-full font-bold uppercase tracking-widest shadow-2xl flex items-center gap-4 active:scale-95 transition-transform"
        >
          <div className="relative">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#191210] text-[#d4af37] text-[8px] font-bold rounded-full flex items-center justify-center border border-[#d4af37]/20">
                {cartCount}
              </span>
            )}
          </div>
          Bucket Total: ₹{subtotal}
        </button>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-short {
          animation: bounce-short 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default MenuPage;

