import type { Item, ItemClaim, Participant, ParticipantShare, Session } from "@/types";

// Pure proportional-split engine. Works entirely in integer cents internally
// so we never lose money to floating-point drift. All rounding remainders are
// assigned to the host so `sum(shares) === sessionTotal` always holds.

const cents = (n: number | string): number => Math.round(Number(n) * 100);

type InternalShare = {
  subtotalCents: number;
  feeCents: number;
  residualCents: number;
};

export function computeShares(
  items: Item[],
  claims: ItemClaim[],
  participants: Participant[],
  session: Session,
): Map<string, ParticipantShare> {
  const out = new Map<string, ParticipantShare>();
  if (participants.length === 0) return out;

  const shares = new Map<string, InternalShare>();
  for (const p of participants) {
    shares.set(p.id, { subtotalCents: 0, feeCents: 0, residualCents: 0 });
  }

  // The host absorbs unclaimed items + rounding remainders. Default to the
  // first participant if the host id is missing (defensive; the RPC always sets it).
  const hostId =
    session.host_participant_id && shares.has(session.host_participant_id)
      ? session.host_participant_id
      : participants[0]!.id;

  // Group claimers by item.
  const claimersByItem = new Map<string, string[]>();
  for (const claim of claims) {
    const arr = claimersByItem.get(claim.item_id) ?? [];
    arr.push(claim.participant_id);
    claimersByItem.set(claim.item_id, arr);
  }

  const feeCentsTotal =
    cents(session.total_tax) + cents(session.total_tip) + cents(session.total_delivery_fee);

  let claimedSubtotalCents = 0;

  // Assign every item to one or more participants.
  for (const item of items) {
    const priceCents = cents(item.price);
    if (priceCents === 0) continue;

    if (item.is_shared) {
      // Split across ALL participants regardless of claim state.
      const base = Math.floor(priceCents / participants.length);
      const remainder = priceCents - base * participants.length;
      for (const p of participants) {
        shares.get(p.id)!.subtotalCents += base;
      }
      if (remainder > 0) shares.get(hostId)!.subtotalCents += remainder;
      claimedSubtotalCents += priceCents;
      continue;
    }

    const claimers = (claimersByItem.get(item.id) ?? []).filter((id) => shares.has(id));
    if (claimers.length === 0) {
      // Unclaimed non-shared → host absorbs.
      shares.get(hostId)!.subtotalCents += priceCents;
      claimedSubtotalCents += priceCents;
      continue;
    }

    const base = Math.floor(priceCents / claimers.length);
    const remainder = priceCents - base * claimers.length;
    for (const cid of claimers) {
      shares.get(cid)!.subtotalCents += base;
    }
    if (remainder > 0) {
      const target = claimers.includes(hostId) ? hostId : claimers[0]!;
      shares.get(target)!.subtotalCents += remainder;
    }
    claimedSubtotalCents += priceCents;
  }

  // Fee distribution proportional to each participant's subtotal.
  if (claimedSubtotalCents > 0 && feeCentsTotal > 0) {
    let feeAssigned = 0;
    const ids = Array.from(shares.keys());
    for (const pid of ids) {
      const share = shares.get(pid)!;
      // Integer proportional share; any rounding down is picked up by the host below.
      const raw = Math.floor((share.subtotalCents * feeCentsTotal) / claimedSubtotalCents);
      share.feeCents = raw;
      feeAssigned += raw;
    }
    const feeRemainder = feeCentsTotal - feeAssigned;
    if (feeRemainder !== 0) {
      shares.get(hostId)!.feeCents += feeRemainder;
    }
  }

  // Final reconciliation: any residual (should be 0 by construction, but defensive)
  // is folded into the host so `sum === sessionTotal` exactly.
  const sessionTotalCents =
    items.reduce((s, i) => s + cents(i.price), 0) + feeCentsTotal;
  let totalAssigned = 0;
  for (const s of shares.values()) totalAssigned += s.subtotalCents + s.feeCents;
  const residualCents = sessionTotalCents - totalAssigned;
  if (residualCents !== 0) {
    shares.get(hostId)!.residualCents += residualCents;
  }

  for (const [pid, s] of shares) {
    out.set(pid, {
      participantId: pid,
      subtotal: s.subtotalCents / 100,
      feeShare: s.feeCents / 100,
      total: (s.subtotalCents + s.feeCents + s.residualCents) / 100,
      residualCents: s.residualCents,
    });
  }
  return out;
}

export function sessionTotal(items: Item[], session: Session): number {
  const totalCents =
    items.reduce((s, i) => s + cents(i.price), 0) +
    cents(session.total_tax) +
    cents(session.total_tip) +
    cents(session.total_delivery_fee);
  return totalCents / 100;
}
