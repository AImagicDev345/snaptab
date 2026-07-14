"use client";

import QRCode from "qrcode";

// Returns an SVG string sized for the invite modal. We use SVG (not canvas)
// so the QR crisp-scales on every phone density and copies cleanly if the
// user screenshots it.
export async function generateInviteQrSvg(url: string): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    color: {
      dark: "#f5f5f5",
      light: "#0a0a0a",
    },
    width: 256,
  });
}
