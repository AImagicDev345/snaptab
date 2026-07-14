"use client";

import { Users } from "lucide-react";

import { InitialsBadge } from "@/components/ui/InitialsBadge";
import { formatMoney } from "@/lib/format";
import type { Item, ItemClaim, Participant, Session } from "@/types";

type Props = {
  session: Session;
  items: Item[];
  participants: Participant[];
  claims: ItemClaim[];
  viewerId: string | null;
  onToggleClaim: (itemId: string) => void;
};

export function BillLedger({ session, items, participants, claims, viewerId, onToggleClaim }: Props) {
  const claimsByItem = new Map<string, ItemClaim[]>();
  for (const c of claims) {
    const arr = claimsByItem.get(c.item_id) ?? [];
    arr.push(c);
    claimsByItem.set(c.item_id, arr);
  }
  const participantById = new Map(participants.map((p) => [p.id, p]));

  const viewerHasAnyClaim = viewerId
    ? claims.some((c) => c.participant_id === viewerId)
    : false;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-subtle">
        The bill
      </h2>

      {viewerId && !viewerHasAnyClaim ? (
        <p className="rounded-2xl border border-dashed border-line-strong bg-surface px-4 py-3 text-sm text-fg-muted">
          Tap the items you ordered.
        </p>
      ) : null}

      <ul className="space-y-2">
        {items.map((item) => {
          const itemClaims = claimsByItem.get(item.id) ?? [];
          const viewerClaimed = viewerId
            ? itemClaims.some((c) => c.participant_id === viewerId)
            : false;
          const perClaimer = item.is_shared
            ? participants.length > 0
              ? item.price / participants.length
              : 0
            : itemClaims.length > 0
              ? item.price / itemClaims.length
              : item.price;

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  if (!viewerId || item.is_shared) return;
                  onToggleClaim(item.id);
                }}
                aria-pressed={viewerClaimed}
                disabled={!viewerId || item.is_shared}
                className={[
                  "press no-tap-highlight w-full rounded-2xl border p-3 text-left transition-colors",
                  item.is_shared
                    ? "border-line bg-surface"
                    : viewerClaimed
                      ? "border-accent bg-accent/10 ring-2 ring-accent"
                      : "border-line bg-surface hover:border-line-strong hover:bg-surface-strong",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold text-fg">
                      {item.name}
                    </div>
                    <div className="mt-0.5 text-xs text-fg-subtle">
                      {formatMoney(item.price, session.currency_code)}
                      {item.is_shared ? null : itemClaims.length > 0 ? (
                        <> · {formatMoney(perClaimer, session.currency_code)} each</>
                      ) : (
                        <> · unclaimed</>
                      )}
                    </div>
                  </div>
                  {item.is_shared ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-line-strong px-2 py-1 text-xs text-fg-muted">
                      <Users className="h-3 w-3" />
                      Shared
                    </span>
                  ) : null}
                </div>

                {item.is_shared ? null : itemClaims.length > 0 ? (
                  <div className="mt-2 flex -space-x-2">
                    {itemClaims.map((c) => {
                      const p = participantById.get(c.participant_id);
                      if (!p) return null;
                      return <InitialsBadge key={c.id} nickname={p.nickname} size="sm" />;
                    })}
                  </div>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
