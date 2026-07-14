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
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-3 text-center">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Your share</div>
          <div className="text-3xl font-black text-amber-400">
            {formatMoney(amount, session.currency_code)}
          </div>
          {host ? (
            <div className="mt-1 text-xs text-neutral-500">to {host.nickname}</div>
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
          <p className="rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-xs text-neutral-400">
            No payment handles set for this bill. Copy the message below and send it however you like.
          </p>
        )}

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-3">
          <div className="mb-2 text-xs uppercase tracking-wide text-neutral-500">Message</div>
          <p className="whitespace-pre-wrap text-sm text-neutral-200">{message}</p>
          <button
            type="button"
            onClick={copyMessage}
            className="press mt-2 inline-flex items-center gap-2 rounded-xl bg-neutral-800 px-3 py-2 text-sm font-medium text-neutral-100 hover:bg-neutral-700"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied" : "Copy message"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
