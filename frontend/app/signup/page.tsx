"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = "Name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Min 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    toast.success("Account created! Please sign in.");
    router.push("/login");
  };

  const f = (k: keyof typeof form) => ({ 
    value: form[k], 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => { 
      setForm((p) => ({ ...p, [k]: e.target.value })); 
      setErrors((p) => ({ ...p, [k]: "" })); 
    } 
  });

  return (
    <>

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 glass-header flex justify-between items-center px-6 py-4">
        <div className="serif-headline text-2xl font-bold tracking-tight text-[#261813]">
          The Artisanal Editorial
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-[#261813]/60 hover:text-[#A6876A] transition-colors duration-300 font-label text-sm uppercase tracking-wider">Log In</Link>
          <button className="p-2 text-[#261813]/80 hover:bg-[#EBE3D9] transition-colors rounded-full">
            <span className="material-symbols-outlined">help</span>
          </button>
        </div>
      </header>

      <div className="min-h-screen selection:bg-[#EBE3D9] selection:text-[#261813]">
        <main className="min-h-screen flex flex-col md:flex-row pt-16 md:pt-0">
          {/* Atmospheric Imagery Side (Asymmetric Layout) */}
          <section className="w-full md:w-1/2 lg:w-3/5 bg-[#EBE3D9] flex flex-col justify-center relative overflow-hidden order-2 md:order-1">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
            <div className="px-8 md:px-16 lg:px-24 z-10 py-12">
              <div className="relative group">
                <img alt="Coffee beans and artisanal tools" className="w-full h-[400px] md:h-[600px] object-cover shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAigb77oc103AisPHa2Mf0x7Jwo51AXzizilngfELIOMO8SR3C9r_vtphQqik-hqbbFP90QPSqOZohgAwvbD6xVXiKRtYLB-A_dUxqdp_z0T2mQB897xh8b295i_y8dBb5UNnTBIEok8mdQSEcAr8B5P3L_I_V84cUDChEvmTUJYnY8vwwPuw6U8GD0YQZQ6gtr-DsiBMi3JyrzETwj2lpQfQ0BjVZofT6czrwqFdKZVX4PKysVNvj9zmmsyB3y2QlHCfl6eRV2JLg"/>
                <div className="absolute -bottom-6 -right-6 bg-[#FAF6F0] p-8 hidden lg:block border border-[#A6876A]/20">
                  <p className="serif-headline text-2xl text-[#261813] leading-tight italic max-w-xs">
                    "The ritual of the morning pour, captured in every single grain."
                  </p>
                </div>
              </div>
              <div className="mt-12 space-y-4 max-w-md">
                <h2 className="serif-headline text-4xl lg:text-5xl tracking-tight leading-tight text-[#261813]">Crafting the <span className="italic text-[#A6876A]">Perfect Journal</span> for the Modern Sommelier</h2>
                <p className="text-[#5C5047] font-body text-lg leading-relaxed">Join a community dedicated to the pursuit of exceptional taste, heritage technique, and the digital artisanal experience.</p>
              </div>
            </div>
          </section>

          {/* Registration Form Side */}
          <section className="w-full md:w-1/2 lg:w-2/5 bg-[#FAF6F0] flex flex-col justify-center px-8 md:px-16 lg:px-20 py-16 order-1 md:order-2">
            <div className="max-w-md w-full mx-auto">
              <header className="mb-12">
                <h1 className="serif-headline text-5xl font-bold tracking-tight text-[#261813] mb-4">Create Account</h1>
                <p className="text-[#5C5047] font-label text-sm uppercase tracking-widest">Begin your curated journey today</p>
              </header>

              <form className="space-y-8" onSubmit={handleSignup}>
                <div className="space-y-1">
                  <label className="block font-label text-[10px] uppercase tracking-widest text-[#261813]/60" htmlFor="full_name">Full Name</label>
                  <input className="w-full input-underline font-body text-lg placeholder:text-[#261813]/20" id="full_name" placeholder="Elias Thorne" type="text" {...f("name")}/>
                  {errors.name && <p className="text-red-900 text-xs mt-1">{errors.name}</p>}
                </div>
                <div className="space-y-1">
                  <label className="block font-label text-[10px] uppercase tracking-widest text-[#261813]/60" htmlFor="email">Email Address</label>
                  <input className="w-full input-underline font-body text-lg placeholder:text-[#261813]/20" id="email" placeholder="elias@editorial.com" type="email" {...f("email")}/>
                  {errors.email && <p className="text-red-900 text-xs mt-1">{errors.email}</p>}
                </div>
                <div className="space-y-1">
                  <label className="block font-label text-[10px] uppercase tracking-widest text-[#261813]/60" htmlFor="password">Password</label>
                  <input className="w-full input-underline font-body text-lg placeholder:text-[#261813]/20" id="password" placeholder="••••••••" type="password" {...f("password")}/>
                  {errors.password && <p className="text-red-900 text-xs mt-1">{errors.password}</p>}
                </div>

                <div className="flex items-start gap-3 py-2">
                  <div className="flex items-center h-5">
                    <input className="h-4 w-4 rounded border-[#A6876A] text-[#A6876A] focus:ring-[#A6876A]/20 bg-[#FAF6F0]" id="terms" type="checkbox" required/>
                  </div>
                  <label className="text-xs text-[#5C5047] leading-relaxed" htmlFor="terms">
                    I agree to the <a className="text-[#A6876A] underline decoration-[#A6876A]/30 hover:decoration-[#A6876A]" href="#">Terms of Service</a> and acknowledge the <a className="text-[#A6876A] underline decoration-[#A6876A]/30 hover:decoration-[#A6876A]" href="#">Privacy Policy</a>.
                  </label>
                </div>

                <div className="pt-6">
                  <button disabled={loading} className="w-full bg-[#261813] text-[#FAF6F0] py-5 text-sm font-label uppercase tracking-widest transition-all duration-300 hover:bg-[#261813]/90 active:scale-[0.98] shadow-sm" type="submit">
                    {loading ? "Registering..." : "Register"}
                  </button>
                </div>

                <div className="flex items-center gap-4 py-4">
                  <div className="h-[1px] flex-1 bg-[#261813]/10"></div>
                  <span className="font-label text-[10px] uppercase tracking-widest text-[#261813]/40">Or join with</span>
                  <div className="h-[1px] flex-1 bg-[#261813]/10"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-2 py-4 border border-[#261813]/10 hover:bg-[#EBE3D9] transition-colors duration-300" type="button">
                    <span className="font-label text-[10px] uppercase tracking-widest text-[#261813]">Google</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 py-4 border border-[#261813]/10 hover:bg-[#EBE3D9] transition-colors duration-300" type="button">
                    <span className="font-label text-[10px] uppercase tracking-widest text-[#261813]">Apple</span>
                  </button>
                </div>
              </form>

              <footer className="mt-12 text-center">
                <p className="font-body text-sm text-[#5C5047]">
                  Already have an account? 
                  <Link className="text-[#A6876A] font-semibold hover:underline underline-offset-4 ml-1" href="/login">Sign in here</Link>
                </p>
              </footer>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
