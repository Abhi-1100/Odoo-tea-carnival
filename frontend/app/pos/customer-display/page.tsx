"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { QrCode } from "lucide-react";
import { api } from "@/lib/api";

type DisplayMode = "idle" | "order" | "qr" | "thankyou";

interface DisplayItem {
  id: number;
  quantity: number;
  lineTotal: number;
  product: { name: string };
}

interface DisplayOrder {
  id: number;
  orderNumber: string;
  status: string;
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  table?: { id: number; tableNumber: string };
  items?: DisplayItem[];
  completedAt?: string;
}

interface DisplayPayload {
  mode: DisplayMode;
  storeName: string;
  message: string;
  order: DisplayOrder | null;
  payment?: {
    id: number;
    status: string;
    amountPaid: number;
    paymentMethod: { name: string; type: string };
  } | null;
}

export default function CustomerDisplay() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DisplayPayload>({
    mode: "idle",
    storeName: "Odoo Cafe",
    message: "Welcome! Your order will appear here.",
    order: null,
    payment: null,
  });

  const loadDisplayState = useCallback(async () => {
    const response = await api.customerDisplay.getActive();
    setData(response.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDisplayState();

    const timer = setInterval(() => {
      loadDisplayState();
    }, 3000);

    const socket: Socket = io("http://localhost:5000/customer", {
      transports: ["websocket"],
      withCredentials: false,
    });

    socket.on("display_updated", loadDisplayState);
    socket.on("payment_confirmed", loadDisplayState);

    return () => {
      clearInterval(timer);
      socket.disconnect();
    };
  }, [loadDisplayState]);

  const subtotal = Number(data.order?.subtotal || 0);
  const tax = Number(data.order?.taxAmount || 0);
  const total = Number(data.order?.totalAmount || 0);

  const rightPanel = useMemo(() => {
    if (loading) {
      return <div className="text-2xl text-slate-300">Loading display...</div>;
    }

    if (data.mode === "thankyou") {
      return (
        <div className="text-center">
          <h2 className="text-5xl font-semibold text-slate-100 leading-tight">Thank you for shopping with us</h2>
          <p className="text-4xl text-slate-300 mt-4">See you again</p>
        </div>
      );
    }

    if (data.mode === "qr") {
      return (
        <div className="w-full max-w-sm border border-slate-500 bg-black/40 p-5 text-center">
          <div className="text-3xl text-slate-100 mb-3">UPI QR</div>
          <div className="mx-auto h-60 w-60 bg-white text-black grid place-items-center">
            <div className="text-center">
              <QrCode size={72} className="mx-auto" />
              <div className="font-bold text-xl mt-2">SCAN ME</div>
            </div>
          </div>
          <div className="mt-3 text-2xl text-slate-100">Amount ${total.toFixed(0)}</div>
        </div>
      );
    }

    if (data.mode === "order" && data.order) {
      return (
        <div className="w-full max-w-xl">
          <div className="space-y-3 mb-8">
            {(data.order.items || []).map((item) => (
              <div key={item.id} className="flex items-center justify-between text-3xl text-slate-100">
                <span>{item.quantity} x {item.product.name}</span>
                <span>${Number(item.lineTotal).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-3xl">
            <div className="flex items-center justify-between text-slate-300">
              <span>Sub Total:</span>
              <span>${subtotal.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Tax:</span>
              <span>${tax.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-100 font-semibold mt-3">
              <span>Total:</span>
              <span>${total.toFixed(0)}</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center">
        <div className="text-8xl mb-6">👋</div>
        <h2 className="text-4xl font-semibold text-slate-100">Welcome!</h2>
        <p className="text-slate-300 text-2xl mt-3">{data.message}</p>
      </div>
    );
  }, [data, loading, subtotal, tax, total]);

  const tableLabel = data.order?.table?.tableNumber ? `Table ${data.order.table.tableNumber}` : "Store Name";

  return (
    <div className="min-h-screen bg-[#1f2329] text-white p-6 md:p-10">
      <div className="mx-auto max-w-[1500px] border border-slate-600 bg-[#252a31] min-h-[78vh] flex">
        <aside className="w-[280px] border-r border-slate-600 p-6 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center rounded border border-rose-300 px-3 py-1 text-rose-300 text-sm">Logo</div>
            <div className="mt-20 text-3xl text-slate-200">Welcome to</div>
            <div className="text-3xl text-slate-200">'{tableLabel}'</div>
          </div>
          <div className="text-slate-300 text-xl">Powered by Odoo</div>
        </aside>

        <main className="flex-1 grid place-items-center p-6 md:p-12">
          {rightPanel}
        </main>
      </div>
    </div>
  );
}
