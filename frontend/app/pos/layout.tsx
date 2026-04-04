"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Coffee, RefreshCw, X, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Toaster } from "react-hot-toast";

export default function POSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen bg-brand-bg overflow-hidden">
      {/* Top Nav */}
      <header className="shrink-0 border-b border-brand-border bg-gradient-to-r from-[#5a3c11] via-[#4a3d36] to-[#224034] text-white">
        <div className="flex items-center justify-between px-6 py-4 gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/30 shrink-0">
              <Coffee size={18} className="text-white" />
            </div>

            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs font-medium tracking-[0.18em] text-white/80 uppercase whitespace-nowrap">Point of Sale</span>

              <div className="flex items-center gap-2 min-w-0">
                <button className="flex items-center gap-2 min-w-0 px-1 py-0.5 border-b border-white/40 hover:border-white/70 transition-colors">
                  <span className="text-3xl font-semibold leading-none whitespace-nowrap">Odoo Cafe</span>
                  <ChevronDown size={16} className="text-white/90 shrink-0" />
                </button>

                <button className="h-10 px-4 rounded-lg border border-white/25 bg-white/10 hover:bg-white/15 text-white text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap">
                  <Plus size={16} />
                  New
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" icon={<RotateCcw size={14} />} onClick={() => window.location.reload()} className="bg-white/10 hover:bg-white/15">
              Reload
            </Button>
            <Link href="/backend/terminal">
              <Button size="sm" variant="danger" icon={<X size={14} />} className="bg-red-500/90 hover:bg-red-500">
                Close
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
