"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function POSHome() {
  const router = useRouter();
  const { token, isAuthenticated, user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [newTerminalName, setNewTerminalName] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push("/login");
    }
  }, [isAuthenticated, token, router]);

  const handleLogout = () => {
    useAuthStore.getState().clearAuth?.();
    router.push("/login");
  };

  return (
    <>
      <style>{`
        body {
          background-color: #FDF9F0;
          background-image: radial-gradient(circle at 2px 2px, rgba(62, 39, 35, 0.03) 1px, transparent 0);
          background-size: 32px 32px;
          font-family: 'Manrope', sans-serif;
        }
        .glass-dropdown {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
        }
        .font-headline, h1, h2, h3, h4 {
          font-family: 'Newsreader', serif;
        }
        .font-data {
          font-family: 'IBM Plex Mono', monospace;
        }
      `}</style>

      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-[#271310] shadow-lg h-20 flex justify-between items-center px-8">
        <div className="flex items-center gap-12">
          <span className="text-2xl font-headline font-bold text-[#FDF9F0]">Odoo POS</span>
          <nav className="hidden md:flex gap-8 h-full items-center">
            {/* Orders */}
            <div className="relative group h-full flex items-center">
              <button className="text-[#D4A373] border-b-2 border-[#D4A373] font-semibold pb-1 flex items-center gap-1 transition-all duration-300">
                Orders
              </button>
              <div className="absolute top-20 left-0 w-48 glass-dropdown p-4 rounded-b-xl border border-[#271310]/10 shadow-xl hidden group-hover:block">
                <ul className="space-y-3">
                  <li><a className="text-[#271310]/70 hover:text-[#271310] font-medium text-sm block" href="#">Orders</a></li>
                  <li><a className="text-[#271310]/70 hover:text-[#271310] font-medium text-sm block" href="#">Payment</a></li>
                  <li><a className="text-[#271310]/70 hover:text-[#271310] font-medium text-sm block" href="#">Customer</a></li>
                </ul>
              </div>
            </div>
            {/* Products */}
            <div className="relative group h-full flex items-center">
              <button className="text-[#FDF9F0]/70 hover:text-[#D4A373] hover:border-b-2 hover:border-[#D4A373] transition-all duration-300 pb-1">
                Products
              </button>
              <div className="absolute top-20 left-0 w-48 glass-dropdown p-4 rounded-b-xl border border-[#271310]/10 shadow-xl hidden group-hover:block">
                <ul className="space-y-3">
                  <li><a className="text-[#271310]/70 hover:text-[#271310] font-medium text-sm block" href="#">Products</a></li>
                  <li><a className="text-[#271310]/70 hover:text-[#271310] font-medium text-sm block" href="#">Category</a></li>
                </ul>
              </div>
            </div>
            {/* Reporting */}
            <div className="relative group h-full flex items-center">
              <button className="text-[#FDF9F0]/70 hover:text-[#D4A373] hover:border-b-2 hover:border-[#D4A373] transition-all duration-300 pb-1">
                Reporting
              </button>
              <div className="absolute top-20 left-0 w-48 glass-dropdown p-4 rounded-b-xl border border-[#271310]/10 shadow-xl hidden group-hover:block">
                <ul className="space-y-3">
                  <li><a className="text-[#271310]/70 hover:text-[#271310] font-medium text-sm block" href="#">Dashboard</a></li>
                </ul>
              </div>
            </div>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <button className="material-symbols-outlined text-[#FDF9F0]/70 hover:text-[#D4A373] transition-all">notifications</button>
          <button className="material-symbols-outlined text-[#FDF9F0]/70 hover:text-[#D4A373] transition-all">settings</button>
          <div onClick={handleLogout} className="flex items-center gap-3 bg-[#3E2723] py-1.5 px-4 rounded-full border border-white/10 cursor-pointer hover:bg-[#271310] transition-colors">
            <span className="text-sm font-medium text-[#FDF9F0]">{user?.name || "Admin"}</span>
            <span className="material-symbols-outlined text-[#D4A373]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto space-y-16 bg-[#FDF9F0] min-h-screen text-[#271310]">

        {/* Terminal Cards */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
          {/* Animated presence badges */}
          <div className="absolute -top-12 left-10 animate-pulse bg-green-100 text-green-800 border border-green-200 px-4 py-1 rounded-full text-xs font-semibold z-10">Agile Ape</div>
          <div className="absolute top-40 -left-20 animate-pulse bg-blue-100 text-blue-800 border border-blue-200 px-4 py-1 rounded-full text-xs font-semibold z-10">Active Hawk</div>
          <div className="absolute -bottom-8 left-1/4 animate-pulse bg-red-100 text-red-800 border border-red-200 px-4 py-1 rounded-full text-xs font-semibold z-10">Aditya</div>
          <div className="absolute top-0 right-1/4 animate-pulse bg-orange-100 text-orange-800 border border-orange-200 px-4 py-1 rounded-full text-xs font-semibold z-10">Celebrated Pigeon</div>
          <div className="absolute bottom-10 right-10 animate-pulse bg-purple-100 text-purple-800 border border-purple-200 px-4 py-1 rounded-full text-xs font-semibold z-10">Innocent Flamingo</div>

          {/* Terminal Card 1 */}
          <div className="group bg-white border border-[#271310]/5 rounded-xl p-8 shadow-[0_10px_40px_rgba(39,19,16,0.04)] hover:-translate-y-1 transition-all duration-300 hover:border-[#D4A373]/30 hover:shadow-[0_20px_50px_rgba(39,19,16,0.08)] relative">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-3xl font-headline font-bold text-[#271310] mb-1">Odoo Cafe - Main</h2>
                <p className="text-[#271310]/50 text-xs font-label uppercase tracking-widest font-semibold">Atelier Branch</p>
              </div>
              <div className="relative group/menu">
                <button className="material-symbols-outlined text-[#271310]/30 hover:text-[#3E2723] p-2">more_vert</button>
                <div className="absolute right-0 top-10 w-48 glass-dropdown rounded-xl border border-[#271310]/10 hidden group-hover/menu:block z-20 py-2 shadow-xl">
                  <a className="block px-4 py-2 text-sm text-[#271310]/80 hover:bg-[#D4A373]/10 hover:text-[#3E2723]" href="#">Setting</a>
                  <a className="block px-4 py-2 text-sm text-[#271310]/80 hover:bg-[#D4A373]/10 hover:text-[#3E2723]" href="#">Kitchen Display</a>
                  <a className="block px-4 py-2 text-sm text-[#271310]/80 hover:bg-[#D4A373]/10 hover:text-[#3E2723]" href="#">Customer Display</a>
                </div>
              </div>
            </div>
            <div className="space-y-4 mb-12 font-data text-sm">
              <div className="flex justify-between border-b border-[#271310]/10 pb-3">
                <span className="text-[#271310]/50">Last open</span>
                <span className="text-[#271310] font-medium">01/01/2026</span>
              </div>
              <div className="flex justify-between border-b border-[#271310]/10 pb-3">
                <span className="text-[#271310]/50">Last Sell</span>
                <span className="text-[#3E2723] font-bold text-lg">$5,240.00</span>
              </div>
            </div>
            <a href="/pos" className="inline-block bg-[#3E2723] text-[#FDF9F0] font-bold px-10 py-3.5 rounded-full hover:bg-[#271310] hover:scale-105 active:scale-95 transition-all shadow-[0_4px_25px_rgba(39,19,16,0.2)]">
              Open Session
            </a>
          </div>

          {/* Terminal Card 2 */}
          <div className="group bg-white border border-[#271310]/5 rounded-xl p-8 shadow-[0_10px_40px_rgba(39,19,16,0.04)] hover:-translate-y-1 transition-all duration-300 hover:border-[#D4A373]/30 hover:shadow-[0_20px_50px_rgba(39,19,16,0.08)] relative">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-3xl font-headline font-bold text-[#271310] mb-1">Odoo Cafe - Express</h2>
                <p className="text-[#271310]/50 text-xs font-label uppercase tracking-widest font-semibold">Takeaway Point</p>
              </div>
              <div className="relative group/menu">
                <button className="material-symbols-outlined text-[#271310]/30 hover:text-[#3E2723] p-2">more_vert</button>
                <div className="absolute right-0 top-10 w-48 glass-dropdown rounded-xl border border-[#271310]/10 hidden group-hover/menu:block z-20 py-2 shadow-xl">
                  <a className="block px-4 py-2 text-sm text-[#271310]/80 hover:bg-[#D4A373]/10 hover:text-[#3E2723]" href="#">Setting</a>
                  <a className="block px-4 py-2 text-sm text-[#271310]/80 hover:bg-[#D4A373]/10 hover:text-[#3E2723]" href="#">Kitchen Display</a>
                  <a className="block px-4 py-2 text-sm text-[#271310]/80 hover:bg-[#D4A373]/10 hover:text-[#3E2723]" href="#">Customer Display</a>
                </div>
              </div>
            </div>
            <div className="space-y-4 mb-12 font-data text-sm">
              <div className="flex justify-between border-b border-[#271310]/10 pb-3">
                <span className="text-[#271310]/50">Last open</span>
                <span className="text-[#271310] font-medium">02/01/2026</span>
              </div>
              <div className="flex justify-between border-b border-[#271310]/10 pb-3">
                <span className="text-[#271310]/50">Last Sell</span>
                <span className="text-[#3E2723] font-bold text-lg">$2,810.50</span>
              </div>
            </div>
            <a href="/pos" className="inline-block bg-[#3E2723] text-[#FDF9F0] font-bold px-10 py-3.5 rounded-full hover:bg-[#271310] hover:scale-105 active:scale-95 transition-all shadow-[0_4px_25px_rgba(39,19,16,0.2)]">
              Open Session
            </a>
          </div>
        </section>

        {/* Point of Sale Section */}
        <section className="space-y-8">
          <div className="flex justify-between items-center bg-[#271310]/5 p-6 rounded-2xl border border-[#271310]/10">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-headline font-bold text-[#271310]">Point of Sale</h3>
              <span className="bg-[#271310]/10 text-[#271310]/60 text-xs px-4 py-1 rounded-full border border-[#271310]/10 font-bold tracking-wide">Main Terminal #01</span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="text-[#3E2723] font-bold flex items-center gap-2 hover:translate-x-1 transition-all px-4 py-2 hover:bg-[#3E2723]/5 rounded-full"
            >
              <span className="material-symbols-outlined">add</span>
              New
            </button>
          </div>

          {/* Payment Methods */}
          <div className="bg-white p-10 rounded-2xl border border-[#271310]/5 shadow-sm">
            <h4 className="text-xl font-headline font-bold text-[#271310] mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#3E2723]">payments</span>
              Payment Methods
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Left Column */}
              <div className="space-y-6">
                <label className="flex items-center gap-4 group cursor-pointer">
                  <input defaultChecked className="w-6 h-6 rounded border-[#271310]/20 bg-[#FDF9F0] text-[#3E2723] focus:ring-[#3E2723]" type="checkbox"/>
                  <span className="text-[#271310]/80 font-medium group-hover:text-[#3E2723] transition-colors">Cash</span>
                </label>
                <div className="space-y-4">
                  <label className="flex items-center gap-4 group cursor-pointer">
                    <input defaultChecked className="w-6 h-6 rounded border-[#271310]/20 bg-[#FDF9F0] text-[#3E2723] focus:ring-[#3E2723]" type="checkbox"/>
                    <span className="text-[#271310]/80 font-medium group-hover:text-[#3E2723] transition-colors">QR Payment (UPI)</span>
                  </label>
                  <div className="pl-10">
                    <div className="relative">
                      <input className="w-full bg-[#FDF9F0]/50 border-b-2 border-[#271310]/10 focus:border-[#3E2723] focus:ring-0 text-[#271310] font-data py-3 transition-all outline-none" placeholder="123@ybl.com" type="text"/>
                      <span className="absolute right-4 top-3 text-[#271310]/40 text-[10px] uppercase font-bold tracking-tighter">UPI ID</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Right Column */}
              <div className="space-y-6">
                <label className="flex items-center gap-4 group cursor-pointer">
                  <input className="w-6 h-6 rounded border-[#271310]/20 bg-[#FDF9F0] text-[#3E2723] focus:ring-[#3E2723]" type="checkbox"/>
                  <span className="text-[#271310]/80 font-medium group-hover:text-[#3E2723] transition-colors">Digital (Bank)</span>
                </label>
                <label className="flex items-center gap-4 group cursor-pointer">
                  <input defaultChecked className="w-6 h-6 rounded border-[#271310]/20 bg-[#FDF9F0] text-[#3E2723] focus:ring-[#3E2723]" type="checkbox"/>
                  <span className="text-[#271310]/80 font-medium group-hover:text-[#3E2723] transition-colors">Digital (Card)</span>
                </label>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Background Decoration */}
      <div className="fixed bottom-0 right-0 -z-10 opacity-20 pointer-events-none">
        <img className="w-[600px] h-auto sepia mix-blend-multiply" alt="atmospheric cafe interior" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcyr4vJXxEdFGx6zlkYJNkLs2ukkJPd4NPjidfD5u7JfzvhlcGiDLRTjgG9MHX18sDw0J58ArIQX0hrP5STAaGUoIsshc1H_gkCFcvlaiHiwkoV3iVIsFASEqN4e19pf9gOLn9d9fgYM3j4hyuRfBOiE2iFIgax-ccA2xkODZzlXDSG-5L4GaobPOdynb2nF76UI_H2_Wrgr2a3-_kQOG32dlnBFN8XtEgl5K0c3Gg7pdaDe24Z9-fVJ797pPXopasKCLpEm8iYKs"/>
      </div>

      {/* Modal: New POS Terminal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#271310]/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white w-full max-w-md p-10 rounded-2xl border border-[#271310]/10 shadow-2xl">
            <h3 className="text-3xl font-headline font-bold text-[#271310] mb-8">Create Terminal</h3>
            <div className="space-y-10">
              <div className="relative">
                <label className="block text-xs font-bold text-[#271310]/40 uppercase tracking-widest mb-2">Terminal Name</label>
                <input
                  className="w-full bg-transparent border-b-2 border-[#271310]/10 focus:border-[#3E2723] focus:ring-0 text-2xl text-[#271310] font-headline placeholder-[#271310]/10 py-2 transition-all outline-none"
                  placeholder="e.g. Terrace Bar"
                  type="text"
                  value={newTerminalName}
                  onChange={(e) => setNewTerminalName(e.target.value)}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => { setShowModal(false); setNewTerminalName(""); }}
                  className="flex-1 bg-[#3E2723] text-[#FDF9F0] font-bold py-4 rounded-full hover:bg-[#271310] hover:shadow-xl transition-all"
                >
                  Save
                </button>
                <button
                  onClick={() => { setShowModal(false); setNewTerminalName(""); }}
                  className="flex-1 border border-[#271310]/20 text-[#271310]/60 font-bold py-4 rounded-full hover:bg-[#FDF9F0] transition-all"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
