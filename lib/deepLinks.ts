import type { PaymentHandles } from "@/types";

export type DeepLinkProvider = "venmo" | "cashapp" | "upi" | "paypal";

export type DeepLinkArgs = {
  amount: number;
  note: string;
  currency: string;
  payeeName: string;
};

export function buildDeepLink(
  provider: DeepLinkProvider,
  handle: string,
  { amount, note, currency, payeeName }: DeepLinkArgs,
): string | null {
  const amt = amount.toFixed(2);
  const trimmedHandle = handle.trim().replace(/^@/, "").replace(/^\$/, "");
  if (!trimmedHandle) return null;

  switch (provider) {
    case "venmo":
      // App-only scheme; the browser prompts to open Venmo.
      return `venmo://paycharge?txn=pay&recipients=${encodeURIComponent(trimmedHandle)}&amount=${amt}&note=${encodeURIComponent(note)}`;
    case "cashapp":
      // Web + app deep link.
      return `https://cash.app/$${encodeURIComponent(trimmedHandle)}/${amt}`;
    case "upi":
      // Standard UPI scheme used across GPay / PhonePe / Paytm on Android.
      return `upi://pay?pa=${encodeURIComponent(trimmedHandle)}&pn=${encodeURIComponent(payeeName)}&am=${amt}&tn=${encodeURIComponent(note)}&cu=${encodeURIComponent(currency)}`;
    case "paypal":
      // PayPal.me — no amount validation on their side, we still include it.
      return `https://paypal.me/${encodeURIComponent(trimmedHandle)}/${amt}${encodeURIComponent(currency)}`;
    default:
      return null;
  }
}

export function availableProviders(handles: PaymentHandles): DeepLinkProvider[] {
  const out: DeepLinkProvider[] = [];
  if (handles.venmo) out.push("venmo");
  if (handles.cashapp) out.push("cashapp");
  if (handles.upi) out.push("upi");
  if (handles.paypal) out.push("paypal");
  return out;
}

export const PROVIDER_LABELS: Record<DeepLinkProvider, string> = {
  venmo: "Venmo",
  cashapp: "Cash App",
  upi: "UPI",
  paypal: "PayPal",
};
