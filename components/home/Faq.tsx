const items = [
  {
    q: "Do I need to sign up?",
    a: "No. SnapTab is zero-login. You get a shareable link and everyone joins with a nickname.",
  },
  {
    q: "Is it free?",
    a: "Yes. There are no ads, no accounts, and no fees. SnapTab is not a payment processor — it just calculates who owes what and hands you deep links to Venmo / Cash App / UPI / PayPal.",
  },
  {
    q: "How long is my bill kept around?",
    a: "Sessions auto-delete 30 days after creation. If you need it longer, take a screenshot.",
  },
  {
    q: "What if two of us have the same name?",
    a: "SnapTab automatically appends #2, #3, etc. so nobody claims the wrong item by mistake.",
  },
  {
    q: "Can I edit a bill after creating it?",
    a: "Not in this version. If you make a mistake, the fastest fix is to create a new bill and share the fresh link.",
  },
];

export function Faq() {
  return (
    <section aria-labelledby="faq-heading" className="space-y-3">
      <h2 id="faq-heading" className="text-xl font-semibold text-fg lg:text-2xl">
        FAQ
      </h2>
      <div className="space-y-2">
        {items.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-line bg-surface px-4 py-3 open:bg-surface-strong"
          >
            <summary className="cursor-pointer list-none text-sm font-medium text-fg marker:hidden">
              {item.q}
            </summary>
            <p className="mt-2 text-sm text-fg-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
