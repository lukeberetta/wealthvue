import { GoogleGenAI } from "@google/genai";
import { AssetType, ValueSource, AIConfidence } from "../types";
import { fetchLiveQuote, LIVE_PRICE_TYPES, LiveQuote } from "../lib/priceApi";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ParsedAsset {
  name: string;
  assetType: AssetType;
  ticker: string | null;
  quantity: number;
  unitPrice: number;
  unitPriceCurrency: string;
  totalValue: number;
  totalValueCurrency: string;
  valueSource: ValueSource;
  source: string | null;
  aiConfidence: AIConfidence;
  aiRationale: string;
  description: string;
}

/**
 * Model Rotation Logic:
 * Flash models are capped at 20 RPD each. 
 * We rotate through all available Flash models to maximize daily quota.
 */
const AVAILABLE_MODELS = [
  "gemini-3-flash-preview",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash"
];

async function callAIWithRotation(
  contents: any,
  systemInstruction: string,
  useSearch: boolean = true
): Promise<any> {
  let lastError: any = null;

  // Try each model until one works
  for (const model of AVAILABLE_MODELS) {
    try {
      return await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          tools: useSearch ? [{ googleSearch: {} }] as any : [],
        },
      });
    } catch (error: any) {
      lastError = error;
      const isQuotaError = error.status === "RESOURCE_EXHAUSTED" || error.message?.includes("429");

      if (isQuotaError) {
        console.warn(`Model ${model} storage exhausted (or search limited). Trying next...`);
        continue; // Try next model in list
      }

      throw error; // If it's a real error (like 400 or 500), stop here
    }
  }

  // If we get here, all models failed (usually 429 on all)
  // One final attempt with the first model but WITHOUT tools
  if (useSearch) {
    console.warn("All models exhausted search quota. Final attempt without live search...");
    try {
      return await ai.models.generateContent({
        model: AVAILABLE_MODELS[0],
        contents,
        config: {
          systemInstruction,
          tools: [], // Force remove search
        },
      });
    } catch (err) {
      throw lastError || err;
    }
  }

  throw lastError;
}

function applyQuoteToAsset(asset: ParsedAsset, quote: LiveQuote, preferredCurrency: string): void {
  asset.unitPrice = quote.regularMarketPrice;
  asset.unitPriceCurrency = quote.currency || preferredCurrency;
  asset.totalValue = asset.unitPrice * asset.quantity;
  asset.totalValueCurrency = asset.unitPriceCurrency;
  asset.valueSource = "live_price";
  asset.aiConfidence = "high";
  asset.aiRationale = "Price fetched live from Yahoo Finance.";
  if (quote.shortName || quote.longName) {
    asset.name = (quote.shortName || quote.longName)!;
  }
}

export async function parseTextToAsset(text: string, preferredCurrency: string = "ZAR", country: string = "ZA"): Promise<ParsedAsset | null> {
  const systemInstruction = `You are a financial asset parser. The user will describe an asset in plain language.
Extract structured data. If you are uncertain about a company's ticker symbol (e.g. it may have recently IPO'd after your training cutoff), use the Google Search tool to find the correct Yahoo Finance ticker — search for "[company name] stock ticker symbol NYSE NASDAQ". Do NOT use search to find current prices; prices will be fetched separately.
For assets classified as stock, etf, crypto, or commodities where you return a non-null ticker, set unitPrice and totalValue to 0 — live prices will be fetched from Yahoo Finance automatically. Only provide a real price estimate when assetType is vehicle, property, cash, or other.

Respond ONLY with valid raw JSON in this exact format:
{
  "name": string,
  "assetType": "stock" | "crypto" | "commodities" | "etf" | "vehicle" | "property" | "cash" | "other",
  "ticker": string | null,
  "quantity": number,
  "unitPrice": number,
  "unitPriceCurrency": string (ISO 4217 code),
  "totalValue": number,
  "totalValueCurrency": string (ISO 4217 code),
  "valueSource": "live_price" | "estimated",
  "source": string | null,
  "aiConfidence": "high" | "medium" | "low",
  "aiRationale": string,
  "description": string
}
IMPORTANT: The "source" field MUST only contain institutional names like "Robinhood", "Binance", or "Chase" if explicitly mentioned by the user.
IMPORTANT: The "ticker" field MUST be a valid Yahoo Finance ticker symbol. For direct cryptocurrencies (like Bitcoin), it MUST end with "-USD" (e.g., "BTC-USD", "ETH-USD"). For ETFs (like Crypto ETFs or Gold ETFs), use the exact stock ticker (e.g., "IBIT", "IAUM"). For non-US stocks, include the appropriate exchange suffix (e.g., ".JO" for Johannesburg).
IMPORTANT: For stocks, ALWAYS provide a best-effort ticker symbol — never return null just because you are uncertain. Your training data has a cutoff date and may be wrong about a company's public/private status. If the user says they own shares in a company, treat it as publicly traded regardless of what your training data says. Do NOT state a company is private if the user is describing owning shares in it. For companies you believe recently IPO'd or whose ticker you are unsure of, infer the most likely ticker using short common abbreviations (2–4 characters, e.g., "Figma" → "FIG", "Stripe" → "STRP"). Only return null for ticker if the asset is clearly not a stock (e.g., personal property, vehicle, cash). When guessing a ticker, set aiConfidence to "low" and note in aiRationale that the ticker is inferred and may need verification.
Never include any text outside the JSON object. All currency fields MUST be valid ISO 4217 codes.
IMPORTANT: Valuations should be in ${preferredCurrency}. Make sure to estimate local market value in the country code ${country}.
IMPORTANT CATEGORISATION: If the asset is a Bitcoin ETF or Crypto ETF, explicitly classify 'assetType' as "crypto". If the asset is a Gold ETF, Silver ETF, or other precious metal ETF/fund, strictly classify 'assetType' as "commodities". If the asset is a standard Index Fund, Mutual Fund, or ETF (e.g. S&P 500 ETF), strictly classify 'assetType' as "etf".`;

  try {
    const response = await callAIWithRotation(text, systemInstruction, true);
    const cleanedText = response.text.replace(/```json\n?/, "").replace(/```\n?$/, "").trim();
    const asset = JSON.parse(cleanedText || "null");

    if (asset && asset.ticker && LIVE_PRICE_TYPES.includes(asset.assetType)) {
      const quote = await fetchLiveQuote(asset.ticker, asset.assetType);
      if (quote) applyQuoteToAsset(asset, quote, preferredCurrency);
    }
    return asset;
  } catch (error) {
    console.error("Error parsing text to asset:", error);
    throw error;
  }
}

export async function parseScreenshotToAssets(base64Image: string, preferredCurrency: string = "ZAR", country: string = "ZA"): Promise<ParsedAsset[]> {
  const systemInstruction = `You are a financial portfolio parser. Extract ALL visible assets from the screenshot.
DO NOT use search tools. Rely purely on vision.
Return assets as a JSON array. Each element follows this format:
{
  "name": string,
  "assetType": "stock" | "crypto" | "commodities" | "etf" | "vehicle" | "property" | "cash" | "other",
  "ticker": string | null,
  "quantity": number,
  "unitPrice": number,
  "unitPriceCurrency": string (ISO 4217 code),
  "totalValue": number,
  "totalValueCurrency": string (ISO 4217 code),
  "valueSource": "estimated",
  "source": string | null,
  "aiConfidence": "high",
  "aiRationale": string,
  "description": string
}
IMPORTANT: The "source" field MUST only contain institutional names like "Robinhood", "Binance", or "Chase" if visible in the screenshot. 
IMPORTANT: The "ticker" field MUST be a valid Yahoo Finance ticker symbol. For direct cryptocurrencies (like Bitcoin), it SHOULD end with "-USD" (e.g., "BTC-USD", "ETH-USD"), but if not provided, try to infer. For ETFs (like Crypto ETFs or Gold ETFs) or commodities (like Gold, Silver), use the exact stock ticker (e.g., "IBIT", "IAUM", "GLD"). For non-US stocks, include the appropriate exchange suffix (e.g., ".JO" for Johannesburg).
Respond ONLY with a valid JSON array. No markdown, no explanation. All currency fields MUST be valid ISO 4217 codes. Prefer using ${preferredCurrency} for valuations and localize market values to the country code ${country}.
IMPORTANT CATEGORISATION: If the asset is a Bitcoin ETF or Crypto ETF, explicitly classify 'assetType' as "crypto". If the asset is a Gold ETF, Silver ETF, or other precious metal ETF/fund, strictly classify 'assetType' as "commodities". If the asset is a standard Index Fund, Mutual Fund, or ETF (e.g. S&P 500 ETF), strictly classify 'assetType' as "etf".`;

  try {
    const contents = {
      parts: [
        { text: "Extract assets from this screenshot. Find the exact ticker symbol, quantity, and cost basis if possible." },
        {
          inlineData: {
            mimeType: "image/png",
            data: base64Image.split(",")[1] || base64Image,
          },
        },
      ],
    };
    const response = await callAIWithRotation(contents, systemInstruction, false); // Removed live search
    const cleanedText = response.text.replace(/```json\n?/, "").replace(/```\n?$/, "").trim();
    let assets = JSON.parse(cleanedText || "[]");

    // Augment with real prices from Yahoo Finance where possible
    assets = await Promise.all(assets.map(async (asset: ParsedAsset) => {
      if (asset.ticker && LIVE_PRICE_TYPES.includes(asset.assetType)) {
        const quote = await fetchLiveQuote(asset.ticker, asset.assetType);
        if (quote) applyQuoteToAsset(asset, quote, preferredCurrency);
      }
      return asset;
    }));

    return assets;
  } catch (error) {
    console.error("Error parsing screenshot to assets:", error);
    throw error;
  }
}

export async function reestimateAssetValue(
  asset: { name: string; assetType: string; description: string; ticker?: string | null; quantity?: number },
  preferredCurrency: string = "ZAR",
  country: string = "ZA"
): Promise<{
  unitPrice: number;
  unitPriceCurrency: string;
  totalValue: number;
  aiConfidence: "high" | "medium" | "low";
  aiRationale: string;
} | null> {
  // For tickered assets, try Yahoo Finance first
  if (asset.ticker && LIVE_PRICE_TYPES.includes(asset.assetType)) {
    const quote = await fetchLiveQuote(asset.ticker, asset.assetType);
    if (quote) {
      const qty = asset.quantity ?? 1;
      return {
        unitPrice: quote.regularMarketPrice,
        unitPriceCurrency: quote.currency,
        totalValue: quote.regularMarketPrice * qty,
        aiConfidence: "high",
        aiRationale: "Price fetched live from Yahoo Finance.",
      };
    }
  }

  // Fall back to AI estimate for non-tickered assets or when Yahoo Finance fails
  const systemInstruction = `Given this asset:
Name: ${asset.name}
Type: ${asset.assetType}
Description: ${asset.description}

Provide an updated market value estimate in ${preferredCurrency} localized to the country code ${country}. Respond ONLY with JSON:
{
  "unitPrice": number,
  "unitPriceCurrency": string (ISO 4217 code),
  "totalValue": number,
  "aiConfidence": "high" | "medium" | "low",
  "aiRationale": string
}
All currency fields MUST be valid ISO 4217 codes.`;

  try {
    const contents = `Name: ${asset.name}\nType: ${asset.assetType}\nDescription: ${asset.description}`;
    const response = await callAIWithRotation(contents, systemInstruction);
    const cleanedText = response.text.replace(/```json\n?/, "").replace(/```\n?$/, "").trim();
    return JSON.parse(cleanedText || "null");
  } catch (error) {
    console.error("Error re-estimating asset value:", error);
    return null;
  }
}

export async function analyzePortfolio(
  breakdown: { assetType: string; value: number; pct: number }[],
  totalNAV: number,
  currency: string
): Promise<{ summary: string; advice: string[] } | null> {
  const breakdownTable = breakdown
    .map(b => `- ${b.assetType}: ${b.pct.toFixed(1)}% (${currency} ${b.value.toLocaleString(undefined, { maximumFractionDigits: 0 })})`)
    .join("\n");

  const systemInstruction = `You are a sharp, senior wealth advisor — precise, direct, and never generic. You are analyzing a client's investment portfolio.

Portfolio breakdown (${currency}):
${breakdownTable}
Total NAV: ${currency} ${totalNAV.toLocaleString(undefined, { maximumFractionDigits: 0 })}

Respond ONLY with valid JSON in this exact format:
{
  "summary": string,
  "advice": string[]
}

Rules:
- "summary": 2–3 sentences. Be specific about this portfolio's actual composition and risk profile. Do NOT use clichés like "diversification is key" — say something that only applies to THIS portfolio.
- "advice": exactly 3–4 items. Each must be a concrete, specific recommendation that references this portfolio's actual numbers or types. No vague platitudes. Write like you're advising a real client — confident, informed, and slightly direct.
- Do NOT wrap in markdown. Raw JSON only.`;

  try {
    const contents = `Analyse this portfolio and return the JSON.`;
    const response = await callAIWithRotation(contents, systemInstruction, false);
    const cleanedText = response.text.replace(/```json\n?/, "").replace(/```\n?$/, "").trim();
    return JSON.parse(cleanedText || "null");
  } catch (error) {
    console.error("Error analyzing portfolio:", error);
    throw error;
  }
}
