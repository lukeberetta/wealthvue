import { storage } from "../services/storage";
import { loadFXCache, saveFXCache } from "../services/firestoreService";
import { FXCache } from "../types";

const BASE_URL = "https://api.frankfurter.app";

export async function fetchFXRates(isAuthenticated = true): Promise<FXCache> {
  // 1. Check localStorage first (fast, avoids a Firestore read on every load)
  const localCached = storage.getFXCache();
  if (localCached) {
    const fetchedAt = new Date(localCached.fetchedAt);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (fetchedAt > oneHourAgo) {
      return localCached;
    }
  }

  // 2. Check shared Firestore cache (avoids redundant API calls across users)
  //    Skip for unauthenticated users (e.g. demo mode) — Firestore requires auth.
  if (isAuthenticated) {
    const firestoreCached = await loadFXCache();
    if (firestoreCached) {
      storage.saveFXCache(firestoreCached); // warm local cache
      return firestoreCached;
    }
  }

  // 3. Fetch fresh rates from Frankfurter API
  try {
    const response = await fetch(`${BASE_URL}/latest?from=USD`);
    const data = await response.json();
    const cache: FXCache = {
      rates: { ...data.rates, USD: 1 },
      fetchedAt: new Date().toISOString(),
    };
    storage.saveFXCache(cache);                    // local cache
    if (isAuthenticated) await saveFXCache(cache); // shared Firestore cache (auth only)
    return cache;
  } catch (error) {
    console.error("Error fetching FX rates:", error);
    const fallback = localCached || { rates: { USD: 1 }, fetchedAt: new Date().toISOString() };
    return fallback;
  }
}

export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: { [key: string]: number }
): number {
  if (from === to) return amount;

  // All rates are relative to USD
  const amountInUSD = from === "USD" ? amount : amount / (rates[from] || 1);
  const result = to === "USD" ? amountInUSD : amountInUSD * (rates[to] || 1);

  return result;
}
