import React from "react";
import clsx from "clsx";

type BadgeVariant = "available" | "occupied" | "reserved" | "active" | "inactive" | "open" | "closed" | "pending" | "preparing" | "completed" | "paid";

const variantMap: Record<BadgeVariant, string> = {
  available: "bg-green-500/20 text-green-400 border-green-500/30",
  occupied: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  reserved: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  inactive: "bg-red-500/20 text-red-400 border-red-500/30",
  open: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  closed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  pending: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  preparing: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  paid: "bg-teal-500/20 text-teal-400 border-teal-500/30",
};

const labelMap: Record<BadgeVariant, string> = {
  available: "Available", occupied: "Occupied", reserved: "Reserved",
  active: "Active", inactive: "Inactive", open: "Open", closed: "Closed",
  pending: "Pending", preparing: "Preparing", completed: "Completed", paid: "Paid",
};

export function Badge({ variant, label, dot = true, className }: { variant: BadgeVariant; label?: string; dot?: boolean; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", variantMap[variant], className)}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {label ?? labelMap[variant]}
    </span>
  );
}
