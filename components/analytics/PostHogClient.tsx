"use client";

import { useEffect } from "react";

import { initAnalytics } from "@/lib/analytics";

// Kick PostHog off once on the client. It's a no-op if the env key is missing.
export function PostHogClient() {
  useEffect(() => {
    initAnalytics();
  }, []);
  return null;
}
