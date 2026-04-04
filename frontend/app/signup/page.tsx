"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Coffee, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = "Name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Min 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    toast.success("Account created! Please sign in.");
    router.push("/login");
  };

  const f = (k: string) => ({ value: form[k as keyof typeof form], onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setForm((p) => ({ ...p, [k]: e.target.value })); setErrors((p) => ({ ...p, [k]: "" })); } });

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-teal/10 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary rounded-2xl shadow-2xl shadow-brand-primary/40 mb-4">
            <Coffee size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-brand-muted mt-1 text-sm">Join Odoo POS Cafe</p>
        </div>

        <div className="card p-8 shadow-2xl">
          <div className="space-y-4">
            {[
              { k: "name", label: "Full Name", type: "text", icon: User, placeholder: "John Doe" },
              { k: "email", label: "Email", type: "email", icon: Mail, placeholder: "you@cafe.com" },
              { k: "password", label: "Password", type: showPass ? "text" : "password", icon: Lock, placeholder: "••••••••" },
              { k: "confirm", label: "Confirm Password", type: showPass ? "text" : "password", icon: Lock, placeholder: "••••••••" },
            ].map(({ k, label, type, icon: Icon, placeholder }) => (
              <div key={k}>
                <label className="block text-sm font-medium text-brand-muted mb-1.5">{label}</label>
                <div className="relative">
                  <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input type={type} placeholder={placeholder} {...f(k)}
                    className={`input-dark pl-9 ${k === "password" ? "pr-10" : ""} ${errors[k] ? "border-brand-danger" : ""}`} />
                  {k === "password" && (
                    <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
                {errors[k] && <p className="text-brand-danger text-xs mt-1">{errors[k]}</p>}
              </div>
            ))}

            <Button fullWidth loading={loading} onClick={handleSignup} size="lg">
              Create Account
            </Button>
          </div>

          <p className="text-center text-brand-muted text-sm mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-primary hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
