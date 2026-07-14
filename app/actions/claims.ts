"use server";

import "server-only";

import { getSupabaseServiceRole } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/rateLimit";
import type { ActionResult } from "@/types";

export async function toggleClaim(
  itemId: string,
  participantId: string,
  sessionId: string,
): Promise<ActionResult<null>> {
  const gate = await enforceRateLimit("toggleClaim");
  if (!gate.ok) return { ok: false, error: gate.error };

  if (!itemId || !participantId || !sessionId) {
    return { ok: false, error: "Missing identifiers." };
  }

  const supabase = getSupabaseServiceRole();
  const { error } = await supabase.rpc("toggle_claim", {
    p_item_id: itemId,
    p_participant_id: participantId,
    p_session_id: sessionId,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: null };
}
