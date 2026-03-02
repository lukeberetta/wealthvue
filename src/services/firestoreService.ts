/**
 * WealthVue — Firestore Service
 *
 * All Firestore reads/writes for the authenticated user's data.
 * Demo mode never calls these functions — it reads from demoData.ts via storage.ts.
 *
 * Schema reference: architecture/firestore-schema.md
 */

import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    writeBatch,
    serverTimestamp,
    Timestamp,
    query,
    orderBy,
    limit,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Asset, NAVHistoryEntry, FinancialGoal, FXCache } from "../types";

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------

/** Load all assets for the given user. */
export async function loadAssets(uid: string): Promise<Asset[]> {
    const snap = await getDocs(collection(db, "users", uid, "assets"));
    return snap.docs.map((d) => {
        const data = d.data();
        return firestoreToAsset(d.id, data);
    });
}

/** Save a single asset (upsert). */
export async function saveAsset(uid: string, asset: Asset): Promise<void> {
    const ref = doc(db, "users", uid, "assets", asset.id);
    await setDoc(ref, assetToFirestore(asset));
}

/** Batch-save multiple assets (used after bulk AI parse). */
export async function saveAssets(uid: string, assets: Asset[]): Promise<void> {
    if (assets.length === 0) return;
    const batch = writeBatch(db);
    for (const asset of assets) {
        const ref = doc(db, "users", uid, "assets", asset.id);
        batch.set(ref, assetToFirestore(asset));
    }
    await batch.commit();
}

/** Delete a single asset by ID. */
export async function deleteAsset(uid: string, assetId: string): Promise<void> {
    await deleteDoc(doc(db, "users", uid, "assets", assetId));
}

/** Batch-delete multiple assets by ID. */
export async function deleteAssets(uid: string, assetIds: string[]): Promise<void> {
    if (assetIds.length === 0) return;
    const batch = writeBatch(db);
    for (const id of assetIds) {
        batch.delete(doc(db, "users", uid, "assets", id));
    }
    await batch.commit();
}

// ---------------------------------------------------------------------------
// NAV History
// ---------------------------------------------------------------------------

/** Load the last 90 days of NAV history for the given user. */
export async function loadNAVHistory(uid: string): Promise<NAVHistoryEntry[]> {
    const q = query(
        collection(db, "users", uid, "navHistory"),
        orderBy("date", "desc"),
        limit(90)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
        const data = d.data();
        return {
            date: data.date as string,
            totalNAV: data.totalNAV as number,
            displayCurrency: data.displayCurrency as string,
        };
    });
}

/** Write today's NAV snapshot (last-write-wins per day). */
export async function saveNAVSnapshot(
    uid: string,
    entry: NAVHistoryEntry
): Promise<void> {
    const ref = doc(db, "users", uid, "navHistory", entry.date);
    await setDoc(ref, {
        date: entry.date,
        totalNAV: entry.totalNAV,
        displayCurrency: entry.displayCurrency,
        recordedAt: serverTimestamp(),
    });
}

// ---------------------------------------------------------------------------
// Goal (embedded in the user document)
// ---------------------------------------------------------------------------

/** Save the user's financial goal to the users/{uid} document. */
export async function saveGoal(
    uid: string,
    goal: FinancialGoal
): Promise<void> {
    await updateDoc(doc(db, "users", uid), {
        goal,
        updatedAt: serverTimestamp(),
    });
}

/** Clear the user's financial goal. */
export async function clearGoal(uid: string): Promise<void> {
    await updateDoc(doc(db, "users", uid), {
        goal: null,
        updatedAt: serverTimestamp(),
    });
}

/** Load the user's financial goal from users/{uid}. */
export async function loadGoal(uid: string): Promise<FinancialGoal | null> {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null;
    return (snap.data().goal as FinancialGoal | null) ?? null;
}

// ---------------------------------------------------------------------------
// FX Cache (shared across all users via fxCache/latest)
// ---------------------------------------------------------------------------

/** Read the shared FX rate cache from Firestore. Returns null if stale or missing. */
export async function loadFXCache(): Promise<FXCache | null> {
    try {
        const snap = await getDoc(doc(db, "fxCache", "latest"));
        if (!snap.exists()) return null;
        const data = snap.data();
        const fetchedAt: Date =
            data.fetchedAt instanceof Timestamp
                ? data.fetchedAt.toDate()
                : new Date(data.fetchedAt);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (fetchedAt < oneHourAgo) return null; // stale
        return {
            rates: data.rates as { [key: string]: number },
            fetchedAt: fetchedAt.toISOString(),
        };
    } catch {
        return null; // Firestore unavailable — fall through to API
    }
}

/** Write fresh FX rates to the shared Firestore cache. */
export async function saveFXCache(cache: FXCache): Promise<void> {
    try {
        await setDoc(doc(db, "fxCache", "latest"), {
            baseCurrency: "USD",
            rates: cache.rates,
            fetchedAt: serverTimestamp(),
        });
    } catch (err) {
        console.warn("Could not write FX cache to Firestore:", err);
    }
}

// ---------------------------------------------------------------------------
// Converters (Firestore ↔ TypeScript types)
// ---------------------------------------------------------------------------

function assetToFirestore(asset: Asset): Record<string, unknown> {
    return {
        name: asset.name,
        description: asset.description,
        assetType: asset.assetType,
        ticker: asset.ticker ?? null,
        source: asset.source ?? null,
        quantity: asset.quantity,
        unitPrice: asset.unitPrice,
        unitPriceCurrency: asset.unitPriceCurrency,
        totalValue: asset.totalValue,
        totalValueCurrency: asset.totalValueCurrency,
        valueSource: asset.valueSource,
        inputMethod: asset.inputMethod,
        aiConfidence: asset.aiConfidence ?? null,
        aiRationale: asset.aiRationale ?? null,
        lastRefreshed: asset.lastRefreshed,
        createdAt: asset.createdAt,
        updatedAt: new Date().toISOString(),
    };
}

function firestoreToAsset(id: string, data: Record<string, unknown>): Asset {
    return {
        id,
        name: (data.name as string) ?? "",
        description: (data.description as string) ?? "",
        assetType: (data.assetType as Asset["assetType"]) ?? "other",
        ticker: (data.ticker as string | null) ?? null,
        source: (data.source as string | null) ?? null,
        quantity: (data.quantity as number) ?? 0,
        unitPrice: (data.unitPrice as number) ?? 0,
        unitPriceCurrency: (data.unitPriceCurrency as string) ?? "USD",
        totalValue: (data.totalValue as number) ?? 0,
        totalValueCurrency: (data.totalValueCurrency as string) ?? "USD",
        valueSource: (data.valueSource as Asset["valueSource"]) ?? "manual",
        inputMethod: (data.inputMethod as Asset["inputMethod"]) ?? "manual",
        aiConfidence: (data.aiConfidence as Asset["aiConfidence"]) ?? null,
        aiRationale: (data.aiRationale as string | null) ?? null,
        lastRefreshed: (data.lastRefreshed as string) ?? new Date().toISOString(),
        createdAt: (data.createdAt as string) ?? new Date().toISOString(),
        updatedAt: (data.updatedAt as string) ?? new Date().toISOString(),
    };
}
