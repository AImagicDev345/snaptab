"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  hideClose?: boolean;
};

export function Modal({ open, onClose, title, children, hideClose }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? "Dialog"}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-md rounded-2xl border border-line bg-app p-5 shadow-2xl outline-none"
      >
        {title ? (
          <h2 className="mb-3 pr-8 text-lg font-semibold text-fg">{title}</h2>
        ) : null}
        {!hideClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="press absolute right-3 top-3 rounded-full p-2 text-fg-muted hover:bg-surface hover:text-fg"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
        {children}
      </div>
    </div>
  );
}
