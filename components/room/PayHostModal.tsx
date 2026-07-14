"use client";

import { Copy } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { track } from "@/lib/analytics";
import { availableProviders, buildDeepLink, PROVIDER_LABELS, type DeepLinkProvider } from "@/lib/deepLinks";
import { formatMoney } from "@/lib/format";
import type { Participant, Session } from "@/types";

type Props = {
  open: boolean;
  onClose: () => void;
  session: Session;
  amount: number;
  viewer: Participant | null;
  host: Participant | null;
};

export function PayHostModal({ open, onClose, session, amount, viewer, host }: Props) {
  const [copied, setCopied] = useState(false);
  const providers = useMemo(() => availableProviders(session.payment_handles), [session.payment_handles]);

  const noteBase = viewer
    ? `${session.title} · ${viewer.nickname}'s share`
    : session.title;
  const message = useMemo(() => {
    const amt = formatMoney(amount, session.currency_code);
    const who = host?.nickname ?? "the host";
    return `Hey ${who}! My share for ${session.title} is ${amt}. — Split with SnapTab · snaptab.vercel.app`;
  }, [amount, host?.nickname, session.currency_code, session.title]);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  function handleDeepLink(provider: DeepLinkProvider) {
    const handle = session.payment_handles[provider];
    if (!handle) return;
    const link = buildDeepLink(provider, handle, {
      amount,
      note: noteBase,
      currency: session.currency_code,
      payeeName: host?.nickname ?? "SnapTab",
    });
    if (!link) return;
    track("deep_link_clicked", { provider });
    window.location.href = link;
  }

  return (
    <Modal open={open} onClose={onClose} title="Pay the host">
      <div className="space-y-4">
        <div className="rounded-2xl border border-line bg-surface p-3 text-center">
          <div className="text-xs uppercase tracking-wide text-fg-subtle">Your share</div>
          <div className="text-3xl font-black text-accent">
            {formatMoney(amount, session.currency_code)}
          </div>
          {host ? (
            <div className="mt-1 text-xs text-fg-subtle">to {host.nickname}</div>
          ) : null}
        </div>

        {providers.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {providers.map((p) => (
              <Button
                key={p}
                variant="secondary"
                onClick={() => handleDeepLink(p)}
              >
                {PROVIDER_LABELS[p]}
              </Button>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-line bg-surface p-3 text-xs text-fg-muted">
            No payment handles set for this bill. Copy the message below and send it however you like.
          </p>
        )}

        <div className="rounded-2xl border border-line bg-surface p-3">
          <div className="mb-2 text-xs uppercase tracking-wide text-fg-subtle">Message</div>
          <p className="whitespace-pre-wrap text-sm text-fg">{message}</p>
          <button
            type="button"
            onClick={copyMessage}
            className="press mt-2 inline-flex items-center gap-2 rounded-xl border border-line bg-surface-strong px-3 py-2 text-sm font-medium text-fg hover:bg-app"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied" : "Copy message"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
