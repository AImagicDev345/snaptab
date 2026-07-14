"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { toggleClaim } from "@/app/actions/claims";
import { joinSession } from "@/app/actions/participants";
import { markPaid } from "@/app/actions/paid";
import { BillLedger } from "@/components/room/BillLedger";
import { JoinTableModal } from "@/components/room/JoinTableModal";
import { ParticipantsPanel } from "@/components/room/ParticipantsPanel";
import { PayHostModal } from "@/components/room/PayHostModal";
import { QrModal } from "@/components/room/QrModal";
import { RoomHeader } from "@/components/room/RoomHeader";
import { SummaryDock } from "@/components/room/SummaryDock";
import { useToast } from "@/components/ui/Toast";
import { track } from "@/lib/analytics";
import { computeShares } from "@/lib/calc";
import { getLocalParticipantId, setLocalParticipantId } from "@/lib/localParticipant";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Item, ItemClaim, Participant, Session } from "@/types";

type Props = {
  session: Session;
  initialItems: Item[];
  initialParticipants: Participant[];
  initialClaims: ItemClaim[];
  hostParticipantId: string | null;
};

export function RoomClient({
  session,
  initialItems,
  initialParticipants,
  initialClaims,
  hostParticipantId,
}: Props) {
  const toast = useToast();

  const [items] = useState<Item[]>(initialItems);
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [claims, setClaims] = useState<ItemClaim[]>(initialClaims);

  const [viewerId, setViewerId] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string>("");

  // Optimistic claim state. Client-only until the RPC confirms.
  const pendingClaimTargets = useRef<Set<string>>(new Set());

  // Resolve the viewer's participant id on mount:
  // 1. If ?host= is present and localStorage doesn't have anything, this is the creator.
  // 2. Otherwise pull from localStorage.
  useEffect(() => {
    const stored = getLocalParticipantId(session.id);
    if (stored && participants.some((p) => p.id === stored)) {
      setViewerId(stored);
      return;
    }
    if (hostParticipantId && participants.some((p) => p.id === hostParticipantId)) {
      setLocalParticipantId(session.id, hostParticipantId);
      setViewerId(hostParticipantId);
    }
  }, [session.id, hostParticipantId, participants]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setInviteUrl(`${window.location.origin}/split/${session.id}`);
  }, [session.id]);

  // Realtime subscription. Server-side filtered by session_id on both tables.
  useEffect(() => {
    const supabase = (() => {
      try {
        return getSupabaseBrowserClient();
      } catch {
        return null;
      }
    })();
    if (!supabase) return;

    const channel = supabase
      .channel(`session:${session.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "item_claims",
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          setClaims((prev) => applyClaimEvent(prev, payload));
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "participants",
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          setParticipants((prev) => applyParticipantEvent(prev, payload));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session.id]);

  const viewer = useMemo(
    () => participants.find((p) => p.id === viewerId) ?? null,
    [participants, viewerId],
  );
  const host = useMemo(
    () => participants.find((p) => p.id === session.host_participant_id) ?? null,
    [participants, session.host_participant_id],
  );

  const shares = useMemo(
    () => computeShares(items, claims, participants, session),
    [items, claims, participants, session],
  );
  const viewerShare = viewerId ? shares.get(viewerId) ?? null : null;

  const handleJoin = useCallback(
    async (nickname: string) => {
      setJoining(true);
      const result = await joinSession(session.id, nickname);
      setJoining(false);
      if (!result.ok) {
        toast.show(result.error, "error");
        return;
      }
      const participant = result.data;
      setLocalParticipantId(session.id, participant.id);
      setViewerId(participant.id);
      setParticipants((prev) =>
        prev.some((p) => p.id === participant.id) ? prev : [...prev, participant],
      );
      track("participant_joined");
    },
    [session.id, toast],
  );

  const handleToggleClaim = useCallback(
    async (itemId: string) => {
      if (!viewerId) return;
      const key = `${itemId}:${viewerId}`;
      if (pendingClaimTargets.current.has(key)) return;
      pendingClaimTargets.current.add(key);

      // Optimistic update.
      let didAdd = false;
      setClaims((prev) => {
        const existing = prev.find(
          (c) => c.item_id === itemId && c.participant_id === viewerId,
        );
        if (existing) {
          return prev.filter((c) => c.id !== existing.id);
        }
        didAdd = true;
        return [
          ...prev,
          {
            id: `optimistic-${key}`,
            item_id: itemId,
            participant_id: viewerId,
            session_id: session.id,
          },
        ];
      });

      const result = await toggleClaim(itemId, viewerId, session.id);
      pendingClaimTargets.current.delete(key);
      if (!result.ok) {
        // Rollback.
        setClaims((prev) => {
          if (didAdd) {
            return prev.filter((c) => c.id !== `optimistic-${key}`);
          }
          return [
            ...prev,
            {
              id: `rollback-${key}`,
              item_id: itemId,
              participant_id: viewerId,
              session_id: session.id,
            },
          ];
        });
        toast.show(result.error, "error");
        return;
      }
      track("claim_toggled");
    },
    [session.id, toast, viewerId],
  );

  const handleTogglePaid = useCallback(async () => {
    if (!viewer) return;
    const nextPaid = !viewer.paid_at;
    // Optimistic.
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === viewer.id ? { ...p, paid_at: nextPaid ? new Date().toISOString() : null } : p,
      ),
    );
    const result = await markPaid(viewer.id, nextPaid);
    if (!result.ok) {
      // Rollback.
      setParticipants((prev) =>
        prev.map((p) => (p.id === viewer.id ? { ...p, paid_at: viewer.paid_at } : p)),
      );
      toast.show(result.error, "error");
      return;
    }
    track("paid_marked", { state: nextPaid });
  }, [toast, viewer]);

  const needsJoin = viewerId === null;

  const onOpenPay = () => {
    track("pay_host_opened");
    setPayOpen(true);
  };

  return (
    <>
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-4 pb-40 pt-4 lg:max-w-5xl lg:px-8 lg:pb-8">
        <RoomHeader
          session={session}
          participants={participants}
          inviteUrl={inviteUrl}
          onOpenQr={() => setQrOpen(true)}
        />

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-8">
          <div className="space-y-5">
            <BillLedger
              session={session}
              items={items}
              participants={participants}
              claims={claims}
              viewerId={viewerId}
              onToggleClaim={handleToggleClaim}
            />
            {/* Mobile: participants list stacks under the ledger */}
            <div className="lg:hidden">
              <ParticipantsPanel session={session} participants={participants} />
            </div>
          </div>

          {/* Desktop right rail: sticky summary + participants */}
          <aside className="hidden space-y-4 lg:sticky lg:top-4 lg:block">
            <SummaryDock
              session={session}
              share={viewerShare}
              paid={Boolean(viewer?.paid_at)}
              onOpenPay={onOpenPay}
              onTogglePaid={handleTogglePaid}
              variant="inline"
            />
            <ParticipantsPanel session={session} participants={participants} />
          </aside>
        </div>
      </main>

      {/* Mobile-only fixed dock */}
      <SummaryDock
        session={session}
        share={viewerShare}
        paid={Boolean(viewer?.paid_at)}
        onOpenPay={onOpenPay}
        onTogglePaid={handleTogglePaid}
      />

      <JoinTableModal open={needsJoin} onJoin={handleJoin} submitting={joining} />
      <QrModal open={qrOpen} onClose={() => setQrOpen(false)} url={inviteUrl} />
      <PayHostModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        session={session}
        amount={viewerShare?.total ?? 0}
        viewer={viewer}
        host={host}
      />
    </>
  );
}

// Realtime helpers. Payload shape follows Supabase postgres_changes.
type ClaimPayload = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Partial<ItemClaim> | null;
  old: Partial<ItemClaim> | null;
};

function applyClaimEvent(prev: ItemClaim[], payload: unknown): ItemClaim[] {
  const p = payload as ClaimPayload;
  if (p.eventType === "INSERT" && p.new?.id) {
    if (prev.some((c) => c.id === p.new!.id)) return prev;
    // Also drop any optimistic entry for the same (item, participant) pair.
    const filtered = prev.filter(
      (c) => !(c.item_id === p.new!.item_id && c.participant_id === p.new!.participant_id && c.id.startsWith("optimistic-")),
    );
    return [...filtered, p.new as ItemClaim];
  }
  if (p.eventType === "DELETE" && p.old?.id) {
    return prev.filter((c) => c.id !== p.old!.id);
  }
  if (p.eventType === "UPDATE" && p.new?.id) {
    return prev.map((c) => (c.id === p.new!.id ? { ...c, ...(p.new as ItemClaim) } : c));
  }
  return prev;
}

type ParticipantPayload = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Partial<Participant> | null;
  old: Partial<Participant> | null;
};

function applyParticipantEvent(prev: Participant[], payload: unknown): Participant[] {
  const p = payload as ParticipantPayload;
  if (p.eventType === "INSERT" && p.new?.id) {
    if (prev.some((x) => x.id === p.new!.id)) return prev;
    return [...prev, p.new as Participant];
  }
  if (p.eventType === "DELETE" && p.old?.id) {
    return prev.filter((x) => x.id !== p.old!.id);
  }
  if (p.eventType === "UPDATE" && p.new?.id) {
    return prev.map((x) => (x.id === p.new!.id ? { ...x, ...(p.new as Participant) } : x));
  }
  return prev;
}
