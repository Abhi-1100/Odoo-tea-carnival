"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, CreditCard, Map, Monitor, QrCode, ChefHat, BarChart3, Coffee, LogOut, Users, Tag
} from "lucide-react";
import clsx from "clsx";
import { useAuthStore } from "@/store/authStore";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/backend/products", icon: Package },
  { label: "Categories", href: "/backend/categories", icon: Tag },
  { label: "Customers", href: "/backend/customers", icon: Users },
  { label: "Payment Methods", href: "/backend/payment-methods", icon: CreditCard },
  { label: "Floor Plan", href: "/backend/floors", icon: Map },
  { label: "POS Terminal", href: "/backend/terminal", icon: Monitor },
  { label: "Setting", href: "/backend/self-ordering", icon: QrCode },
  { label: "Kitchen Display", href: "/backend/kitchen-settings", icon: ChefHat },
  { label: "Reports", href: "/backend/reports", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-brand-card border-r border-brand-border flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-brand-border">
        <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/30">
          <Coffee size={18} className="text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-sm">Odoo POS</div>
          <div className="text-brand-muted text-xs">Cafe Manager</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/backend"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-brand-primary/20 text-white border border-brand-primary/30"
                  : "text-brand-muted hover:text-white hover:bg-brand-bg"
              )}
            >
              <Icon size={17} className={isActive ? "text-brand-primary" : ""} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-brand-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold">
            {(user?.name?.[0] || "A").toUpperCase()}
          </div>
          <div>
            <div className="text-white text-sm font-medium">{user?.name || "Admin"}</div>
            <div className="text-brand-muted text-xs">{user?.email || "admin@cafe.com"}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-sm text-brand-muted hover:text-white hover:border-brand-primary/40 transition-all"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </aside>
  );
}
