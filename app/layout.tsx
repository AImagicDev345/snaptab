import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { PostHogClient } from "@/components/analytics/PostHogClient";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://snaptab.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "SnapTab — Split the pizza, not the vibe.",
    template: "%s · SnapTab",
  },
  description: "Zero-login bill splitting. Type the bill, share the link, everyone taps what they ordered.",
  applicationName: "SnapTab",
  keywords: ["bill splitter", "split bill", "no login", "restaurant split", "group payment"],
  authors: [{ name: "SnapTab" }],
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    siteName: "SnapTab",
    url: appUrl,
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

// Runs synchronously before React hydration so the correct theme paints on first frame — no flash.
const themeBoot = `
try {
  var s = localStorage.getItem('snaptab:theme');
  var dark = s === 'dark' || (s !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (dark) document.documentElement.classList.add('dark');
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body className="font-sans antialiased">
        <PostHogClient />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
