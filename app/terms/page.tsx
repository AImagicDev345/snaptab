import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";

import { renderMarkdown } from "@/lib/renderMarkdown";

export const metadata: Metadata = {
  title: "Terms",
  description: "SnapTab terms of use.",
  alternates: { canonical: "/terms" },
};

async function loadTerms() {
  const filePath = path.join(process.cwd(), "TERMS.md");
  return readFile(filePath, "utf8");
}

export default async function TermsPage() {
  const md = await loadTerms();
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
