"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, CreditCard, Map, Monitor, QrCode, ChefHat, BarChart3, Coffee, LogOut
} from "lucide-react";
import clsx from "clsx";
import { useAuthStore } from "@/store/authStore";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/backend/products", icon: Package },
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
    <aside className="fixed left-0 top-0 h-full w-60 bg-[#271310] border-r border-[#3E2723] flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#3E2723]">
        <div className="w-9 h-9 bg-[#D4A373] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4A373]/30">
          <Coffee size={18} className="text-[#271310]" />
        </div>
        <div>
          <div className="text-[#FDF9F0] font-headline font-bold text-lg leading-none mb-1 cursor-default">Odoo POS</div>
          <div className="text-[#FDF9F0]/60 text-xs font-medium cursor-default">Cafe Manager</div>
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
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 font-medium",
                isActive
                  ? "bg-[#D4A373]/10 text-[#D4A373] border-b border-[#D4A373]/30"
                  : "text-[#FDF9F0]/60 hover:text-[#FDF9F0] hover:bg-[#3E2723]/50"
              )}
            >
              <Icon size={17} className={isActive ? "text-[#D4A373]" : "opacity-80"} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[#3E2723]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#3E2723] flex items-center justify-center text-[#FDF9F0] text-xs font-bold border border-[#D4A373]/50">
            {(user?.name?.[0] || "A").toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <div className="text-[#FDF9F0] text-sm font-medium truncate">{user?.name || "Admin"}</div>
            <div className="text-[#FDF9F0]/50 text-xs truncate">{user?.email || "admin@pos.com"}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[#3E2723] bg-[#3E2723]/50 px-3 py-2.5 text-sm text-[#FDF9F0]/80 hover:text-[#D4A373] hover:border-[#D4A373]/40 transition-all"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </aside>
  );
}
