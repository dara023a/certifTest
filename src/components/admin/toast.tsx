"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cn } from "@/lib/utils";

import { useSettings } from "@/contexts/settings-context";
import { subscribeStorageError } from "@/lib/admin-store";
import { translations } from "@/lib/i18n";

type ToastVariant = "default" | "success" | "destructive";

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { language } = useSettings();

  const toast = useCallback((message: string, variant: ToastVariant = "default") => {
    const id = `toast-${Math.random().toString(36).slice(2)}`;
    setToasts((current) => [...current, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  // Surface localStorage write failures (quota/private mode) instead of
  // silently dropping changes.
  useEffect(() => {
    return subscribeStorageError(() => {
      toast(translations[language].admin.common.storageError, "destructive");
    });
  }, [toast, language]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="region"
        aria-live="polite"
        aria-label={translations[language].admin.common.notifications}
        className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto rounded-lg px-4 py-2.5 text-sm shadow-lg ring-1",
              item.variant === "success" &&
                "bg-emerald-700 text-white ring-emerald-700/40",
              item.variant === "destructive" &&
                "bg-red-600 text-white ring-red-600/40",
              item.variant === "default" &&
                "bg-popover text-popover-foreground ring-foreground/10"
            )}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
