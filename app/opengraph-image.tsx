import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "SnapTab — Split the pizza, not the vibe.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          color: "#f5f5f5",
          padding: 72,
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "#f59e0b",
              color: "#0a0a0a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              fontWeight: 900,
            }}
          >
            S
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#e5e5e5" }}>SnapTab</div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 88, fontWeight: 900, lineHeight: 1 }}>Split the pizza,</div>
          <div style={{ fontSize: 88, fontWeight: 900, lineHeight: 1, color: "#fbbf24" }}>not the vibe.</div>
          <div style={{ fontSize: 28, color: "#a3a3a3", marginTop: 20 }}>
            Zero-login bill splitting. No accounts. No app store. No fees.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
