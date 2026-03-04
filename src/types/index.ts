export type AssetType = "stock" | "crypto" | "commodities" | "etf" | "vehicle" | "property" | "cash" | "other";
export type ValueSource = "ai_estimate" | "live_price" | "manual";
export type AIConfidence = "high" | "medium" | "low";
export type PlanType = "trial" | "pro";

/** AI credit limits per plan. */
export const AI_CREDIT_LIMITS: Record<PlanType, number> = {
  trial: 10,
  pro: 50,
};

export interface AIUsage {
  totalCalls: number;
  monthlyCallCount: number;
  currentMonth: string; // "YYYY-MM"
  lastCalledAt: string | null;
}

export interface User {
  displayName: string;
  email: string;
  photoURL: string;
  defaultCurrency: string;
  country: string;
  plan: PlanType;
  trialStartDate: string;
  trialEndsAt: string;
  createdAt: string;
  aiUsage?: AIUsage;
  paddleSubscriptionId?: string;
  paddleCancelAt?: string; // ISO date — set when cancellation is scheduled
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

export interface FinancialGoal {
  targetAmount: number;
  currency: string;
}
