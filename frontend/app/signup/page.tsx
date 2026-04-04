"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Coffee } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", restaurant: "", email: "", password: "", terms: false });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = "Required";
    if (!form.restaurant) e.restaurant = "Required";
    if (!form.email) e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Required";
    else if (form.password.length < 6) e.password = "Min 6 characters";
    if (!form.terms) e.terms = "You must agree to terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    toast.success("Account created! Welcome to the Atelier.", {
      style: { background: '#161614', color: '#e8a838', border: '1px solid #e8a83833' }
    });
    router.push("/login");
  };

  const setField = (k: keyof typeof form, val: any) => {
    setForm(p => ({ ...p, [k]: val }));
    setErrors(p => ({ ...p, [k]: "" }));
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full opacity-[0.025] pointer-events-none z-[9999]" style={{ backgroundImage: "url(\"https://lh3.googleusercontent.com/aida-public/AB6AXuDzqm6q8H2Q6YkWR_4ID8DOQIftC6iZzakUO3arO6vDsakydeVXLsv_0xFmfDBL0CTW682SzZgKnMRsdluQesbh6FBDkdwfFXnB39UwmnaOpxt4OIy6clRLbhHXgV7Y7D5wG4ij_w0CtOXSu1Aa69O3VJvnwqiqbpUjlpBRlVi6U4HeojAVYObAi_HztP091lKKjEC5Wh65yxx2WKOXt2ukLcHHSBwItU_XKoXKedf-Yyuami-1yfdXL0KM8hoxsFAkRoeaaEZlZQI\")" }} />
      <main className="min-h-screen flex flex-col md:flex-row bg-[#0D0D0B]">
        {/* Left Side */}
        <section className="hidden md:flex md:w-1/2 relative overflow-hidden h-screen bg-surface-container-lowest sticky top-0">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0D0D0B] z-10" />
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img alt="Elegant bistro interior" className="absolute inset-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4rufiCJ5se__zTCKTmyGiP_9s8dh0MDnu0iHnJ2VyICAOw65M2LjVqZLZdM7O6xldWaRmzPeKB7w5-gIP0pcXw-w_w4j5t1QAvlLc_Sygeg4g8QCGosOqPXd5TJs3bOoSnB-fRWZumD984tk9JjkE7c9Y3O3WNWC85imvtl1T1T0luQv25egjkQ6m93yVDIERu4b5S8DUg-WgVgj--65qMVEtdw2z6Tkw6NGgnKAXmUDarPFWsT4-a-RPt0qBDk9o6hVWlsDrhyI" />
          
          <div className="relative z-20 mt-auto p-16 max-w-2xl">
            <div className="inline-block px-4 py-1 mb-8 border border-primary/20 rounded-full bg-primary/5 backdrop-blur-md">
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">Established Excellence</span>
            </div>
            <h2 className="font-serif italic text-6xl text-primary leading-tight mb-6">The art of hospitality, digitized.</h2>
            <p className="font-sans text-lg text-on-surface/70 leading-relaxed max-w-md">
              Crafting moments of culinary perfection requires tools that move as silently as a master sommelier.
            </p>
          </div>
        </section>

        {/* Right Side */}
        <section className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-16 lg:p-24 bg-[#0D0D0B] z-20">
          <div className="w-full max-w-md">
            <header className="mb-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                  <Coffee size={20} className="text-white" />
                </div>
                <span className="font-serif italic text-3xl text-primary tracking-tight">Odoo Cafe</span>
              </div>
              <h1 className="font-serif text-5xl text-on-surface mb-3 tracking-tight">Join the Atelier</h1>
              <p className="font-sans text-on-surface/60 text-sm tracking-wide">Start your journey as a culinary curator.</p>
            </header>

            <form className="space-y-8" onSubmit={handleSignup}>
              {/* Form Fields */}
              <div className="space-y-6">
                <div className="relative group">
                  <label className="font-label text-[10px] uppercase tracking-widest text-primary/70 mb-2 block transition-colors group-focus-within:text-primary">Full Name</label>
                  <input value={form.name} onChange={(e) => setField("name", e.target.value)} type="text" placeholder="Julian Thorne" className={`w-full bg-surface-container-high border-0 border-b ${errors.name ? 'border-red-500' : 'border-outline-variant'} py-3 px-3 text-on-surface placeholder:text-on-surface/20 focus:ring-0 focus:border-primary focus:shadow-[0_0_15px_rgba(232,168,56,0.15)] transition-all outline-none`} />
                </div>
                
                <div className="relative group">
                  <label className="font-label text-[10px] uppercase tracking-widest text-primary/70 mb-2 block transition-colors group-focus-within:text-primary">Restaurant Name</label>
                  <input value={form.restaurant} onChange={(e) => setField("restaurant", e.target.value)} type="text" placeholder="Nocturnal Atelier" className={`w-full bg-surface-container-high border-0 border-b ${errors.restaurant ? 'border-red-500' : 'border-outline-variant'} py-3 px-3 text-on-surface placeholder:text-on-surface/20 focus:ring-0 focus:border-primary focus:shadow-[0_0_15px_rgba(232,168,56,0.15)] transition-all outline-none`} />
                </div>
                
                <div className="relative group">
                  <label className="font-label text-[10px] uppercase tracking-widest text-primary/70 mb-2 block transition-colors group-focus-within:text-primary">Email Address</label>
                  <input value={form.email} onChange={(e) => setField("email", e.target.value)} type="email" placeholder="curator@atelier.com" className={`w-full bg-surface-container-high border-0 border-b ${errors.email ? 'border-red-500' : 'border-outline-variant'} py-3 px-3 text-on-surface placeholder:text-on-surface/20 focus:ring-0 focus:border-primary focus:shadow-[0_0_15px_rgba(232,168,56,0.15)] transition-all outline-none`} />
                </div>
                
                <div className="relative group">
                  <label className="font-label text-[10px] uppercase tracking-widest text-primary/70 mb-2 block transition-colors group-focus-within:text-primary">Password</label>
                  <input value={form.password} onChange={(e) => setField("password", e.target.value)} type="password" placeholder="••••••••••••" className={`w-full bg-surface-container-high border-0 border-b ${errors.password ? 'border-red-500' : 'border-outline-variant'} py-3 px-3 text-on-surface placeholder:text-on-surface/20 focus:ring-0 focus:border-primary focus:shadow-[0_0_15px_rgba(232,168,56,0.15)] transition-all outline-none`} />
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start gap-3 py-2">
                <input checked={form.terms} onChange={(e) => setField("terms", e.target.checked)} id="terms" type="checkbox" className="mt-1 rounded-sm bg-surface-container-highest border-outline-variant text-primary focus:ring-offset-background" />
                <label htmlFor="terms" className={`text-xs leading-relaxed ${errors.terms ? 'text-red-400 font-bold' : 'text-on-surface/50'}`}>
                  I agree to the <span className="text-primary hover:underline cursor-pointer">Terms of Service</span> and <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>.
                </label>
              </div>

              <button disabled={loading} type="submit" className="w-full bg-primary hover:bg-primary-container text-on-primary font-sans font-semibold py-4 px-8 rounded-lg shadow-[0_4px_20px_rgba(232,168,56,0.15)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed">
                <span className="tracking-wide">{loading ? 'Creating...' : 'Create Account'}</span>
                {!loading && <span className="font-sans text-xl group-hover:translate-x-1 transition-transform">→</span>}
              </button>
            </form>

            <footer className="mt-12 text-center">
              <p className="font-sans text-sm text-on-surface/40">
                Already have an account? 
                <Link href="/login" className="text-primary font-medium ml-2 hover:underline underline-offset-4 decoration-primary/30 transition-all">Log In</Link>
              </p>
            </footer>

            <div className="mt-24 pt-12 border-t border-primary/5 flex justify-between items-center opacity-30">
              <div className="flex gap-4">
                <span className="font-sans text-sm">🍽</span>
                <span className="font-sans text-sm">🍷</span>
                <span className="font-sans text-sm">🥖</span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest">v2.0.4.Atelier</span>
            </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Sora', 'Manrope', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .font-label { font-family: 'Space Grotesk', sans-serif; }
      `}</style>
    </>
  );
}
