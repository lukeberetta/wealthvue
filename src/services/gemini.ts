import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

import { AssetType, ValueSource, AIConfidence } from "../types";

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

export async function parseTextToAsset(text: string, preferredCurrency: string = "USD"): Promise<ParsedAsset | null> {
  const systemInstruction = `You are a financial asset parser. The user will describe an asset in plain language. 
SEARCH for the current market price of any ticker symbols or assets mentioned (it is early 2026). 
Extract structured data and estimate its current market value based on your search results. 

Respond ONLY with valid raw JSON in this exact format:
{
  "name": string,
  "assetType": "stock" | "crypto" | "vehicle" | "property" | "cash" | "other",
  "ticker": string | null,
  "quantity": number,
  "unitPrice": number,
  "unitPriceCurrency": string (ISO 4217 code),
  "totalValue": number,
  "totalValueCurrency": string (ISO 4217 code),
  "valueSource": "live_price",
  "source": string | null,
  "aiConfidence": "high" | "medium" | "low",
  "aiRationale": string,
  "description": string
}
IMPORTANT: The "source" field MUST only contain institutional names like "Robinhood", "Binance", or "Chase" if explicitly mentioned by the user. 
DO NOT put website names found during price searching (like "Motley Fool" or "Yahoo Finance") in the "source" field. Put those in "aiRationale" instead.
Never include any text outside the JSON object. All currency fields MUST be valid ISO 4217 codes.`;

  try {
    const response = await callAIWithRotation(text, systemInstruction);
    const cleanedText = response.text.replace(/```json\n?/, "").replace(/```\n?$/, "").trim();
    return JSON.parse(cleanedText || "null");
  } catch (error) {
    console.error("Error parsing text to asset:", error);
    throw error;
  }
}

export async function parseScreenshotToAssets(base64Image: string, preferredCurrency: string = "USD"): Promise<ParsedAsset[]> {
  const systemInstruction = `You are a financial portfolio parser. Extract ALL visible assets from the screenshot.
For any asset found, SEARCH for its current real-time market price (early 2026) to ensure accuracy.
Return assets as a JSON array. Each element follows this format:
{
  "name": string,
  "assetType": "stock" | "crypto" | "vehicle" | "property" | "cash" | "other",
  "ticker": string | null,
  "quantity": number,
  "unitPrice": number,
  "unitPriceCurrency": string (ISO 4217 code),
  "totalValue": number,
  "totalValueCurrency": string (ISO 4217 code),
  "valueSource": "live_price",
  "source": string | null,
  "aiConfidence": "high",
  "aiRationale": string,
  "description": string
}
IMPORTANT: The "source" field MUST only contain institutional names like "Robinhood", "Binance", or "Chase" if visible in the screenshot. 
DO NOT put website names found during price searching (like "Motley Fool" or "Yahoo Finance") in the "source" field. Put those in "aiRationale" instead.
Respond ONLY with a valid JSON array. No markdown, no explanation. All currency fields MUST be valid ISO 4217 codes. Prefer using ${preferredCurrency} for valuations.`;

  try {
    const contents = {
      parts: [
        { text: "Extract assets from this screenshot. For any identified stocks or crypto without visible prices, SEARCH for their current market price." },
        {
          inlineData: {
            mimeType: "image/png",
            data: base64Image.split(",")[1] || base64Image,
          },
        },
      ],
    };
    const response = await callAIWithRotation(contents, systemInstruction);
    const cleanedText = response.text.replace(/```json\n?/, "").replace(/```\n?$/, "").trim();
    return JSON.parse(cleanedText || "[]");
  } catch (error) {
    console.error("Error parsing screenshot to assets:", error);
    throw error;
  }
}

export async function reestimateAssetValue(asset: { name: string; assetType: string; description: string }, preferredCurrency: string = "USD"): Promise<{
  unitPrice: number;
  unitPriceCurrency: string;
  totalValue: number;
  aiConfidence: "high" | "medium" | "low";
  aiRationale: string;
} | null> {
  const systemInstruction = `Given this asset:
Name: ${asset.name}
Type: ${asset.assetType}
Description: ${asset.description}

Provide an updated market value estimate in ${preferredCurrency}. Respond ONLY with JSON:
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
