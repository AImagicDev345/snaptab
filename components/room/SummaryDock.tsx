"use client";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { formatMoney } from "@/lib/format";
import type { ParticipantShare, Session } from "@/types";

type Props = {
  session: Session;
  share: ParticipantShare | null;
  paid: boolean;
  onOpenPay: () => void;
  onTogglePaid: () => void;
};

export function SummaryDock({ session, share, paid, onOpenPay, onTogglePaid }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-end gap-3 px-4 pb-4 pt-3 safe-pb">
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Your share</div>
          <div className="text-2xl font-black leading-none text-neutral-100">
            {share ? formatMoney(share.total, session.currency_code) : "—"}
          </div>
          {share ? (
            <div className="mt-0.5 text-[11px] text-neutral-500">
              {formatMoney(share.subtotal, session.currency_code)} sub ·{" "}
              {formatMoney(share.feeShare, session.currency_code)} fees
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="primary" onClick={onOpenPay} disabled={!share || share.total <= 0}>
            Pay host
          </Button>
          <button
            type="button"
            onClick={onTogglePaid}
            aria-pressed={paid}
            className={[
              "press no-tap-highlight inline-flex items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium",
              paid
                ? "bg-amber-500/15 text-amber-400"
                : "border border-neutral-800 bg-neutral-900 text-neutral-300",
            ].join(" ")}
          >
            {paid ? <Check className="h-3 w-3" /> : null}
            {paid ? "Paid" : "Mark I paid"}
          </button>
        </div>
      </div>
    </div>
  );
}
