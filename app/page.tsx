import type { Metadata } from "next";

import { Faq } from "@/components/home/Faq";
import { Footer } from "@/components/home/Footer";
import { HowItWorks } from "@/components/home/HowItWorks";
import { NewBillForm } from "@/components/home/NewBillForm";

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
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-8 px-4 pb-8 pt-6 safe-pt">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-neutral-950 font-black">
            S
          </span>
          <span className="text-lg font-semibold tracking-tight">SnapTab</span>
        </div>
        <h1 className="text-3xl font-black leading-tight text-neutral-100">
          Split the pizza,
          <br />
          <span className="text-amber-400">not the vibe.</span>
        </h1>
        <p className="text-sm text-neutral-400">
          Type the bill, share the link, everyone taps what they ordered. No logins. No app store.
        </p>
      </header>

      <section aria-labelledby="new-bill-heading" className="space-y-3">
        <h2 id="new-bill-heading" className="sr-only">
          Create a new bill
        </h2>
        <NewBillForm />
      </section>

      <HowItWorks />
      <Faq />
      <Footer />
    </main>
  );
}
