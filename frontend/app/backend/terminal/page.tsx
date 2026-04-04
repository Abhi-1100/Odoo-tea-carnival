"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

interface SessionUser {
  id: number;
  name: string;
  email: string;
}

interface Session {
  id: number;
  terminalName: string;
  status: "open" | "closed";
  openingCash: number | null;
  closingCash: number | null;
  totalSales: number | null;
  openedAt: string;
  closedAt: string | null;
  createdAt: string;
  notes: string | null;
  user: SessionUser;
}

export default function TerminalPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [terminalName, setTerminalName] = useState("");
  const [openingCash, setOpeningCash] = useState("");

  const fetchSessions = useCallback(async () => {
    if (!token) return;
    try {
      const [allRes, activeRes] = await Promise.all([
        api.sessions.getAll(token),
        api.sessions.getActive(token),
      ]);
      setSessions(allRes.data as Session[]);
      setActiveSession(activeRes.data as Session | null);
    } catch (error: unknown) {
      // Ignored for UI
    }
  }, [token]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleOpenSession = async () => {
    if (!token) return;
    try {
      await api.sessions.open({ terminalName, openingCash: parseFloat(openingCash) || 0 }, token);
      toast.success("Session opened successfully!");
      setOpenModal(false);
      fetchSessions();
      router.push("/pos/floor");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to open session");
    }
  };

  const fmtDate = (dt: string | null) => {
    if (!dt) return "-";
    return new Date(dt).toLocaleDateString("en-IN");
  };

  return (
    <div className="min-h-screen bg-[#FDF9F0] text-[#271310] relative pb-20" style={{
      backgroundImage: "radial-gradient(circle at 2px 2px, rgba(62, 39, 35, 0.03) 1px, transparent 0)",
      backgroundSize: "32px 32px",
      fontFamily: "'Manrope', sans-serif"
    }}>
      <style>{`
        .font-headline { font-family: 'Newsreader', serif; }
        .font-data { font-family: 'IBM Plex Mono', monospace; }
        .glass-dropdown {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
        }
      `}</style>

      {/* TopNavBar */}
      <header className="w-full z-50 bg-[#271310] shadow-lg h-20 flex justify-between items-center px-8 relative">
        <div className="flex items-center gap-12">
          <span className="text-2xl font-headline font-bold text-[#FDF9F0]">Odoo POS</span>
          <nav className="hidden md:flex gap-8 h-full items-center">
            <div className="relative group h-full flex items-center">
              <button className="text-[#D4A373] border-b-2 border-[#D4A373] font-semibold pb-1 flex items-center gap-1 transition-all duration-300 h-20">
                Orders
              </button>
            </div>
            <div className="relative group h-full flex items-center">
              <button className="text-[#FDF9F0]/70 hover:text-[#D4A373] transition-all duration-300 pb-1 h-20">
                Products
              </button>
            </div>
            <div className="relative group h-full flex items-center">
              <button className="text-[#FDF9F0]/70 hover:text-[#D4A373] transition-all duration-300 pb-1 h-20">
                Reporting
              </button>
            </div>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <button className="material-symbols-outlined text-[#FDF9F0]/70 hover:text-[#D4A373] transition-all">notifications</button>
          <button className="material-symbols-outlined text-[#FDF9F0]/70 hover:text-[#D4A373] transition-all">settings</button>
          <div className="flex items-center gap-3 bg-[#3E2723] py-1.5 px-4 rounded-full border border-white/10">
            <span className="text-sm font-medium text-[#FDF9F0]">Aditya</span>
            <span className="material-symbols-outlined text-[#D4A373]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          </div>
        </div>
      </header>

      <main className="pt-16 px-8 max-w-7xl mx-auto space-y-16">
        
        {/* Terminals Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative mt-16">
          


          {/* Terminal Card 1 */}
          <div className="group bg-white border border-[#271310]/5 rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(39,19,16,0.04)] relative z-20">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-3xl font-headline font-bold text-[#271310] mb-1">Odoo Cafe - Main</h2>
                <p className="text-[#271310]/50 text-xs font-label uppercase tracking-widest font-semibold">Atelier Branch</p>
              </div>
              <button className="text-[#271310]/30 hover:text-[#3E2723] p-2 leading-none">
                <span className="material-symbols-outlined text-xl">more_vert</span>
              </button>
            </div>
            <div className="space-y-4 mb-12 font-data text-sm">
              <div className="flex justify-between border-b border-[#271310]/10 pb-3">
                <span className="text-[#271310]/50">Last open</span>
                <span className="text-[#271310] font-medium">{sessions.length > 0 ? fmtDate(sessions[0].openedAt) : "01/01/2026"}</span>
              </div>
              <div className="flex justify-between border-b border-[#271310]/10 pb-3">
                <span className="text-[#271310]/50">Last Sell</span>
                <span className="text-[#271310] font-bold text-lg">₹{sessions[0]?.totalSales?.toLocaleString() || "5,240.00"}</span>
              </div>
            </div>
            <button onClick={() => {setTerminalName("Odoo Cafe - Main"); setOpenModal(true);}} className="inline-flex bg-[#3E2723] text-[#FDF9F0] font-medium px-8 py-3 rounded-full hover:bg-[#271310] transition-colors">
              Open Session
            </button>
          </div>

          {/* Terminal Card 2 */}
          <div className="group bg-white border border-[#271310]/5 rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(39,19,16,0.04)] relative z-20">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-3xl font-headline font-bold text-[#271310] mb-1">Odoo Cafe - Express</h2>
                <p className="text-[#271310]/50 text-xs font-label uppercase tracking-widest font-semibold">Takeaway Point</p>
              </div>
              <button className="text-[#271310]/30 hover:text-[#3E2723] p-2 leading-none">
                 <span className="material-symbols-outlined text-xl">more_vert</span>
              </button>
            </div>
            <div className="space-y-4 mb-12 font-data text-sm">
              <div className="flex justify-between border-b border-[#271310]/10 pb-3">
                <span className="text-[#271310]/50">Last open</span>
                <span className="text-[#271310] font-medium">{sessions.length > 1 ? fmtDate(sessions[1].openedAt) : "02/01/2026"}</span>
              </div>
              <div className="flex justify-between border-b border-[#271310]/10 pb-3">
                <span className="text-[#271310]/50">Last Sell</span>
                <span className="text-[#271310] font-bold text-lg">₹{sessions[1]?.totalSales?.toLocaleString() || "2,810.50"}</span>
              </div>
            </div>
            <button onClick={() => {setTerminalName("Odoo Cafe - Express"); setOpenModal(true);}} className="inline-flex bg-[#3E2723] text-[#FDF9F0] font-medium px-8 py-3 rounded-full hover:bg-[#271310] transition-colors">
              Open Session
            </button>
          </div>

        </section>

        {/* Point of Sale Section */}
        <section className="space-y-8 relative z-20">
          <div className="flex justify-between items-center bg-[#271310]/5 p-6 rounded-2xl border border-[#271310]/10">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-headline font-bold text-[#271310]">Point of Sale</h3>
              <span className="bg-[#271310]/10 text-[#271310]/60 text-xs px-4 py-1.5 rounded-full font-semibold tracking-wide">Main Terminal #01</span>
            </div>
            <button className="text-[#271310]/80 font-medium flex items-center gap-2 hover:bg-[#271310]/5 px-4 py-2 rounded-lg transition-colors">
              <span className="material-symbols-outlined font-light">add</span>
              New
            </button>
          </div>

          <div className="bg-white p-10 rounded-[2rem] border border-[#271310]/5 shadow-sm">
            <h4 className="text-xl font-headline font-bold text-[#271310] mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined">payments</span>
              Payment Methods
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <label className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-6 h-6 rounded-full bg-[#3E2723] flex items-center justify-center text-brand-text">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  </div>
                  <span className="text-[#271310]/80 font-medium">Cash</span>
                </label>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-6 h-6 rounded-full bg-[#3E2723] flex items-center justify-center text-brand-text">
                      <span className="material-symbols-outlined text-sm font-bold">check</span>
                    </div>
                    <span className="text-[#271310]/80 font-medium">QR Payment (UPI)</span>
                  </label>
                  <div className="pl-10">
                    <div className="relative border border-[#271310]/10 p-4 rounded-lg bg-[#FDF9F0]/30 shadow-[inset_0_2px_10px_rgba(39,19,16,0.02)]">
                      <input className="w-full bg-transparent text-[#271310] font-data text-sm outline-none" placeholder="123@ybl.com" defaultValue="123@ybl.com" type="text" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#271310]/40 text-[9px] uppercase font-bold tracking-widest">UPI ID</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <label className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-6 h-6 rounded-full border-2 border-[#271310]/20 flex items-center justify-center">
                  </div>
                  <span className="text-[#271310]/80 font-medium">Digital (Bank)</span>
                </label>
                <label className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-6 h-6 rounded-full bg-[#3E2723] flex items-center justify-center text-brand-text">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  </div>
                  <span className="text-[#271310]/80 font-medium">Digital (Card)</span>
                </label>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Decorative background image removed */}

    </div>
  );
}
