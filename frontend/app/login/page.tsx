"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Coffee, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
      toast.success(`Welcome back, ${response.user.name}!`);
      router.push("/backend");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-teal/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary rounded-2xl shadow-2xl shadow-brand-primary/40 mb-4">
            <Coffee size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Odoo POS Cafe</h1>
          <p className="text-brand-muted mt-1 text-sm">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-2xl">
          <div className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                  placeholder="admin@pos.com"
                  className={`input-dark pl-9 ${errors.email ? "border-brand-danger" : ""}`}
                />
              </div>
              {errors.email && <p className="text-brand-danger text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                  placeholder="••••••••"
                  className={`input-dark pl-9 pr-10 ${errors.password ? "border-brand-danger" : ""}`}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-brand-danger text-xs mt-1">{errors.password}</p>}
            </div>

            <Button fullWidth loading={loading} onClick={handleLogin} size="lg">
              Sign In
            </Button>
          </div>

          <p className="text-center text-brand-muted text-sm mt-6">
            Don{"'"}t have an account?{" "}
            <Link href="/signup" className="text-brand-primary hover:underline font-medium">Sign up</Link>
          </p>
        </div>

        <p className="text-center text-brand-muted/50 text-xs mt-6">
          Demo: admin@pos.com / admin123
        </p>
      </div>
    </div>
  );
}
