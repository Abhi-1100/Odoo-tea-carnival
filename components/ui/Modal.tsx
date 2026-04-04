"use client";
import React, { useEffect } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClass = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl", xl: "max-w-4xl" };

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx("relative bg-brand-card border border-brand-border rounded-2xl shadow-2xl w-full animate-in fade-in zoom-in-95 duration-200", sizeClass[size])}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <button onClick={onClose} className="text-brand-muted hover:text-white transition-colors p-1 rounded-lg hover:bg-brand-border">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
