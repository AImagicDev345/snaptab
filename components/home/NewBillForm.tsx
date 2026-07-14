"use client";

import { useMemo, useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";

import { createSessionAndRedirect } from "@/app/actions/sessions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { useToast } from "@/components/ui/Toast";
import { track } from "@/lib/analytics";
import { detectCurrencyCode } from "@/lib/format";
import { setLocalParticipantId } from "@/lib/localParticipant";

import { ItemsEditor, type ItemDraft } from "./ItemsEditor";

function currencySymbol(code: string): string {
  try {
    const parts = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value ?? code;
  } catch {
    return code;
  }
}

function fresh(index: number): ItemDraft {
  return {
    key: `new-${index}-${Date.now()}`,
    name: "",
    price: "",
    is_shared: false,
  };
}

export function NewBillForm() {
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const defaultCurrency = useMemo(() => detectCurrencyCode(), []);
  const [currencyCode, setCurrencyCode] = useState<string>(defaultCurrency);
  const [title, setTitle] = useState<string>("");
  const [hostNickname, setHostNickname] = useState<string>("");
  const [tax, setTax] = useState<string>("");
  const [tip, setTip] = useState<string>("");
  const [deliveryFee, setDeliveryFee] = useState<string>("");
  const [items, setItems] = useState<ItemDraft[]>([fresh(0), fresh(1)]);

  const [showHandles, setShowHandles] = useState(false);
  const [venmo, setVenmo] = useState("");
  const [cashapp, setCashapp] = useState("");
  const [upi, setUpi] = useState("");
  const [paypal, setPaypal] = useState("");

  const symbol = useMemo(() => currencySymbol(currencyCode), [currencyCode]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const cleanedItems = items
      .map((item) => ({
        name: item.name.trim(),
        price: Number(item.price),
        is_shared: item.is_shared,
      }))
      .filter((item) => item.name && Number.isFinite(item.price) && item.price > 0);

    if (cleanedItems.length === 0) {
      toast.show("Add at least one item with a name and price.", "error");
      return;
    }

    startTransition(async () => {
      const result = await createSessionAndRedirect({
        title: title.trim() || "Dinner",
        tax: Number(tax) || 0,
        tip: Number(tip) || 0,
        deliveryFee: Number(deliveryFee) || 0,
        currencyCode,
        hostNickname: hostNickname.trim() || "Host",
        paymentHandles: {
          venmo: venmo.trim() || undefined,
          cashapp: cashapp.trim() || undefined,
          upi: upi.trim() || undefined,
          paypal: paypal.trim() || undefined,
        },
        items: cleanedItems,
      });
      // The action redirects on success. If we're still here, an error occurred.
      if (result && !result.ok) {
        toast.show(result.error, "error");
        return;
      }
      // If the redirect went through, the browser is already navigating. Track + persist
      // participantId is handled on the room page via the ?host= query param.
      track("session_created");
      // Placeholder: nothing to persist here since we don't have the id anymore.
    });
  }

  // On mount, if we already know a currency, expose that so the form doesn't re-render.
  // We also expose a helper to persist the participant id when we later know it.
  function storeHostParticipant(sessionId: string, participantId: string) {
    setLocalParticipantId(sessionId, participantId);
  }
  void storeHostParticipant; // referenced from room page via URL param — kept here to remind future maintainers

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Bill title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Friday dinner"
          maxLength={60}
        />
        <Input
          label="Your nickname"
          value={hostNickname}
          onChange={(e) => setHostNickname(e.target.value)}
          placeholder="e.g. Alex"
          maxLength={24}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <NumberInput
          label="Tax"
          value={tax}
          onChange={(e) => setTax(e.target.value)}
          prefix={symbol}
          placeholder="0"
        />
        <NumberInput
          label="Tip"
          value={tip}
          onChange={(e) => setTip(e.target.value)}
          prefix={symbol}
          placeholder="0"
        />
        <NumberInput
          label="Delivery"
          value={deliveryFee}
          onChange={(e) => setDeliveryFee(e.target.value)}
          prefix={symbol}
          placeholder="0"
        />
      </div>
      <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-fg-muted">
        <span>Currency</span>
        <input
          value={currencyCode}
          onChange={(e) => setCurrencyCode(e.target.value.toUpperCase().slice(0, 4))}
          className="w-16 rounded-lg border border-line bg-surface-strong px-2 py-1 text-right text-fg focus:border-accent focus:outline-none"
          aria-label="Currency code"
        />
      </div>

      <div>
        <div className="mb-2 text-sm font-medium text-fg">Items</div>
        <ItemsEditor items={items} onChange={setItems} currencySymbol={symbol} />
      </div>

      <details
        open={showHandles}
        onToggle={(event) => setShowHandles((event.target as HTMLDetailsElement).open)}
        className="rounded-2xl border border-line bg-surface p-3"
      >
        <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-fg">
          Payment handles <span className="text-fg-subtle">optional</span>
          <ChevronDown className="h-4 w-4 text-fg-muted transition-transform" />
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Input label="Venmo" value={venmo} onChange={(e) => setVenmo(e.target.value)} placeholder="@handle" maxLength={64} />
          <Input label="Cash App" value={cashapp} onChange={(e) => setCashapp(e.target.value)} placeholder="$cashtag" maxLength={64} />
          <Input label="UPI" value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="name@bank" maxLength={64} />
          <Input label="PayPal.me" value={paypal} onChange={(e) => setPaypal(e.target.value)} placeholder="handle" maxLength={64} />
        </div>
        <p className="mt-2 text-xs text-fg-subtle">
          Payers will see these as one-tap deep links. Anything you leave blank simply won&apos;t show up.
        </p>
      </details>

      <Button type="submit" disabled={pending} fullWidth>
        {pending ? "Creating..." : "Create bill"}
      </Button>
    </form>
  );
}
