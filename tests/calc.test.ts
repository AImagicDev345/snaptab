import { describe, expect, it } from "vitest";

import { computeShares, sessionTotal } from "@/lib/calc";
import type { Item, ItemClaim, Participant, Session } from "@/types";

function mkSession(overrides: Partial<Session> = {}): Session {
  return {
    id: "s1",
    title: "Bill",
    total_tax: 0,
    total_tip: 0,
    total_delivery_fee: 0,
    currency_code: "USD",
    status: "active",
    host_participant_id: "p1",
    payment_handles: {},
    created_at: "2026-07-14T12:00:00Z",
    ...overrides,
  };
}

function mkParticipant(id: string): Participant {
  return {
    id,
    session_id: "s1",
    nickname: id,
    paid_at: null,
    created_at: "2026-07-14T12:00:00Z",
  };
}

function mkItem(id: string, price: number, is_shared = false): Item {
  return { id, session_id: "s1", name: id, price, is_shared };
}

function mkClaim(item_id: string, participant_id: string): ItemClaim {
  return { id: `${item_id}-${participant_id}`, item_id, participant_id, session_id: "s1" };
}

describe("computeShares", () => {
  it("2-way even split with fees", () => {
    const items = [mkItem("i1", 10), mkItem("i2", 10)];
    const claims = [mkClaim("i1", "p1"), mkClaim("i2", "p2")];
    const participants = [mkParticipant("p1"), mkParticipant("p2")];
    const session = mkSession({ total_tax: 2, total_tip: 2 });

    const shares = computeShares(items, claims, participants, session);
    expect(shares.get("p1")!.subtotal).toBe(10);
    expect(shares.get("p2")!.subtotal).toBe(10);
    expect(shares.get("p1")!.feeShare).toBe(2);
    expect(shares.get("p2")!.feeShare).toBe(2);
    expect(shares.get("p1")!.total).toBe(12);
    expect(shares.get("p2")!.total).toBe(12);
  });

  it("3-way split where one participant claims two items", () => {
    const items = [mkItem("i1", 8), mkItem("i2", 12), mkItem("i3", 5)];
    const claims = [mkClaim("i1", "p1"), mkClaim("i2", "p2"), mkClaim("i3", "p1")];
    const participants = [mkParticipant("p1"), mkParticipant("p2"), mkParticipant("p3")];
    const session = mkSession({ total_tax: 0, total_tip: 0 });

    const shares = computeShares(items, claims, participants, session);
    expect(shares.get("p1")!.subtotal).toBe(13);
    expect(shares.get("p2")!.subtotal).toBe(12);
    // p3 claimed nothing; there are no unclaimed items → their share is 0.
    expect(shares.get("p3")!.subtotal).toBe(0);
  });

  it("shared appetizer splits evenly across everyone", () => {
    const items = [mkItem("appetizer", 15, true), mkItem("entree1", 20), mkItem("entree2", 20)];
    const claims = [mkClaim("entree1", "p1"), mkClaim("entree2", "p2")];
    const participants = [mkParticipant("p1"), mkParticipant("p2"), mkParticipant("p3")];
    const session = mkSession({ total_tax: 0, total_tip: 0 });

    const shares = computeShares(items, claims, participants, session);
    // Shared item: 15 / 3 = 5 each.
    expect(shares.get("p1")!.subtotal).toBe(25); // 5 shared + 20 entree
    expect(shares.get("p2")!.subtotal).toBe(25);
    expect(shares.get("p3")!.subtotal).toBe(5);
  });

  it("unclaimed non-shared item is absorbed by the host", () => {
    const items = [mkItem("i1", 10), mkItem("i2", 6)];
    const claims = [mkClaim("i1", "p2")];
    const participants = [mkParticipant("p1"), mkParticipant("p2")];
    const session = mkSession({ host_participant_id: "p1" });

    const shares = computeShares(items, claims, participants, session);
    expect(shares.get("p1")!.subtotal).toBe(6); // unclaimed item absorbed
    expect(shares.get("p2")!.subtotal).toBe(10);
  });

  it("penny drift ($10 / 3) resolves exactly with residual to host", () => {
    const items = [mkItem("i1", 10)];
    const claims = [mkClaim("i1", "p1"), mkClaim("i1", "p2"), mkClaim("i1", "p3")];
    const participants = [mkParticipant("p1"), mkParticipant("p2"), mkParticipant("p3")];
    const session = mkSession({ host_participant_id: "p1" });

    const shares = computeShares(items, claims, participants, session);
    const total =
      shares.get("p1")!.total + shares.get("p2")!.total + shares.get("p3")!.total;
    expect(Math.round(total * 100)).toBe(1000);
    // Host picks up the extra cent.
    expect(shares.get("p1")!.subtotal).toBeGreaterThan(shares.get("p2")!.subtotal);
    expect(shares.get("p2")!.subtotal).toBe(shares.get("p3")!.subtotal);
  });

  it("zero-total edge case: no items claimed and no shared items", () => {
    const items = [mkItem("i1", 10), mkItem("i2", 20)];
    const claims: ItemClaim[] = [];
    const participants = [mkParticipant("p1"), mkParticipant("p2")];
    const session = mkSession({ host_participant_id: "p1", total_tax: 5 });

    const shares = computeShares(items, claims, participants, session);
    // p1 (host) absorbs everything; p2 owes nothing.
    expect(shares.get("p2")!.total).toBe(0);
    expect(shares.get("p1")!.total).toBe(35);
  });

  it("single-participant session (host only)", () => {
    const items = [mkItem("i1", 12.34), mkItem("i2", 5.67)];
    const claims = [mkClaim("i1", "p1"), mkClaim("i2", "p1")];
    const participants = [mkParticipant("p1")];
    const session = mkSession({ host_participant_id: "p1", total_tax: 1.11, total_tip: 2.22 });

    const shares = computeShares(items, claims, participants, session);
    expect(shares.get("p1")!.total).toBeCloseTo(21.34, 2);
    expect(shares.get("p1")!.total).toBe(sessionTotal(items, session));
  });

  it("sum of all participant totals always equals the session total", () => {
    const items = [
      mkItem("a", 7.31),
      mkItem("b", 12.4, true), // shared
      mkItem("c", 3.99),
      mkItem("d", 21.05),
    ];
    const claims = [mkClaim("a", "p1"), mkClaim("c", "p2"), mkClaim("d", "p3"), mkClaim("d", "p1")];
    const participants = [mkParticipant("p1"), mkParticipant("p2"), mkParticipant("p3")];
    const session = mkSession({
      host_participant_id: "p1",
      total_tax: 3.17,
      total_tip: 5.5,
      total_delivery_fee: 4.99,
    });

    const shares = computeShares(items, claims, participants, session);
    const total = Array.from(shares.values()).reduce((s, x) => s + x.total, 0);
    expect(Math.round(total * 100)).toBe(Math.round(sessionTotal(items, session) * 100));
  });
});
