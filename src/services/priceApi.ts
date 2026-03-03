export interface LiveQuote {
  regularMarketPrice: number;
  currency: string;
  shortName?: string;
  longName?: string;
}

export const LIVE_PRICE_TYPES = ["stock", "etf", "crypto", "commodities"];

/**
 * Fetches a live market quote from the Yahoo Finance proxy.
 * Returns null on any error or if no price is available — never throws.
 * Handles the crypto -USD suffix fallback internally.
 */
const _apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
// Firebase Hosting rewrites live at /api/price; direct Cloud Function URLs live at /price
const PRICE_URL = _apiBase ? `${_apiBase}/price` : "/api/price";

export async function fetchLiveQuote(ticker: string, assetType: string): Promise<LiveQuote | null> {
  try {
    const res = await fetch(`${PRICE_URL}?ticker=${ticker}`);
    const quote: LiveQuote | null = res.ok ? await res.json() : null;

    // For crypto without a -USD suffix, retry only if no valid price came back
    if (assetType === "crypto" && !ticker.includes("-") && !quote?.regularMarketPrice) {
      const fbRes = await fetch(`${PRICE_URL}?ticker=${ticker}-USD`);
      if (fbRes.ok) {
        const fbQuote: LiveQuote = await fbRes.json();
        if (fbQuote?.regularMarketPrice) return fbQuote;
      }
    }

    return quote?.regularMarketPrice ? quote : null;
  } catch {
    return null;
  }
}
