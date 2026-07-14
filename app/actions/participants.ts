"use server";

import "server-only";

import { getSupabaseServiceRole } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/rateLimit";
import type { ActionResult, Participant } from "@/types";

import { validateNickname } from "./_validate";

const MAX_PARTICIPANTS = 30;

export async function joinSession(
  sessionId: string,
  nickname: string,
): Promise<ActionResult<Participant>> {
  const gate = await enforceRateLimit("joinSession");
  if (!gate.ok) return { ok: false, error: gate.error };

  try {
    if (typeof sessionId !== "string" || sessionId.length < 8) {
      return { ok: false, error: "Invalid session." };
    }
    const cleanNickname = validateNickname(nickname);
    const supabase = getSupabaseServiceRole();

    // Cap participants per session.
    const { count, error: countError } = await supabase
      .from("participants")
      .select("id", { count: "exact", head: true })
      .eq("session_id", sessionId);
    if (countError) return { ok: false, error: countError.message };
    if ((count ?? 0) >= MAX_PARTICIPANTS) {
      return { ok: false, error: "This bill is at its participant limit." };
    }

    // Resolve nickname collisions by appending #N.
    const { data: existing, error: existingError } = await supabase
      .from("participants")
      .select("nickname")
      .eq("session_id", sessionId);
    if (existingError) return { ok: false, error: existingError.message };

    const taken = new Set((existing ?? []).map((row: { nickname: string }) => row.nickname));
    let finalNickname = cleanNickname;
    if (taken.has(finalNickname)) {
      let suffix = 2;
      while (taken.has(`${cleanNickname}#${suffix}`)) suffix++;
      finalNickname = `${cleanNickname}#${suffix}`;
    }

    const { data, error } = await supabase
      .from("participants")
      .insert({ session_id: sessionId, nickname: finalNickname })
      .select()
      .single();
    if (error) return { ok: false, error: error.message };
    return { ok: true, data: data as Participant };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
  }
}
