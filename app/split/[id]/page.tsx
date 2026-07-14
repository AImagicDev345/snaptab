import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RoomClient } from "./RoomClient";
import { getSupabaseServerAnon } from "@/lib/supabase/server";
import type { Item, ItemClaim, Participant, Session } from "@/types";

type Params = { id: string };

type SearchParams = { host?: string };

async function loadRoomData(sessionId: string) {
  const supabase = getSupabaseServerAnon();
  const [sessionRes, itemsRes, participantsRes, claimsRes] = await Promise.all([
    supabase.from("sessions").select("*").eq("id", sessionId).maybeSingle(),
    supabase.from("items").select("*").eq("session_id", sessionId).order("created_at"),
    supabase
      .from("participants")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at"),
    supabase.from("item_claims").select("*").eq("session_id", sessionId),
  ]);

  if (sessionRes.error || !sessionRes.data) return null;

  const numify = <T extends { total_tax?: unknown; total_tip?: unknown; total_delivery_fee?: unknown; price?: unknown }>(row: T) => row;
  void numify;

  const session = normalizeSession(sessionRes.data);
  const items = (itemsRes.data ?? []).map(normalizeItem);
  const participants = (participantsRes.data ?? []) as Participant[];
  const claims = (claimsRes.data ?? []) as ItemClaim[];
  return { session, items, participants, claims };
}

function normalizeSession(row: Record<string, unknown>): Session {
  return {
    id: row.id as string,
    title: row.title as string,
    total_tax: Number(row.total_tax ?? 0),
    total_tip: Number(row.total_tip ?? 0),
    total_delivery_fee: Number(row.total_delivery_fee ?? 0),
    currency_code: (row.currency_code as string) ?? "USD",
    status: (row.status as Session["status"]) ?? "active",
    host_participant_id: (row.host_participant_id as string | null) ?? null,
    payment_handles: (row.payment_handles as Session["payment_handles"]) ?? {},
    created_at: row.created_at as string,
  };
}

function normalizeItem(row: Record<string, unknown>): Item {
  return {
    id: row.id as string,
    session_id: row.session_id as string,
    name: row.name as string,
    price: Number(row.price ?? 0),
    is_shared: Boolean(row.is_shared),
    created_at: row.created_at as string,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await loadRoomData(id).catch(() => null);
  const title = data?.session.title ?? "Split a bill";
  return {
    title: `${title} · SnapTab`,
    description: "Tap the items you ordered. SnapTab does the math.",
    robots: { index: false, follow: false }, // rooms are unlisted; keep them out of search
    alternates: { canonical: `/split/${id}` },
    openGraph: {
      title: `${title} · SnapTab`,
      description: "Tap the items you ordered. SnapTab does the math.",
      url: `/split/${id}`,
      type: "website",
    },
  };
}

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { id } = await params;
  const { host } = await searchParams;

  const data = await loadRoomData(id);
  if (!data) notFound();

  return (
    <RoomClient
      session={data.session}
      initialItems={data.items}
      initialParticipants={data.participants}
      initialClaims={data.claims}
      hostParticipantId={host ?? null}
    />
  );
}
