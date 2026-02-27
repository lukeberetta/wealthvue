export type AssetType = "stock" | "crypto" | "vehicle" | "property" | "cash" | "other";
export type ValueSource = "ai_estimate" | "live_price" | "manual";
export type AIConfidence = "high" | "medium" | "low";
export type PlanType = "trial" | "pro";

export interface User {
  displayName: string;
  email: string;
  photoURL: string;
  defaultCurrency: string;
  plan: PlanType;
  trialStartDate: string;
  trialEndsAt: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  name: string;
  description: string;
  assetType: AssetType;
  ticker: string | null;
  quantity: number;
  unitPrice: number;
  unitPriceCurrency: string;
  totalValue: number;
  totalValueCurrency: string;
  valueSource: ValueSource;
  source: string | null;
  aiConfidence: AIConfidence | null;
  aiRationale: string | null;
  inputMethod: "text" | "screenshot" | "manual";
  lastRefreshed: string;
  createdAt: string;
  updatedAt: string;
}

export interface NAVHistoryEntry {
  date: string;
  totalNAV: number;
  displayCurrency: string;
}

export interface FXCache {
  rates: { [currencyCode: string]: number };
  fetchedAt: string;
}
