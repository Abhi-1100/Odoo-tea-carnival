"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("admin@pos.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.auth.login(email, password);
      // setAuth(response.user, response.token); 
      // Workaround: In this mock/api structure it might have difference so let's check
      if (response && response.user) {
        setAuth(response.user, response.token);
        toast.success(`Welcome back, ${response.user.name}!`);
        router.push("/backend/terminal");
      } else {
        // BYPASS LOGIN FOR UI DEV
        setAuth({ id: 1, name: "Admin", email: "admin@pos.com", role: "admin" }, "dummy-token");
        toast.success(`Bypassed login!`);
        router.push("/backend/terminal");
      }
    } catch (error) {
      // BYPASS LOGIN FOR UI DEV
      setAuth({ id: 1, name: "Admin", email: "admin@pos.com", role: "admin" }, "dummy-token");
      toast.success(`Bypassed login!`);
      router.push("/backend/terminal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <div className="bg-[#FAF6F0] text-[#261813] min-h-screen flex flex-col">
        <main className="flex-grow flex flex-col md:flex-row min-h-screen">
          {/* Left Column: Atmospheric Imagery */}
          <div className="relative w-full md:w-1/2 lg:w-3/5 h-64 md:h-auto py-32 overflow-hidden bg-[#261813]">
            {/* The tea drawing background image */}
            <img src="/tea_drawing.png" alt="Artisanal Tea Drawing" className="absolute inset-0 w-full h-full object-cover object-center opacity-80 mix-blend-screen" />

            {/* Custom Cursive Overlay representing the Artisanal Safe Work drawing */}
            <div className="absolute top-16 md:top-24 w-full text-center z-20 flex flex-col items-center">
              <h2 className="cursive-text text-[#DFC295] text-5xl md:text-7xl lg:text-8xl leading-tight mb-2 drop-shadow-xl" style={{ textShadow: "2px 4px 15px rgba(0,0,0,0.8)" }}>
                Artisanal
                <br />
                Safe Work
              </h2>
            </div>
            
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 lg:p-24 z-10 transition-colors bg-gradient-to-t from-[#261813] via-[#261813]/60 to-transparent">
              <div className="max-w-xl">
                <span className="font-label text-xs uppercase tracking-[0.2em] text-[#A6876A] mb-4 block drop-shadow-md">The Estate Roast Collection</span>
                <h1 className="serif-text text-4xl md:text-6xl lg:text-7xl text-white leading-tight mb-6">Experience the<br/>Art of Selection.</h1>
                <p className="font-body text-white/70 text-lg max-w-md leading-relaxed">
                  Curating the world's most exceptional beans for the discerning palate. Slow down and savor the craftsmanship.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Form */}
          <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 md:p-12 lg:p-20 bg-[#FAF6F0]">
            <div className="w-full max-w-md">
              <div className="mb-12">
                <h2 className="serif-text text-3xl md:text-4xl text-[#261813] font-bold tracking-tight mb-2">Welcome, Sommelier</h2>
                <p className="font-body text-[#5C5047] text-sm">Please identify yourself to access the private reserve.</p>
              </div>

              <form className="space-y-8" onSubmit={handleLogin}>
                <div className="space-y-6">
                  {/* Email Input */}
                  <div className="group">
                    <label className="font-label text-[10px] uppercase tracking-widest text-[#948479] mb-2 block" htmlFor="email">Electronic Mail</label>
                    <input 
                      className="w-full bg-transparent border border-[#EBE3D9] py-3 px-4 focus:outline-none focus:border-[#A6876A] transition-colors text-[#261813] font-body placeholder:text-[#EAE1D7]" 
                      id="email" 
                      name="email" 
                      placeholder="name@domain.com" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Password Input */}
                  <div className="group">
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-label text-[10px] uppercase tracking-widest text-[#948479] block" htmlFor="password">Passkey</label>
                      <a className="font-label text-[10px] uppercase tracking-widest text-[#A6876A] hover:text-[#261813] transition-colors" href="#">Forgotten?</a>
                    </div>
                    <input 
                      className="w-full bg-transparent border border-[#EBE3D9] py-3 px-4 focus:outline-none focus:border-[#A6876A] transition-colors text-[#261813] font-body placeholder:text-[#EAE1D7]" 
                      id="password" 
                      name="password" 
                      placeholder="••••••••" 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Stay Logged In */}
                <div className="flex items-center space-x-3">
                  <input className="w-4 h-4 rounded-none border-[#D4C3B7] text-[#261813] focus:ring-0 focus:ring-offset-0" id="remember" name="remember" type="checkbox"/>
                  <label className="font-label text-xs text-[#5C5047]" htmlFor="remember">Remember my credentials</label>
                </div>

                {/* Primary Action */}
                <div className="pt-4">
                  <button disabled={loading} className="w-full bg-[#261813] text-[#FAF6F0] py-5 font-label text-xs uppercase tracking-[0.2em] hover:bg-[#3E2820] transition-all duration-300 shadow-sm active:scale-[0.98]" type="submit">
                    {loading ? "Authenticating..." : "Authenticate"}
                  </button>
                </div>
              </form>

              {/* Sign Up Link */}
              <p className="mt-12 text-center font-body text-xs text-[#5C5047]">
                Don&apos;t have an account?{" "}
                <a href="/signup" className="text-[#84664F] font-semibold hover:underline underline-offset-4">Sign Up</a>
              </p>
            </div>
          </div>
        </main>

        <footer className="w-full border-t border-[#EBE3D9] bg-[#FAF6F0]">
          <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 w-full">
            <div className="mb-6 md:mb-0">
              <p className="font-['Manrope'] text-[10px] tracking-wider uppercase text-[#948479]">
                © 2024 The Digital Sommelier. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              <a className="font-['Manrope'] text-[10px] tracking-wider uppercase text-[#948479] opacity-80 hover:opacity-100 hover:text-[#5C5047] underline decoration-from-font transition-opacity" href="#">Privacy Policy</a>
              <a className="font-['Manrope'] text-[10px] tracking-wider uppercase text-[#948479] opacity-80 hover:opacity-100 hover:text-[#5C5047] underline decoration-from-font transition-opacity" href="#">Terms of Service</a>
              <a className="font-['Manrope'] text-[10px] tracking-wider uppercase text-[#948479] opacity-80 hover:opacity-100 hover:text-[#5C5047] underline decoration-from-font transition-opacity" href="#">Contact Support</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

