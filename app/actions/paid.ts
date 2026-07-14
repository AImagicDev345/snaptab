"use server";

import "server-only";

import { getSupabaseServiceRole } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/rateLimit";
import type { ActionResult } from "@/types";

export async function markPaid(
  participantId: string,
  paid: boolean,
): Promise<ActionResult<null>> {
  const gate = await enforceRateLimit("markPaid");
  if (!gate.ok) return { ok: false, error: gate.error };

  if (!participantId) return { ok: false, error: "Missing participant." };

  const supabase = getSupabaseServiceRole();
  const { error } = await supabase
    .from("participants")
    .update({ paid_at: paid ? new Date().toISOString() : null })
    .eq("id", participantId);
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: null };
}
