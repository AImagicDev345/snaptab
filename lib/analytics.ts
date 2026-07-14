"use client";

import posthog from "posthog-js";

// PostHog analytics wrapper. Anonymous by default — we never identify users.
// Every event goes through `track()` so we can add sanity guards in one place.

export const EVENTS = {
  session_created: "session_created",
  participant_joined: "participant_joined",
  claim_toggled: "claim_toggled",
  pay_host_opened: "pay_host_opened",
  link_copied: "link_copied",
  qr_opened: "qr_opened",
  paid_marked: "paid_marked",
  deep_link_clicked: "deep_link_clicked",
} as const;

export type SnapTabEvent = keyof typeof EVENTS;

let initialized = false;

export function initAnalytics() {
  if (initialized || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return; // PostHog optional — the app runs fine without it.
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
  posthog.init(key, {
    api_host: host,
    person_profiles: "identified_only", // stay anonymous
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false,
  });
  initialized = true;
}

export function track(event: SnapTabEvent, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!initialized) return;
  try {
    posthog.capture(EVENTS[event], properties);
  } catch {
    // Never let analytics failures break the app.
  }
}
