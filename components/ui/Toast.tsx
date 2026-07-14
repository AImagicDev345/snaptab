"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type ToastKind = "error" | "success" | "info";

type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
};

type Ctx = {
  show: (message: string, kind?: ToastKind) => void;
};

const ToastContext = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const show = useCallback((message: string, kind: ToastKind = "info") => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "pointer-events-auto max-w-md rounded-xl border px-4 py-2 text-sm font-medium shadow-lg",
              t.kind === "error"
                ? "border-danger bg-danger text-danger-fg"
                : t.kind === "success"
                  ? "border-accent-strong bg-accent text-accent-fg"
                  : "border-line bg-surface text-fg",
            ].join(" ")}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback when used outside a provider (e.g. very early during hydration).
    return {
      show: (message: string) => {
        if (typeof window !== "undefined") console.warn("Toast fallback:", message);
      },
    };
  }
  return ctx;
}
