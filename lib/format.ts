// Currency + nickname helpers.

export function formatMoney(amount: number, currencyCode = "USD", locale?: string): string {
  const detectedLocale =
    locale ??
    (typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US");
  try {
    return new Intl.NumberFormat(detectedLocale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Invalid currency code → fall back to a plain USD-style format.
    return `$${amount.toFixed(2)}`;
  }
}

export function detectCurrencyCode(): string {
  if (typeof navigator === "undefined" || !navigator.language) return "USD";
  try {
    const parts = new Intl.NumberFormat(navigator.language, {
      style: "currency",
      currency: "USD",
    }).resolvedOptions();
    // The above returns "USD" as-provided; a smarter lookup can key off the region.
    const region = navigator.language.split("-")[1]?.toUpperCase();
    const regionToCurrency: Record<string, string> = {
      US: "USD",
      GB: "GBP",
      EU: "EUR",
      DE: "EUR",
      FR: "EUR",
      ES: "EUR",
      IT: "EUR",
      IN: "INR",
      JP: "JPY",
      CN: "CNY",
      AU: "AUD",
      CA: "CAD",
      NZ: "NZD",
      SG: "SGD",
      HK: "HKD",
      CH: "CHF",
      SE: "SEK",
      NO: "NOK",
      DK: "DKK",
      BR: "BRL",
      MX: "MXN",
      ZA: "ZAR",
      AE: "AED",
    };
    if (region && regionToCurrency[region]) return regionToCurrency[region];
    return parts.currency ?? "USD";
  } catch {
    return "USD";
  }
}

export function initialsFromNickname(nickname: string): string {
  const base = nickname.replace(/#\d+$/, "").trim();
  if (!base) return "?";
  const parts = base.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || base[0]!.toUpperCase();
}

// Deterministic HSL from a string — used for InitialsBadge backgrounds.
export function nicknameToHsl(nickname: string): string {
  let hash = 0;
  for (let i = 0; i < nickname.length; i++) {
    hash = (hash << 5) - hash + nickname.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 60% 40%)`;
}
