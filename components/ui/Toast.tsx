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
              "pointer-events-auto max-w-md rounded-xl border px-4 py-2 text-sm font-medium",
              t.kind === "error"
                ? "border-rose-700 bg-rose-950 text-rose-100"
                : t.kind === "success"
                  ? "border-amber-600 bg-amber-950 text-amber-100"
                  : "border-neutral-700 bg-neutral-900 text-neutral-100",
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
