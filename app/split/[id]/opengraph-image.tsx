import { ImageResponse } from "next/og";

import { getSupabaseServerAnon } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const alt = "SnapTab bill";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({ params }: { params: { id: string } }) {
  let title = "Split a bill";
  try {
    const supabase = getSupabaseServerAnon();
    const { data } = await supabase.from("sessions").select("title").eq("id", params.id).maybeSingle();
    if (data?.title) title = data.title as string;
  } catch {
    // If the DB is unreachable we still return a valid image below.
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          color: "#f5f5f5",
          display: "flex",
          flexDirection: "column",
          padding: 72,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#f59e0b",
              color: "#0a0a0a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 900,
            }}
          >
            S
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#e5e5e5" }}>SnapTab</div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 40, color: "#a3a3a3" }}>You&apos;re invited to split</div>
          <div style={{ fontSize: 84, fontWeight: 900, color: "#fbbf24", lineHeight: 1 }}>{title}</div>
          <div style={{ fontSize: 28, color: "#737373", marginTop: 16 }}>Tap the items you ordered — SnapTab does the math.</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
