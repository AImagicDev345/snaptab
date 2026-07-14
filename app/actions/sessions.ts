"use server";

import "server-only";

import { redirect } from "next/navigation";

import { getSupabaseServiceRole } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/rateLimit";
import type { ActionResult, CreateSessionInput } from "@/types";

import {
  validateCurrencyCode,
  validateItemName,
  validateMoney,
  validateNickname,
  validatePaymentHandles,
  validateTitle,
} from "./_validate";

const MAX_ITEMS = 50;

type CreateSessionResult = {
  sessionId: string;
  hostParticipantId: string;
};

export async function createSession(
  input: CreateSessionInput,
): Promise<ActionResult<CreateSessionResult>> {
  const gate = await enforceRateLimit("createSession");
  if (!gate.ok) return { ok: false, error: gate.error };

  try {
    const title = validateTitle(input.title);
    const tax = validateMoney(input.tax, "Tax");
    const tip = validateMoney(input.tip, "Tip");
    const deliveryFee = validateMoney(input.deliveryFee, "Delivery fee");
    const currencyCode = validateCurrencyCode(input.currencyCode);
    const hostNickname = validateNickname(input.hostNickname);
    const paymentHandles = validatePaymentHandles(input.paymentHandles);

    if (!Array.isArray(input.items) || input.items.length < 1) {
      return { ok: false, error: "Add at least one item." };
    }
    if (input.items.length > MAX_ITEMS) {
      return { ok: false, error: `Max ${MAX_ITEMS} items per bill.` };
    }

    const items = input.items.map((item) => ({
      name: validateItemName(item.name),
      price: validateMoney(item.price, "Item price"),
      is_shared: Boolean(item.is_shared),
    }));

    const supabase = getSupabaseServiceRole();
    const { data, error } = await supabase.rpc("create_session_with_items", {
      p_title: title,
      p_tax: tax,
      p_tip: tip,
      p_delivery: deliveryFee,
      p_currency: currencyCode,
      p_host_nickname: hostNickname,
      p_payment_handles: paymentHandles,
      p_items: items,
    });

    if (error) {
      return { ok: false, error: error.message };
    }
    // Supabase returns the `returns table` shape as an array of rows.
    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.session_id || !row?.host_participant_id) {
      return { ok: false, error: "Could not create the session. Try again." };
    }
    return {
      ok: true,
      data: {
        sessionId: row.session_id as string,
        hostParticipantId: row.host_participant_id as string,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

// A wrapper that performs the create + redirect for form submissions.
export async function createSessionAndRedirect(input: CreateSessionInput): Promise<ActionResult<null>> {
  const result = await createSession(input);
  if (!result.ok) return result;
  redirect(`/split/${result.data.sessionId}?host=${result.data.hostParticipantId}`);
}
