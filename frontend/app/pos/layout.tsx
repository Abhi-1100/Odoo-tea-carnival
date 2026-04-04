"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, RefreshCw, X, LayoutGrid, Monitor } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Toaster } from "react-hot-toast";

export default function POSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFloor = pathname === "/pos";
  const isRegister = pathname.includes("/order") || pathname.includes("/payment");

  return (
    <div className="flex flex-col h-screen bg-brand-bg overflow-hidden">
      {/* Top Nav */}
      <header className="flex items-center justify-between px-6 py-3 bg-brand-card border-b border-brand-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shadow-lg shadow-brand-primary/30">
            <Coffee size={15} className="text-white" />
          </div>
          <span className="text-white font-bold text-sm hidden sm:block">Odoo Cafe</span>
          {/* Tabs */}
          <div className="flex gap-1 ml-4">
            <Link href="/pos" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isFloor && !isRegister ? "bg-brand-primary text-white" : "text-brand-muted hover:text-white hover:bg-brand-bg"}`}>
              <LayoutGrid size={14} /> Table
            </Link>
            <Link href="/pos/order/1" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isRegister ? "bg-brand-primary text-white" : "text-brand-muted hover:text-white hover:bg-brand-bg"}`}>
              <Monitor size={14} /> Register
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" icon={<RefreshCw size={14} />} onClick={() => window.location.reload()}>Reload</Button>
          <Link href="/backend/terminal"><Button size="sm" variant="danger" icon={<X size={14} />}>Close</Button></Link>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
