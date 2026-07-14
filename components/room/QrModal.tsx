"use client";

import { useEffect, useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { generateInviteQrSvg } from "@/lib/qr";

type Props = {
  open: boolean;
  onClose: () => void;
  url: string;
};

export function QrModal({ open, onClose, url }: Props) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setSvg(null);
    generateInviteQrSvg(url)
      .then((s) => {
        if (!cancelled) setSvg(s);
      })
      .catch(() => {
        if (!cancelled) setSvg(null);
      });
    return () => {
      cancelled = true;
    };
  }, [open, url]);

  return (
    <Modal open={open} onClose={onClose} title="Scan to join">
      <div className="flex flex-col items-center gap-3">
        <div
          className="overflow-hidden rounded-2xl bg-neutral-950 p-2"
          aria-label="QR code to join this bill"
          // The generated SVG is fully self-contained. Safe to inject.
          dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
        />
        {!svg ? <div className="h-64 w-64 animate-pulse rounded-2xl bg-neutral-900" /> : null}
        <p className="text-center text-sm text-neutral-400 break-all">{url}</p>
      </div>
    </Modal>
  );
}
