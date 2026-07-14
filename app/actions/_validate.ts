import "server-only";

// Lightweight inline validation — no zod dep. Kept tiny and colocated with the actions.

export function validateTitle(input: unknown): string {
  if (typeof input !== "string") throw new Error("Title is required.");
  const trimmed = input.trim();
  if (trimmed.length < 1 || trimmed.length > 60) throw new Error("Title must be 1–60 characters.");
  return trimmed;
}

export function validateNickname(input: unknown): string {
  if (typeof input !== "string") throw new Error("Nickname is required.");
  const trimmed = input.trim();
  if (trimmed.length < 1 || trimmed.length > 24) throw new Error("Nickname must be 1–24 characters.");
  return trimmed;
}

export function validateItemName(input: unknown): string {
  if (typeof input !== "string") throw new Error("Item name is required.");
  const trimmed = input.trim();
  if (trimmed.length < 1 || trimmed.length > 60) throw new Error("Item name must be 1–60 characters.");
  return trimmed;
}

export function validateMoney(input: unknown, label: string): number {
  const n = typeof input === "number" ? input : Number(input);
  if (!Number.isFinite(n) || Number.isNaN(n)) throw new Error(`${label} must be a number.`);
  if (n < 0) throw new Error(`${label} can't be negative.`);
  if (n > 99999.99) throw new Error(`${label} is too large.`);
  return Math.round(n * 100) / 100;
}

export function validateCurrencyCode(input: unknown): string {
  if (typeof input !== "string") return "USD";
  const code = input.trim().toUpperCase();
  if (code.length < 2 || code.length > 8) return "USD";
  return code;
}

export function validatePaymentHandles(input: unknown): {
  venmo?: string;
  cashapp?: string;
  upi?: string;
  paypal?: string;
} {
  if (!input || typeof input !== "object") return {};
  const record = input as Record<string, unknown>;
  const clean = (v: unknown): string | undefined => {
    if (typeof v !== "string") return undefined;
    const trimmed = v.trim();
    if (!trimmed) return undefined;
    if (trimmed.length > 64) return undefined;
    return trimmed;
  };
  return {
    venmo: clean(record.venmo),
    cashapp: clean(record.cashapp),
    upi: clean(record.upi),
    paypal: clean(record.paypal),
  };
}
