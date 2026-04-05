'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, CreditCard, Banknote, QrCode, CheckCircle2, Copy, ArrowRight, Printer, Home, Loader } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { getPublicOrderToken, setPublicOrderToken, loadPublicOrderCart, clearPublicOrderCart } from '../lib/publicOrderSession';
import toast from 'react-hot-toast';

interface CheckoutCartItem {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  emoji?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckoutPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [cart, setCart] = useState<CheckoutCartItem[]>([]);
  const [tableName, setTableName] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderResponseTableName, setOrderResponseTableName] = useState('');

  // Bootstrap token and load session data
  useEffect(() => {
    const initCheckout = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        // Resolve token from URL or localStorage
        const urlToken = searchParams.get('token');
        const resolvedToken = urlToken || getPublicOrderToken();

        if (!resolvedToken) {
          setLoadError('Please scan your table QR code to order.');
          setLoading(false);
          return;
        }

        setToken(resolvedToken);
        setPublicOrderToken(resolvedToken);

        // Validate token and load session data
        const [validationRes, settingsRes] = await Promise.all([
          api.selfOrder.validateToken(resolvedToken),
          api.selfOrder.getPageSettings(resolvedToken)
        ]);

        if (!validationRes.valid) {
          setLoadError('This table session is invalid or expired.');
          setLoading(false);
          return;
        }

        if (settingsRes?.data?.tableName) {
          setTableName(settingsRes.data.tableName);
        }

        // Load cart from localStorage
        const savedCart = loadPublicOrderCart<CheckoutCartItem>(resolvedToken);
        setCart(savedCart.length > 0 ? savedCart : []);

        setLoading(false);
      } catch (err) {
        console.error('Checkout initialization failed:', err);
        if (err instanceof ApiError) {
          setLoadError(err.message);
        } else {
          setLoadError('Failed to load checkout. Please try again.');
        }
        setLoading(false);
      }
    };

    initCheckout();
  }, [searchParams]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => {
        toast.error('Failed to load Razorpay SDK');
        resolve(false);
      };
      document.head.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!token) {
      toast.error('Invalid session token');
      return;
    }

    try {
      setIsProcessing(true);

      // Build order items from cart
      const items = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.price,
      }));

      if (paymentMethod === 'cash') {
        // Cash payment: direct backend order creation
        const response = await api.selfOrder.placeOrderByToken(token, {
          items,
          customerName: 'Guest',
          payment: {
            method: 'cash',
            amountPaid: total,
            status: 'confirmed',
          },
        });

        setOrderId(response.orderId);
        setOrderNumber(response.orderNumber);
        setOrderResponseTableName(response.tableName);
        clearPublicOrderCart(token);
        setIsSuccess(true);
        toast.success('Order placed successfully!', {
          duration: 5000,
          style: { background: '#191210', color: '#d4af37', border: '1px solid #d4af3733' },
        });
        setIsProcessing(false);
      } else if (paymentMethod === 'card' || paymentMethod === 'upi') {
        // Razorpay payment flow
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          setIsProcessing(false);
          return;
        }

        // Create Razorpay order
        const razorpayOrderRes = await api.selfOrder.createRazorpayOrderByToken(token, {
          amount: Math.round(total * 100), // Amount in paise
          currency: 'INR',
        });

        const { keyId, order } = razorpayOrderRes.data;

        // Open Razorpay modal
        const razorpayOptions = {
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          order_id: order.id,
          handler: async (paymentResponse: any) => {
            try {
              // Verify payment
              const verifyRes = await api.selfOrder.verifyRazorpayPaymentByToken(token, {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              });

              if (!verifyRes.data.verified) {
                toast.error('Payment verification failed');
                setIsProcessing(false);
                return;
              }

              // Place order with verified payment
              const response = await api.selfOrder.placeOrderByToken(token, {
                items,
                customerName: 'Guest',
                payment: {
                  method: paymentMethod === 'upi' ? 'upi' : 'digital',
                  reference: paymentResponse.razorpay_payment_id,
                  status: 'confirmed',
                },
              });

              setOrderId(response.orderId);
              setOrderNumber(response.orderNumber);
              setOrderResponseTableName(response.tableName);
              clearPublicOrderCart(token);
              setIsSuccess(true);
              toast.success('Order placed successfully!', {
                duration: 5000,
                style: { background: '#191210', color: '#d4af37', border: '1px solid #d4af3733' },
              });
              setIsProcessing(false);
            } catch (err) {
              console.error('Order placement failed:', err);
              toast.error(err instanceof ApiError ? err.message : 'Failed to place order');
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              toast.error('Payment cancelled');
            },
          },
          theme: {
            color: '#d4af37',
          },
        };

        const rz = new window.Razorpay(razorpayOptions);
        rz.open();
      }
    } catch (err) {
      console.error('Order placement error:', err);
      toast.error(err instanceof ApiError ? err.message : 'Failed to place order');
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#191210] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#d4af37] animate-spin mx-auto mb-4" />
          <p className="text-[#f0dfdb]">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#191210] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-serif text-[#d4af37] mb-4">Invalid Session</h2>
          <p className="text-[#f0dfdb] mb-6">{loadError}</p>
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

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#191210] flex items-center justify-center p-6 overflow-hidden relative noise-grain">
        {/* Celebration Background Circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#d4af37]/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#d4af37]/10 rounded-full blur-3xl animate-bounce-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-3xl animate-bounce-slow delay-1000" />

        <div className="relative z-10 max-w-lg w-full text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#d4af37]/20 rounded-full blur-xl scale-150 animate-pulse" />
              <CheckCircle2 size={120} className="text-[#d4af37] relative z-10 animate-success-pop" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif text-[#d4af37] mb-4 tracking-tight">Order Finalized</h1>
          <p className="text-[#f0dfdb]/60 mb-12 font-sans uppercase tracking-[4px] text-[10px]">Your Selection is being Crafted</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[#261e1b] border border-[#d4af37]/10 rounded-[32px] p-8 transform hover:scale-105 transition-transform duration-500">
              <span className="text-[10px] uppercase tracking-[4px] opacity-40 mb-2 block font-bold">Table</span>
              <h2 className="text-5xl font-mono text-[#d4af37] font-bold">{orderResponseTableName}</h2>
            </div>
            <div className="bg-[#261e1b] border border-[#d4af37]/10 rounded-[32px] p-8 transform hover:scale-105 transition-transform duration-500">
              <span className="text-[10px] uppercase tracking-[4px] opacity-40 mb-2 block font-bold">Order ID</span>
              <h2 className="text-5xl font-mono text-[#f0dfdb] font-bold">{orderNumber}</h2>
            </div>
          </div>

          <div className="bg-[#161614] border border-[#d4af37]/5 rounded-[32px] p-6 mb-12 flex items-center justify-between group">
            <div className="text-left">
              <span className="text-[9px] uppercase tracking-[4px] opacity-20 block mb-1 font-bold">System Reference</span>
              <h3 className="text-sm font-mono text-[#f0dfdb]/40 group-hover:text-[#d4af37] transition-colors">{orderId}</h3>
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(orderId);
                toast.success('Reference copied');
              }}
              className="p-3 hover:bg-[#d4af37]/10 rounded-2xl transition-colors text-[#d4af37]/40"
            >
              <Copy size={18} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => token ? router.push(`/self-order/${token}`) : router.push('/')}
              className="w-full sm:w-auto bg-[#d4af37] text-[#191210] px-10 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-[#f2ca50] transition-all flex items-center justify-center gap-3"
            >
              👀 Track Order
            </button>
            <button 
              onClick={() => router.push('/')}
              className="w-full sm:w-auto border border-[#d4af37]/30 text-[#d4af37] px-10 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-[#d4af37]/5 transition-all flex items-center justify-center gap-3"
            >
              <Home size={18} />
              Return Home
            </button>
          </div>
        </div>

        <style jsx global>{`
          @keyframes success-pop {
            0% { transform: scale(0.5); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-success-pop {
            animation: success-pop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          .animate-bounce-slow {
            animation: bounce-slow 4s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#191210] text-[#f0dfdb] font-sans selection:bg-[#d4af37] selection:text-[#191210] p-6 pt-32 pb-12">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">
        
        {/* Left Column: Order Summary */}
        <div className="space-y-12">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#d4af37] hover:opacity-80 transition-opacity"
          >
            <ChevronLeft size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Adjust Order</span>
          </button>

          <div className="space-y-6">
            <h1 className="text-4xl font-serif">Order Summary</h1>
            <div className="space-y-8 max-h-[400px] overflow-y-auto no-scrollbar pr-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-6 group">
                  <div className="w-20 h-20 rounded-2xl bg-[#261e1b] overflow-hidden flex-shrink-0 border border-[#d4af37]/10">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">{item.emoji}</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-serif text-xl mb-1">{item.name}</h4>
                      <span className="font-mono text-[#d4af37] transition-transform group-hover:scale-110">₹{item.price * item.quantity}</span>
                    </div>
                    <p className="text-xs opacity-40 uppercase tracking-widest">Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-[#d4af37]/10 space-y-4">
              <div className="flex justify-between text-xs opacity-50 uppercase tracking-[4px]">
                <span>Delicacy Subtotal</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-xs opacity-50 uppercase tracking-[4px]">
                <span>Atelier Surcharge (5%)</span>
                <span>₹{tax.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-end pt-4">
                <span className="text-sm font-bold uppercase tracking-[6px]">Final Investment</span>
                <span className="text-4xl font-mono text-[#d4af37]">₹{total.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Selection */}
        <div className="bg-[#221a18] rounded-[40px] p-8 md:p-12 border border-[#d4af37]/10 shadow-2xl">
          <h2 className="text-2xl font-serif mb-8 text-[#d4af37]">Payment Method</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {[
              { id: 'card', name: 'Card', icon: <CreditCard size={24} /> },
              { id: 'cash', name: 'Cash', icon: <Banknote size={24} /> },
              { id: 'upi', name: 'UPI QR', icon: <QrCode size={24} /> }
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id as any)}
                className={`flex flex-col items-center justify-center gap-4 p-6 rounded-3xl border-2 transition-all duration-300 ${
                  paymentMethod === method.id 
                    ? 'border-[#d4af37] bg-[#d4af37]/5 text-[#d4af37] scale-105 shadow-lg shadow-[#d4af37]/5' 
                    : 'border-transparent bg-[#191210] opacity-40 hover:opacity-80'
                }`}
              >
                {method.icon}
                <span className="text-[10px] font-bold uppercase tracking-widest">{method.name}</span>
              </button>
            ))}
          </div>

          <div className="min-h-[280px] flex flex-col items-center justify-center text-center p-8 bg-[#191210]/50 rounded-[32px] border border-[#d4af37]/5 mb-12">
            {paymentMethod === 'card' && (
              <div className="w-full space-y-6">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-[4px] opacity-40 ml-2">Card Holder</label>
                  <input type="text" placeholder="G. Leo" className="w-full bg-[#191210] border border-[#d4af37]/20 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[#d4af37]" />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-[4px] opacity-40 ml-2">Card Number</label>
                  <input type="text" placeholder="•••• •••• •••• ••••" className="w-full bg-[#191210] border border-[#d4af37]/20 rounded-2xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-[#d4af37]" />
                </div>
              </div>
            )}
            {paymentMethod === 'cash' && (
              <div className="space-y-6">
                <Banknote size={48} className="mx-auto text-[#d4af37] opacity-60 mb-2" />
                <h3 className="text-xl font-serif">Pay at the Atelier</h3>
                <p className="text-sm opacity-50 px-8">Confirm your order here and complete payment at the counter while your coffee is brewed.</p>
              </div>
            )}
            {paymentMethod === 'upi' && (
              <div className="space-y-6">
                <div className="relative p-4 bg-white rounded-2xl inline-block shadow-2xl">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CoffeeLeoOrder&color=191210" 
                    alt="UPI QR Code" 
                    className="w-32 h-32"
                  />
                  <div className="absolute inset-0 border-4 border-[#d4af37]/20 rounded-2xl pointer-events-none" />
                </div>
                <p className="text-sm opacity-60 font-serif italic">Scan with any UPI app to satisfy the palate.</p>
              </div>
            )}
          </div>

          <button 
            onClick={handlePlaceOrder}
            disabled={isProcessing}
            className="w-full relative overflow-hidden bg-[#d4af37] text-[#191210] py-6 rounded-2xl font-bold uppercase tracking-[4px] hover:bg-[#f2ca50] transition-all group disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-[#191210]/30 border-t-[#191210] rounded-full animate-spin" />
                Brewing Payment...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                Finalize Atelier Order
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </div>
            )}
          </button>
          
          <p className="mt-8 text-[10px] text-center opacity-30 uppercase tracking-[4px] leading-relaxed">
            By fulfilling this order, you agree to our <br />
            Artisanal Terms of Consumption.
          </p>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;
