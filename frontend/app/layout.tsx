import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthSessionGuard } from "@/components/AuthSessionGuard";

export const metadata: Metadata = {
  title: "Odoo Cafe",
  description: "Restaurant Point of Sale System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthSessionGuard />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#2a2a3e",
              color: "#ffffff",
              border: "1px solid #3a3a5e",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
