"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { track } from "@/lib/analytics";

type Props = {
  value: string;
  label?: string;
  className?: string;
  onCopied?: () => void;
};

export function CopyButton({ value, label = "Copy link", className = "", onCopied }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      // Prefer Web Share API on mobile so users get the native OS share sheet.
      if (typeof navigator !== "undefined" && "share" in navigator && navigator.share) {
        try {
          await navigator.share({ url: value, title: "SnapTab", text: value });
          track("link_copied", { via: "share" });
          onCopied?.();
          return;
        } catch {
          // User cancelled the share sheet or the API isn't allowed here — fall through to clipboard.
        }
      }
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      }
      setCopied(true);
      track("link_copied", { via: "clipboard" });
      onCopied?.();
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={[
        "press no-tap-highlight inline-flex items-center gap-2 rounded-xl bg-neutral-800 px-3 py-2 text-sm font-medium text-neutral-100 hover:bg-neutral-700",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {copied ? <Check className="h-4 w-4 text-amber-400" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : label}
    </button>
  );
}
