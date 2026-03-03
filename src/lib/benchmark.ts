import { loadSP500Cache, saveSP500Cache } from "../services/firestoreService";

export interface SP500DataPoint {
    date: string; // "YYYY-MM-DD"
    close: number;
}

/**
 * Fetch 5 years of daily S&P 500 closes.
 *
 * Cache strategy:
 *   1. Firestore sp500Cache/latest (24h TTL, shared across all users)
 *   2. /api/sp500 — Vite middleware in dev, Firebase hosting rewrite in prod.
 *      Both call yahoo-finance2 server-side so there are no CORS issues.
 *      Result is written back to Firestore for the next caller.
 */
export async function fetchSP500History(): Promise<SP500DataPoint[]> {
    // 1. Shared Firestore cache
    const cached = await loadSP500Cache();
    if (cached) return cached;

    // 2. Server-side fetch (no CORS)
    const _apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
    // Firebase Hosting rewrites live at /api/sp500; direct Cloud Function URLs live at /sp500
    const sp500Url = _apiBase ? `${_apiBase}/sp500` : "/api/sp500";
    const res = await fetch(sp500Url, {
        signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
        throw new Error(`S&P 500 function returned ${res.status}`);
    }

    const json = (await res.json()) as {
        data?: SP500DataPoint[];
        error?: string;
    };
    if (json.error) throw new Error(json.error);
    if (!json.data?.length) throw new Error("Empty S&P 500 response");

    // 3. Persist to shared cache (fire-and-forget)
    saveSP500Cache(json.data);

    return json.data;
}

/** Returns the S&P 500 close on or before targetDate, or null if no data precedes it. */
export function findSP500Close(
    data: SP500DataPoint[],
    targetDate: string
): number | null {
    let result: number | null = null;
    for (const entry of data) {
        if (entry.date <= targetDate) {
            result = entry.close;
        } else {
            break;
        }
    }
    return result;
}
