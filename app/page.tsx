import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { Faq } from "@/components/home/Faq";
import { Footer } from "@/components/home/Footer";
import { HowItWorks } from "@/components/home/HowItWorks";
import { NewBillForm } from "@/components/home/NewBillForm";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const metadata: Metadata = {
  title: "SnapTab — Split the pizza, not the vibe.",
  description:
    "Zero-login bill splitting. Type the bill, share the link, everyone taps what they ordered. No accounts, no downloads, no fees.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "SnapTab — Split the pizza, not the vibe.",
    description:
      "Zero-login bill splitting. Type the bill, share the link, everyone taps what they ordered.",
    url: "/",
    siteName: "SnapTab",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <main className="min-h-dvh">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 pb-8 pt-6 safe-pt lg:max-w-6xl lg:gap-16 lg:px-10 lg:pt-10">
        <SiteHeader />

        <section
          aria-labelledby="hero-heading"
          className="lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-12"
        >
          <div className="space-y-4 lg:space-y-6 lg:pt-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-fg-muted">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Free · No accounts · No app
            </span>
            <h1
              id="hero-heading"
              className="text-4xl font-black leading-[1.05] tracking-tight text-fg sm:text-5xl lg:text-6xl"
            >
              Split the pizza,
              <br />
              <span className="text-accent">not the vibe.</span>
            </h1>
            <p className="max-w-xl text-base text-fg-muted lg:text-lg">
              Type the bill, share the link, everyone taps what they ordered. SnapTab
              calculates who owes what — and hands you a one-tap Venmo, Cash App, UPI or
              PayPal link.
            </p>
            <ul className="hidden gap-2 text-sm text-fg-muted lg:grid lg:grid-cols-2">
              <li className="flex items-start gap-2">
                <Dot /> Works instantly on any phone or laptop
              </li>
              <li className="flex items-start gap-2">
                <Dot /> Handles tax, tip, delivery + shared items
              </li>
              <li className="flex items-start gap-2">
                <Dot /> Live updates as friends tap what they had
              </li>
              <li className="flex items-start gap-2">
                <Dot /> No login. Ever.
              </li>
            </ul>
          </div>

          <div className="mt-6 lg:mt-0">
            <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm lg:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-fg">Create a bill</h2>
                <span className="text-xs text-fg-subtle">Takes ~30 seconds</span>
              </div>
              <NewBillForm />
            </div>
          </div>
        </section>

        <HowItWorks />

        <Faq />

        <Footer />
      </div>
    </main>
  );
}

function SiteHeader() {
  return (
    <header className="flex items-center justify-between">
      <div className="inline-flex items-center gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-fg font-black lg:h-10 lg:w-10">
          S
        </span>
        <span className="text-lg font-semibold tracking-tight text-fg lg:text-xl">SnapTab</span>
      </div>
      <div className="flex items-center gap-2">
        <a
          href="#hero-heading"
          className="hidden text-sm text-fg-muted hover:text-fg lg:inline"
        >
          Get started
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}

function Dot() {
  return (
    <span
      aria-hidden
      className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
    />
  );
}
