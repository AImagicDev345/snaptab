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
    <section aria-labelledby="faq-heading" className="space-y-2">
      <h2 id="faq-heading" className="text-xl font-semibold text-neutral-100">
        FAQ
      </h2>
      <div className="space-y-2">
        {items.map((item) => (
          <details key={item.q} className="group rounded-2xl border border-neutral-800 bg-neutral-900/60 px-4 py-3">
            <summary className="cursor-pointer list-none text-sm font-medium text-neutral-100 marker:hidden">
              {item.q}
            </summary>
            <p className="mt-2 text-sm text-neutral-400">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
