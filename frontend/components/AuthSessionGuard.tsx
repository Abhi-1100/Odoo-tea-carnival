"use client";

import { useEffect, useRef } from "react";
import { ApiError, api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function AuthSessionGuard() {
  const { token, hasHydrated, logout } = useAuthStore();
  const validatedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hasHydrated || !token || validatedTokenRef.current === token) {
      return;
    }

    validatedTokenRef.current = token;

    const validate = async () => {
      try {
        await api.auth.me(token);
      } catch (error) {
        const status = error instanceof ApiError ? error.status : undefined;
        const message = error instanceof Error ? error.message.toLowerCase() : "";
        const isAuthFailure = status === 401 || status === 403 || message.includes("invalid token") || message.includes("token has expired");

        if (isAuthFailure) {
          logout();
        }
      }
    };

    validate();
  }, [hasHydrated, token, logout]);

  return null;
}