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
    <>
      <div className="fixed top-0 left-0 w-full h-full opacity-[0.025] pointer-events-none z-[999]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />
      <main className="flex min-h-screen bg-[#0d0d0b]">
        {/* Left Side: Immersive Imagery */}
        <section className="hidden lg:flex w-7/12 relative overflow-hidden bg-surface-container-lowest">
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-transparent to-[#0D0D0B]" />
          <div className="absolute inset-0 z-10 bg-[#0D0D0B]/30" />
          <img alt="Luxury dark cafe interior" className="absolute inset-0 w-full h-full object-cover scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjt-w7vMirb3__QARtMZSEIIBYQw2Uzey8RA1XuWE5-grEo0YkIkeunIGNMjKxRq7jLLScywv6QDt4T6IiyM8lirHeQdOmF21pZK4UMDxYVMEqyxBVgrhrOXIyWbtZumxTutahwmkRIynL4aoLpjxvOR7e_B5UnBXij-aw7DVeS4uFOsu3lyJJoQuc1Ie2dnwkSpEmH7HukypCsAZmMN4DIyZ2Ecd2xnUjNgmd4IJ9vH-41ALQ3oWH_99W0kbtW2CwZU77TgCZj9o" />
          
          <div className="relative z-20 flex flex-col justify-end h-full p-20 max-w-2xl">
            <div className="mb-6 h-px w-24 bg-primary-container/40" />
            <h2 className="font-serif italic text-primary text-5xl tracking-tight leading-tight mb-4">
              The Art of Service
            </h2>
            <p className="font-sans text-on-surface-variant text-lg leading-relaxed opacity-80">
              Where precision meets passion. Access your atelier's terminal and orchestrate the perfect morning rush with effortless grace.
            </p>
          </div>
        </section>

        {/* Right Side: Login Form */}
        <section className="w-full lg:w-5/12 flex flex-col justify-center items-center px-8 lg:px-24 bg-[#0D0D0B] z-30">
          <div className="w-full max-w-md">
            <header className="mb-12 text-center lg:text-left flex flex-col items-center lg:items-start gap-4">
              <Link href="/">
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity duration-200">
                  <div className="w-10 h-10 bg-[#e8a838] rounded-xl flex items-center justify-center shadow-lg shadow-[#e8a838]/30">
                    <Coffee size={20} className="text-white" />
                  </div>
                  <h1 className="font-serif italic text-primary text-4xl tracking-tight">Odoo Cafe</h1>
                </div>
              </Link>
              <p className="font-sans text-on-surface-variant/70 text-base uppercase tracking-[0.2em] font-light">Welcome back, artisan.</p>
            </header>

            <div className="space-y-8">
              <div className="space-y-6">
                {/* Email Field */}
                <div className="group relative">
                  <label className="block font-label text-[11px] uppercase tracking-widest text-on-tertiary-fixed mb-2 opacity-60 group-focus-within:text-primary transition-colors">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={20} />
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                      className={`w-full bg-transparent border-0 border-b ${errors.email ? 'border-red-500' : 'border-outline-variant'} py-3 pl-8 text-on-surface font-sans placeholder:text-on-surface-variant/20 focus:ring-0 focus:border-primary transition-all duration-300 outline-none`} 
                      placeholder="artisan@odoocafe.com" 
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-[10px] uppercase font-bold mt-1">{errors.email}</p>}
                </div>

                {/* Password Field */}
                <div className="group relative">
                  <div className="flex justify-between items-end mb-2">
                    <label className="block font-label text-[11px] uppercase tracking-widest text-on-tertiary-fixed opacity-60 group-focus-within:text-primary transition-colors">
                      Password
                    </label>
                    <a className="font-label text-[10px] uppercase tracking-widest text-primary/60 hover:text-primary transition-colors" href="#">Forgot?</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={20} />
                    <input 
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      className={`w-full bg-transparent border-0 border-b ${errors.password ? 'border-red-500' : 'border-outline-variant'} py-3 pl-8 text-on-surface font-sans placeholder:text-on-surface-variant/20 focus:ring-0 focus:border-primary transition-all duration-300 outline-none`} 
                      placeholder="••••••••" 
                    />
                    <button onClick={() => setShowPass(!showPass)} type="button" className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-primary">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-[10px] uppercase font-bold mt-1">{errors.password}</p>}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full py-4 rounded-xl text-on-primary font-sans font-semibold tracking-wide transition-all active:scale-[0.98] shadow-2xl disabled:opacity-70"
                  style={{ background: "linear-gradient(135deg, #E8A838 0%, #be8623 100%)", boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.15)" }}
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <button className="flex items-center justify-center gap-3 py-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-all group">
                  <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/80 group-hover:text-primary">Biometric</span>
                </button>
                <button className="flex items-center justify-center gap-3 py-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-all group">
                  <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/80 group-hover:text-primary">Staff Card</span>
                </button>
              </div>
            </div>

            <footer className="mt-16 text-center lg:text-left">
              <p className="font-sans text-on-surface-variant/40 text-sm">
                Don't have an account? 
                <Link className="text-primary hover:text-secondary-container transition-colors ml-2 font-semibold underline underline-offset-8 decoration-primary/20 hover:decoration-primary" href="/signup">
                  Sign Up
                </Link>
              </p>
            </footer>
          </div>
        </section>
      </main>

      <style jsx global>{`
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Sora', sans-serif; }
        .font-label { font-family: 'Space Grotesk', sans-serif; }
      `}</style>
    </>
  );
}
