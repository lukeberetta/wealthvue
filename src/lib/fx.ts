import { storage } from "./storage";
import { FXCache } from "../types";

const BASE_URL = "https://api.frankfurter.app";

export async function fetchFXRates(): Promise<FXCache> {
  const cached = storage.getFXCache();
  if (cached) {
    const fetchedAt = new Date(cached.fetchedAt);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (fetchedAt > oneHourAgo) {
      return cached;
    }
  }

  try {
    const response = await fetch(`${BASE_URL}/latest?from=USD`);
    const data = await response.json();
    const cache: FXCache = {
      rates: { ...data.rates, USD: 1 },
      fetchedAt: new Date().toISOString(),
    };
    storage.saveFXCache(cache);
    return cache;
  } catch (error) {
    console.error("Error fetching FX rates:", error);
    return cached || { rates: { USD: 1 }, fetchedAt: new Date().toISOString() };
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
