"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Coffee, Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("admin@pos.com");
  const [password, setPassword] = useState("admin123");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Min 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const response = await api.auth.login(email, password);
      setAuth(response.user, response.token);
      toast.success(`Welcome back, ${response.user.name}!`, {
        style: { background: '#161614', color: '#e8a838', border: '1px solid #e8a83833' }
      });
      router.replace("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0b] flex items-center justify-center p-6 relative overflow-hidden noise-grain">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#e8a838]/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#e8a838]/5 rounded-full blur-[120px] animate-pulse delay-1000" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo & Branding */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-[#e8a838]/20 rounded-[24px] blur-xl animate-pulse" />
            <div className="relative w-20 h-20 bg-[#161614] border border-[#e8a838]/30 rounded-[24px] flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-500 shadow-2xl shadow-[#e8a838]/10">
              <Coffee size={36} className="text-[#e8a838]" />
            </div>
          </div>
          <h1 className="text-5xl font-serif text-[#e8a838] tracking-tight mb-3">Odoo POS Cafe</h1>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#e8a838]/50 to-transparent mx-auto mb-4" />
          <p className="text-[#f0dfdb]/40 font-sans uppercase tracking-[6px] text-[10px]">The Nocturnal Atelier</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#161614] rounded-[40px] p-10 md:p-14 border border-[#e8a838]/10 shadow-[0_32px_64px_-12px_rgba(232,168,56,0.08)] relative group overflow-hidden">
          {/* Subtle Inner Glow */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#e8a838]/20 to-transparent" />
          
          <div className="space-y-10 relative z-10">
            {/* Email Field */}
            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-[#e8a838]/60 uppercase tracking-[4px] ml-1">Atelier Identifier</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                  placeholder="name@atelier.com"
                  className={`w-full bg-transparent border-b-2 py-4 px-1 text-lg font-sans placeholder:text-[#f0dfdb]/10 focus:outline-none transition-all duration-500 ${
                    errors.email ? "border-red-500/50" : "border-[#e8a838]/20 focus:border-[#e8a838] focus:shadow-[0_8px_16px_-8px_rgba(232,168,56,0.2)]"
                  }`}
                />
                <Mail size={18} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#e8a838]/20" />
              </div>
              {errors.email && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mt-2">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="block text-[10px] font-bold text-[#e8a838]/60 uppercase tracking-[4px] ml-1">Access Protocol</label>
                <Link href="#" className="text-[10px] font-bold text-[#e8a838]/40 hover:text-[#e8a838] uppercase tracking-[2px] transition-colors">Forgotten?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                  placeholder="••••••••"
                  className={`w-full bg-transparent border-b-2 py-4 px-1 text-lg font-mono tracking-widest placeholder:text-[#f0dfdb]/10 focus:outline-none transition-all duration-500 ${
                    errors.password ? "border-red-500/50" : "border-[#e8a838]/20 focus:border-[#e8a838] focus:shadow-[0_8px_16px_-8px_rgba(232,168,56,0.2)]"
                  }`}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <button 
                  onClick={() => setShowPass(!showPass)} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#e8a838]/20 hover:text-[#e8a838] transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mt-2">{errors.password}</p>}
            </div>

            {/* Sign In Button */}
            <button 
              onClick={handleLogin} 
              disabled={loading}
              className="w-full bg-[#e8a838] text-[#0d0d0b] py-6 rounded-2xl font-bold uppercase tracking-[4px] hover:bg-[#f2ca50] transition-all transform active:scale-[0.98] shadow-xl shadow-[#e8a838]/10 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#0d0d0b]/30 border-t-[#0d0d0b] rounded-full animate-spin" />
                  Granting Access...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  Enter Atelier
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </div>
              )}
            </button>
          </div>

          <p className="text-center text-[#f0dfdb]/20 text-[10px] uppercase tracking-[4px] mt-12">
            Limited to Authorized Sommeliers & Personnel
          </p>
        </div>

        {/* Demo Info */}
        <div className="mt-12 text-center space-y-4">
          <p className="text-[#f0dfdb]/30 text-sm">
            Interested in joining our elite staff?{" "}
            <Link href="/signup" className="text-[#e8a838] hover:underline font-bold">Request Access</Link>
          </p>
          <div className="inline-block px-6 py-2 bg-[#161614] border border-[#e8a838]/10 rounded-full">
             <p className="text-[#e8a838]/40 text-[10px] font-mono tracking-widest uppercase">
               Trial: admin@pos.com / admin123
             </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>
    </div>
  );
}
