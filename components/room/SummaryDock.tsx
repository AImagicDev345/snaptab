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
  /**
   * "dock" (default): fixed to the bottom of the viewport — used on mobile.
   * "inline": renders as a static card — used inside the desktop right rail.
   */
  variant?: "dock" | "inline";
};

export function SummaryDock({
  session,
  share,
  paid,
  onOpenPay,
  onTogglePaid,
  variant = "dock",
}: Props) {
  const isInline = variant === "inline";

  const wrapperClass = isInline
    ? "rounded-2xl border border-line bg-surface p-4 shadow-sm"
    : "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-app/95 backdrop-blur lg:hidden";

  const innerClass = isInline
    ? "flex flex-col gap-3"
    : "mx-auto flex max-w-md items-end gap-3 px-4 pb-4 pt-3 safe-pb";

  return (
    <div className={wrapperClass}>
      <div className={innerClass}>
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wide text-fg-subtle">Your share</div>
          <div className="text-3xl font-black leading-none text-fg lg:text-4xl">
            {share ? formatMoney(share.total, session.currency_code) : "—"}
          </div>
          {share ? (
            <div className="mt-1 text-[11px] text-fg-subtle">
              {formatMoney(share.subtotal, session.currency_code)} sub ·{" "}
              {formatMoney(share.feeShare, session.currency_code)} fees
            </div>
          ) : null}
        </div>
        <div className={isInline ? "flex flex-col gap-2" : "flex flex-col gap-2"}>
          <Button
            variant="primary"
            onClick={onOpenPay}
            disabled={!share || share.total <= 0}
            fullWidth={isInline}
          >
            Pay host
          </Button>
          <button
            type="button"
            onClick={onTogglePaid}
            aria-pressed={paid}
            className={[
              "press no-tap-highlight inline-flex items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-medium",
              paid
                ? "bg-accent/15 text-accent"
                : "border border-line bg-surface text-fg-muted hover:bg-surface-strong",
              isInline ? "w-full" : "",
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
