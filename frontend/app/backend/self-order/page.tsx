"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import toast from "react-hot-toast";

export default function SelfOrderSettings() {
  const [copied, setCopied] = useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const selfOrderUrl = `${baseUrl}/self-order`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selfOrderUrl);
      setCopied(true);
      toast.success("URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Self Ordering</h1>
      <p className="text-brand-muted text-sm">Configure self-ordering settings and QR token generation.</p>
      <div className="mt-8 card p-6 max-w-lg">
        <p className="text-brand-muted text-sm">To let customers self-order, share this URL:</p>
        <div className="mt-3 bg-brand-bg border border-brand-border rounded-lg px-4 py-3 flex items-center justify-between">
          <code className="text-brand-primary text-sm">{selfOrderUrl}</code>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-brand-muted hover:text-white text-xs transition-colors"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
