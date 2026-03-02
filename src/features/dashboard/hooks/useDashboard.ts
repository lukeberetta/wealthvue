import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Asset, User, NAVHistoryEntry, FinancialGoal } from "../../../types";
import { storage } from "../../../services/storage";
import {
    loadAssets,
    saveAsset,
    saveAssets,
    deleteAsset,
    deleteAssets,
    loadNAVHistory,
    saveNAVSnapshot,
    loadGoal,
    saveGoal as firestoreSaveGoal,
    clearGoal as firestoreClearGoal,
} from "../../../services/firestoreService";
import { fetchFXRates, convertCurrency } from "../../../lib/fx";
import { parseTextToAsset, parseScreenshotToAssets } from "../../../services/gemini";
import { fetchLiveQuote, LIVE_PRICE_TYPES } from "../../../services/priceApi";
import { useAuth } from "../../../contexts/AuthContext";

type ChangePeriod = '1D' | '1W' | '1M' | 'All';

function getPeriodAnchor(history: NAVHistoryEntry[], period: ChangePeriod): NAVHistoryEntry | null {
    if (history.length < 2) return null;
    const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
    if (period === '1D') return sorted[sorted.length - 2] ?? null;
    if (period === 'All') return sorted[0];
    const daysBack = period === '1W' ? 7 : 30;
    const target = new Date();
    target.setDate(target.getDate() - daysBack);
    const targetStr = target.toISOString().split('T')[0];
    return sorted.filter(e => e.date <= targetStr).at(-1) ?? sorted[0];
}

export const useDashboard = (user: User | null, isDemo: boolean) => {
    const { firebaseUser } = useAuth();
    const uid = firebaseUser?.uid ?? null;

    const [assets, setAssets] = useState<Asset[]>([]);
    const [navHistory, setNavHistory] = useState<NAVHistoryEntry[]>([]);
    const [displayCurrency, setDisplayCurrency] = useState(user?.defaultCurrency || "ZAR");
    const [fxRates, setFxRates] = useState<{ [key: string]: number }>({ USD: 1 });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [inputText, setInputText] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [draftAssets, setDraftAssets] = useState<Partial<Asset>[]>([]);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [currentView, setCurrentView] = useState<'dashboard' | 'settings'>('dashboard');
    const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<'value_desc' | 'value_asc' | 'name_asc'>('value_desc');
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [changePeriod, setChangePeriod] = useState<ChangePeriod>('1D');
    const [goal, setGoalState] = useState<FinancialGoal | null>(null);
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [refreshingAssetId, setRefreshingAssetId] = useState<string | null>(null);

    // -------------------------------------------------------------------------
    // Initial data load
    // -------------------------------------------------------------------------
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const rates = await fetchFXRates();
            setFxRates(rates.rates);

            let loadedAssets: Asset[];
            let loadedHistory: NAVHistoryEntry[];
            let loadedGoal: FinancialGoal | null;

            if (isDemo) {
                // Demo: read static local data — never touches Firestore
                loadedAssets = storage.getAssets(true);
                loadedHistory = storage.getNAVHistory(true);
                loadedGoal = storage.getGoal(true);
            } else if (uid) {
                // Real user: load from Firestore
                [loadedAssets, loadedHistory, loadedGoal] = await Promise.all([
                    loadAssets(uid),
                    loadNAVHistory(uid),
                    loadGoal(uid),
                ]);
            } else {
                loadedAssets = [];
                loadedHistory = [];
                loadedGoal = null;
            }

            setAssets(loadedAssets);
            setNavHistory(loadedHistory);
            setGoalState(loadedGoal);
            setIsLoading(false);

            // Auto-refresh live prices + write daily NAV snapshot (real users only)
            if (!isDemo && uid) {
                let updated = false;
                const newAssets = await Promise.all(loadedAssets.map(async (asset) => {
                    if (asset.ticker && LIVE_PRICE_TYPES.includes(asset.assetType)) {
                        const quote = await fetchLiveQuote(asset.ticker, asset.assetType);
                        if (quote && quote.regularMarketPrice !== asset.unitPrice) {
                            updated = true;
                            return {
                                ...asset,
                                unitPrice: quote.regularMarketPrice,
                                totalValue: quote.regularMarketPrice * asset.quantity,
                                unitPriceCurrency: quote.currency || asset.unitPriceCurrency,
                                totalValueCurrency: quote.currency || asset.unitPriceCurrency,
                                valueSource: "live_price" as const,
                                lastRefreshed: new Date().toISOString(),
                            };
                        }
                    }
                    return asset;
                }));

                if (updated) {
                    setAssets(newAssets);
                    // Batch-save only the assets that changed
                    const changed = newAssets.filter((a, i) => a !== loadedAssets[i]);
                    await saveAssets(uid, changed);
                }

                const today = new Date().toISOString().split('T')[0];
                const hasToday = loadedHistory.some(h => h.date === today);
                if (!hasToday) {
                    const navAssets = updated ? newAssets : loadedAssets;
                    const totalNAV = navAssets.reduce((acc, asset) => {
                        return acc + convertCurrency(asset.totalValue, asset.totalValueCurrency, "USD", rates.rates);
                    }, 0);
                    const entry: NAVHistoryEntry = { date: today, totalNAV, displayCurrency: "USD" };
                    setNavHistory(prev => [...prev, entry]);
                    await saveNAVSnapshot(uid, entry);
                }
            }
        };
        loadData();
    }, [isDemo, uid]);

    // -------------------------------------------------------------------------
    // Derived values
    // -------------------------------------------------------------------------
    const totalNAV = assets.reduce((acc, asset) => {
        return acc + convertCurrency(asset.totalValue, asset.totalValueCurrency, displayCurrency, fxRates);
    }, 0);

    const anchorEntry = getPeriodAnchor(navHistory, changePeriod);
    const convertedPrevNAV = anchorEntry
        ? convertCurrency(anchorEntry.totalNAV, "USD", displayCurrency, fxRates)
        : totalNAV;
    const change = totalNAV - convertedPrevNAV;
    const changePercent = convertedPrevNAV === 0
        ? (totalNAV > 0 ? 100 : 0)
        : (change / convertedPrevNAV) * 100;

    // -------------------------------------------------------------------------
    // Handlers
    // -------------------------------------------------------------------------
    const handleAddAsset = async () => {
        if (isDemo) return;
        setIsAnalyzing(true);
        setAnalysisError(null);
        try {
            const parsed = await parseTextToAsset(inputText, displayCurrency, user?.country || "ZA");
            if (parsed) {
                const quantity = parsed.quantity || 1;
                const unitPrice = parsed.unitPrice || (parsed.totalValue / quantity) || 0;
                const totalValue = parsed.totalValue || (unitPrice * quantity) || 0;

                setDraftAssets([{
                    ...parsed,
                    quantity,
                    unitPrice,
                    totalValue,
                    id: uuidv4(),
                    lastRefreshed: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    inputMethod: 'text'
                } as Asset]);
            }
        } catch (e: unknown) {
            console.error(e);
            const err = e as { message?: string; status?: string };
            if (err.message?.includes("quota") || err.status === "RESOURCE_EXHAUSTED" || err.message?.includes("429")) {
                setAnalysisError("AI Quota Exceeded. Please wait a minute or upgrade your plan to continue.");
            } else {
                setAnalysisError("Failed to analyze text. Please try describing it differently.");
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSaveDrafts = async (globalSource?: string) => {
        if (!uid) return;
        let updatedAssets = [...assets];
        const newToSave: Asset[] = [];
        const updatedToSave: Asset[] = [];

        (draftAssets as Asset[]).forEach(draft => {
            const existingIdx = updatedAssets.findIndex(a =>
                a.name.toLowerCase() === draft.name.toLowerCase() &&
                a.assetType === draft.assetType
            );

            const sourceToUse = globalSource?.trim() || draft.source;

            if (existingIdx !== -1) {
                const existing = updatedAssets[existingIdx];
                const newQuantity = existing.quantity + draft.quantity;
                const newTotalValue = existing.totalValue + draft.totalValue;

                const sources = new Set((existing.source || "").split(", ").filter(Boolean));
                if (sourceToUse) sources.add(sourceToUse);
                const combinedSource = Array.from(sources).join(", ");

                const merged = {
                    ...existing,
                    quantity: newQuantity,
                    totalValue: newTotalValue,
                    source: combinedSource || existing.source,
                    updatedAt: new Date().toISOString(),
                    aiRationale: `Combined holdings. ${existing.aiRationale || ""} ${draft.aiRationale || ""}`.trim()
                };
                updatedAssets[existingIdx] = merged;
                updatedToSave.push(merged);
            } else {
                const toAdd = sourceToUse ? { ...draft, source: sourceToUse } : draft;
                updatedAssets.push(toAdd);
                newToSave.push(toAdd);
            }
        });

        setAssets(updatedAssets);
        setDraftAssets([]);
        setIsAddModalOpen(false);
        setInputText("");

        // Persist to Firestore (fire-and-forget — UI already updated)
        await Promise.all([
            saveAssets(uid, newToSave),
            saveAssets(uid, updatedToSave),
        ]);
    };

    const handleBulkDelete = async () => {
        if (isDemo || !uid) return;
        const newAssets = assets.filter(a => !selectedAssetIds.includes(a.id));
        setAssets(newAssets);
        setSelectedAssetIds([]);
        setIsSelectMode(false);
        await deleteAssets(uid, selectedAssetIds);
    };

    const sortedAssets = [...assets].sort((a, b) => {
        if (sortBy === 'value_desc') {
            const valA = convertCurrency(a.totalValue, a.totalValueCurrency, displayCurrency, fxRates);
            const valB = convertCurrency(b.totalValue, b.totalValueCurrency, displayCurrency, fxRates);
            return valB - valA;
        }
        if (sortBy === 'value_asc') {
            const valA = convertCurrency(a.totalValue, a.totalValueCurrency, displayCurrency, fxRates);
            const valB = convertCurrency(b.totalValue, b.totalValueCurrency, displayCurrency, fxRates);
            return valA - valB;
        }
        return a.name.localeCompare(b.name);
    });

    const handleUpdateAsset = async (updated: Asset) => {
        const newAssets = assets.map(a => a.id === updated.id ? updated : a);
        setAssets(newAssets);
        setIsEditModalOpen(false);
        if (uid) await saveAsset(uid, updated);
    };

    const handleDeleteAsset = async (id: string) => {
        const newAssets = assets.filter(a => a.id !== id);
        setAssets(newAssets);
        setIsEditModalOpen(false);
        if (uid) await deleteAsset(uid, id);
    };

    const handleSaveGoal = async (newGoal: FinancialGoal) => {
        setGoalState(newGoal);
        setIsEditingGoal(false);
        if (uid) await firestoreSaveGoal(uid, newGoal);
    };

    const handleClearGoal = async () => {
        setGoalState(null);
        setIsEditingGoal(false);
        if (uid) await firestoreClearGoal(uid);
    };

    const handleRefreshAsset = async (asset: Asset) => {
        if (isDemo || !asset.ticker || !uid) return;
        if (!LIVE_PRICE_TYPES.includes(asset.assetType)) return;
        setRefreshingAssetId(asset.id);
        try {
            const quote = await fetchLiveQuote(asset.ticker, asset.assetType);
            if (quote) {
                const updated: Asset = {
                    ...asset,
                    unitPrice: quote.regularMarketPrice,
                    totalValue: quote.regularMarketPrice * asset.quantity,
                    unitPriceCurrency: quote.currency || asset.unitPriceCurrency,
                    totalValueCurrency: quote.currency || asset.unitPriceCurrency,
                    valueSource: "live_price",
                    lastRefreshed: new Date().toISOString(),
                };
                setAssets(prev => prev.map(a => a.id === asset.id ? updated : a));
                await saveAsset(uid, updated);
            }
        } finally {
            setRefreshingAssetId(null);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isDemo) return;
        const file = e.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        setAnalysisError(null);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            try {
                const parsed = await parseScreenshotToAssets(base64, displayCurrency, user?.country || "ZA");
                setDraftAssets(parsed.map(p => {
                    const quantity = p.quantity || 1;
                    const unitPrice = p.unitPrice || (p.totalValue / quantity) || 0;
                    const totalValue = p.totalValue || (unitPrice * quantity) || 0;

                    return {
                        ...p,
                        quantity,
                        unitPrice,
                        totalValue,
                        id: uuidv4(),
                        lastRefreshed: new Date().toISOString(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        inputMethod: 'screenshot'
                    } as Asset;
                }));
            } catch (e: unknown) {
                console.error(e);
                const err = e as { message?: string; status?: string };
                if (err.message?.includes("quota") || err.status === "RESOURCE_EXHAUSTED" || err.message?.includes("429")) {
                    setAnalysisError("AI Quota Exceeded. Please wait a minute before trying again.");
                } else {
                    setAnalysisError("Failed to process screenshot. The image might be too large or unclear.");
                }
            } finally {
                setIsAnalyzing(false);
            }
        };
        reader.readAsDataURL(file);
    };

    return {
        assets,
        navHistory,
        displayCurrency,
        setDisplayCurrency,
        fxRates,
        isAddModalOpen,
        setIsAddModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        selectedAsset,
        setSelectedAsset,
        isLoading,
        inputText,
        setInputText,
        isAnalyzing,
        analysisError,
        setAnalysisError,
        draftAssets,
        setDraftAssets,
        currentView,
        setCurrentView,
        selectedAssetIds,
        setSelectedAssetIds,
        sortBy,
        setSortBy,
        isSelectMode,
        setIsSelectMode,
        totalNAV,
        change,
        changePercent,
        changePeriod,
        setChangePeriod,
        goal,
        isEditingGoal,
        setIsEditingGoal,
        handleSaveGoal,
        handleClearGoal,
        sortedAssets,
        handleAddAsset,
        handleSaveDrafts,
        handleBulkDelete,
        handleUpdateAsset,
        handleDeleteAsset,
        handleFileUpload,
        refreshingAssetId,
        handleRefreshAsset,
        isAccountMenuOpen,
        setIsAccountMenuOpen,
    };
};
