import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";

import { renderMarkdown } from "@/lib/renderMarkdown";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What SnapTab stores and for how long.",
  alternates: { canonical: "/privacy" },
};

async function loadPrivacy() {
  const filePath = path.join(process.cwd(), "PRIVACY.md");
  return readFile(filePath, "utf8");
}

export default async function PrivacyPage() {
  const md = await loadPrivacy();
  return (
    <main className="mx-auto min-h-dvh max-w-md space-y-3 px-4 pb-10 pt-6 safe-pt">
      {renderMarkdown(md)}
      <p className="pt-4">
        <Link href="/" className="text-sm text-amber-400 hover:text-amber-300">
          &larr; Back to SnapTab
        </Link>
      </p>
    </main>
  );
}
