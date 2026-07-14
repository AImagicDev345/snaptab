import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
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
    <main className="min-h-dvh">
      <div className="mx-auto w-full max-w-md space-y-3 px-4 pb-10 pt-6 safe-pt lg:max-w-3xl lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-fg font-black">
              S
            </span>
            <span className="font-semibold text-fg">SnapTab</span>
          </Link>
          <ThemeToggle />
        </div>
        {renderMarkdown(md)}
        <p className="pt-4">
          <Link href="/" className="text-sm text-accent hover:text-accent-strong">
            &larr; Back to SnapTab
          </Link>
        </p>
      </div>
    </main>
  );
}
