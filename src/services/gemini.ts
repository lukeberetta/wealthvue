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
  source: string | null; // e.g., "Robinhood", "Binance", "Physical"
  aiConfidence: AIConfidence;
  aiRationale: string;
  description: string;
}

export async function parseTextToAsset(text: string, preferredCurrency: string = "USD"): Promise<ParsedAsset | null> {
  const model = "gemini-2.0-flash";
  const systemInstruction = `You are a financial asset parser. The user will describe an asset in plain language. Extract structured data and estimate its current market value. Respond ONLY with valid JSON in this exact format:
{
  "name": string,
  "assetType": "stock" | "crypto" | "vehicle" | "property" | "cash" | "other",
  "ticker": string | null,
  "quantity": number,
  "unitPrice": number,
  "unitPriceCurrency": string (ISO 4217 code, e.g., "USD", "ZAR", "EUR"),
  "totalValue": number,
  "totalValueCurrency": string (ISO 4217 code, e.g., "USD", "ZAR", "EUR"),
  "valueSource": "ai_estimate" | "live_price",
  "source": string | null (e.g., "Robinhood", "Binance", "Coinbase"),
  "aiConfidence": "high" | "medium" | "low",
  "aiRationale": string,
  "description": string
}
Use current market knowledge to estimate values. For vehicles, use the local used car market matching the currency ${preferredCurrency}. Be conservative on estimates. Never include markdown, explanation, or any text outside the JSON object. All currency fields MUST be valid ISO 4217 codes.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: text,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "null");
  } catch (error) {
    console.error("Error parsing text to asset:", error);
    throw error;
  }
}

export async function parseScreenshotToAssets(base64Image: string, preferredCurrency: string = "USD"): Promise<ParsedAsset[]> {
  const model = "gemini-2.0-flash"; // Using 2.0 Flash for best vision performance and updated knowledge
  const systemInstruction = `You are a financial portfolio parser. The user has uploaded a screenshot of a financial account, portfolio, or asset. Extract ALL visible assets and return them as a JSON array. Each element follows this format:
{
  "name": string,
  "assetType": "stock" | "crypto" | "vehicle" | "property" | "cash" | "other",
  "ticker": string | null,
  "quantity": number,
  "unitPrice": number,
  "unitPriceCurrency": string (ISO 4217 code, e.g., "USD", "ZAR", "EUR"),
  "totalValue": number,
  "totalValueCurrency": string (ISO 4217 code, e.g., "USD", "ZAR", "EUR"),
  "valueSource": "ai_estimate" | "live_price",
  "source": string | null (e.g., "Robinhood", "Binance", "Coinbase"),
  "aiConfidence": "high" | "medium" | "low",
  "aiRationale": string,
  "description": string
}
Return one object per asset. If a unit price or total value is not explicitly visible in the screenshot, you MUST use your internal market knowledge to provide an accurate estimate based on the asset name or ticker symbol. Set aiConfidence to 'low' for these estimated values. Use current market prices (as of early 2026). Prefer using ${preferredCurrency} for all valuations. Respond ONLY with a valid JSON array. All currency fields MUST be valid ISO 4217 codes. No markdown, no explanation.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { text: "Extract assets from this screenshot." },
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
        ],
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "[]");
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
  const model = "gemini-2.0-flash";
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
    const response = await ai.models.generateContent({
      model,
      contents: `Name: ${asset.name}\nType: ${asset.assetType}\nDescription: ${asset.description}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "null");
  } catch (error) {
    console.error("Error re-estimating asset value:", error);
    return null;
  }
}
