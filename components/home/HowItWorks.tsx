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
      <div className="space-y-1">
        <h2 id="how-heading" className="text-xl font-semibold text-fg lg:text-2xl">
          How it works
        </h2>
        <p className="hidden text-sm text-fg-muted lg:block">
          Three steps. No login, no app store, no waiting on anyone.
        </p>
      </div>
      <ol className="grid gap-3 lg:grid-cols-3 lg:gap-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li
              key={step.title}
              className="flex gap-3 rounded-2xl border border-line bg-surface p-3 lg:flex-col lg:gap-4 lg:p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent lg:h-12 lg:w-12">
                <Icon className="h-5 w-5 lg:h-6 lg:w-6" aria-hidden />
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-fg lg:text-base">
                  <span className="text-fg-subtle">{index + 1}.</span>
                  {step.title}
                </div>
                <p className="mt-1 text-sm text-fg-muted">{step.body}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
