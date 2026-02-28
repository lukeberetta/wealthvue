import { Asset, User, NAVHistoryEntry, FinancialGoal } from "../types";
import { addDays, format, subDays } from "date-fns";

const generateNAVHistory = (currentTotal: number): NAVHistoryEntry[] => {
  const history: NAVHistoryEntry[] = [];
  let currentVal = currentTotal * 0.9; // Start a bit lower

  for (let i = 60; i >= 0; i--) {
    const date = format(subDays(new Date(), i), "yyyy-MM-dd");
    // Add gentle upward drift with occasional small dips
    const change = (Math.random() - 0.4) * 0.01; // -0.4% to +0.6%
    currentVal = currentVal * (1 + change);
    history.push({
      date,
      totalNAV: Math.round(currentVal),
      displayCurrency: "USD"
    });
  }
  return history;
};

export const DEMO_USER: User = {
  displayName: "Alex Morgan",
  email: "alex@example.com",
  photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  defaultCurrency: "USD",
  country: "US",
  plan: "trial",
  trialStartDate: format(subDays(new Date(), 12), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
  trialEndsAt: format(addDays(new Date(), 18), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
  createdAt: format(subDays(new Date(), 12), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
};

export const DEMO_ASSETS: Asset[] = [
  {
    id: "1",
    name: "Apple Inc",
    description: "Technology giant",
    assetType: "stock",
    ticker: "AAPL",
    quantity: 24,
    unitPrice: 189.50,
    unitPriceCurrency: "USD",
    totalValue: 24 * 189.50,
    totalValueCurrency: "USD",
    valueSource: "live_price",
    source: "Robinhood",
    aiConfidence: null,
    aiRationale: null,
    inputMethod: "manual",
    lastRefreshed: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Bitcoin",
    description: "Digital gold",
    assetType: "crypto",
    ticker: "BTC",
    quantity: 0.45,
    unitPrice: 62400,
    unitPriceCurrency: "USD",
    totalValue: 0.45 * 62400,
    totalValueCurrency: "USD",
    valueSource: "live_price",
    source: "Binance",
    aiConfidence: null,
    aiRationale: null,
    inputMethod: "manual",
    lastRefreshed: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Ethereum",
    description: "Smart contract platform",
    assetType: "crypto",
    ticker: "ETH",
    quantity: 3.2,
    unitPrice: 3180,
    unitPriceCurrency: "USD",
    totalValue: 3.2 * 3180,
    totalValueCurrency: "USD",
    valueSource: "live_price",
    source: "Coinbase",
    aiConfidence: null,
    aiRationale: null,
    inputMethod: "manual",
    lastRefreshed: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Vanguard S&P 500 ETF",
    description: "Broad market index fund",
    assetType: "stock",
    ticker: "VOO",
    quantity: 10,
    unitPrice: 487.00,
    unitPriceCurrency: "USD",
    totalValue: 10 * 487.00,
    totalValueCurrency: "USD",
    valueSource: "live_price",
    source: "Vanguard",
    aiConfidence: null,
    aiRationale: null,
    inputMethod: "manual",
    lastRefreshed: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "2021 Tesla Model 3 Long Range",
    description: "Electric vehicle",
    assetType: "vehicle",
    ticker: null,
    quantity: 1,
    unitPrice: 28500,
    unitPriceCurrency: "USD",
    totalValue: 28500,
    totalValueCurrency: "USD",
    valueSource: "ai_estimate",
    source: "Physical",
    aiConfidence: "medium",
    aiRationale: "Estimated based on US used car market for this model year and approximate mileage.",
    inputMethod: "text",
    lastRefreshed: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    name: "FNB Savings Account",
    description: "Emergency fund",
    assetType: "cash",
    ticker: null,
    quantity: 1,
    unitPrice: 142000,
    unitPriceCurrency: "ZAR",
    totalValue: 142000,
    totalValueCurrency: "ZAR",
    valueSource: "manual",
    source: "FNB",
    aiConfidence: null,
    aiRationale: null,
    inputMethod: "manual",
    lastRefreshed: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "7",
    name: "Nvidia",
    description: "AI chip leader",
    assetType: "stock",
    ticker: "NVDA",
    quantity: 8,
    unitPrice: 875.00,
    unitPriceCurrency: "USD",
    totalValue: 8 * 875.00,
    totalValueCurrency: "USD",
    valueSource: "live_price",
    source: "Charles Schwab",
    aiConfidence: null,
    aiRationale: null,
    inputMethod: "manual",
    lastRefreshed: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "8",
    name: "Solana",
    description: "High-performance blockchain",
    assetType: "crypto",
    ticker: "SOL",
    quantity: 45,
    unitPrice: 148.00,
    unitPriceCurrency: "USD",
    totalValue: 45 * 148.00,
    totalValueCurrency: "USD",
    valueSource: "live_price",
    source: "Phantom Wallet",
    aiConfidence: null,
    aiRationale: null,
    inputMethod: "manual",
    lastRefreshed: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const totalDemoNAV = DEMO_ASSETS.reduce((acc, asset) => {
  // Simple conversion for demo: 1 ZAR = 0.053 USD
  const val = asset.unitPriceCurrency === "ZAR" ? asset.totalValue * 0.053 : asset.totalValue;
  return acc + val;
}, 0);

export const DEMO_NAV_HISTORY = generateNAVHistory(totalDemoNAV);

export const DEMO_GOAL: FinancialGoal = {
  targetAmount: 250000,
  currency: "USD",
};
