import { Camera, Link2, HandCoins } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Type in the bill",
    body: "Add items, tax, tip, delivery. Mark shared things like an appetizer.",
  },
  {
    icon: Link2,
    title: "Share the link",
    body: "Send the link or QR to everyone. They open it — no login, no download.",
  },
  {
    icon: HandCoins,
    title: "Tap and pay",
    body: "Everyone taps what they ordered. Your share and the host's payment link show up automatically.",
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="space-y-4">
      <h2 id="how-heading" className="text-xl font-semibold text-neutral-100">
        How it works
      </h2>
      <ol className="space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={step.title} className="flex gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
                  <span className="text-neutral-500">{index + 1}.</span>
                  {step.title}
                </div>
                <p className="text-sm text-neutral-400">{step.body}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
