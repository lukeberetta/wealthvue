import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Asset, User, NAVHistoryEntry, FinancialGoal } from "../../../types";
import { storage } from "../../../lib/storage";
import { fetchFXRates, convertCurrency } from "../../../lib/fx";
import { parseTextToAsset, parseScreenshotToAssets } from "../../../services/gemini";

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

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const rates = await fetchFXRates();
            setFxRates(rates.rates);

            const loadedAssets = storage.getAssets(isDemo);
            const loadedHistory = storage.getNAVHistory(isDemo);

            setAssets(loadedAssets);
            setNavHistory(loadedHistory);
            setGoalState(storage.getGoal(isDemo));
            setIsLoading(false);

            if (!isDemo && user) {
                // Auto-refresh prices via Yahoo Finance API
                let updated = false;
                const newAssets = await Promise.all(loadedAssets.map(async (asset) => {
                    if (asset.ticker && (asset.assetType === "stock" || asset.assetType === "crypto")) {
                        let fetchTicker = asset.ticker;
                        if (asset.assetType === "crypto" && !fetchTicker.includes("-")) {
                            fetchTicker = `${fetchTicker}-USD`;
                        }
                        try {
                            const res = await fetch(`/api/price?ticker=${fetchTicker}`);
                            if (res.ok) {
                                const quote = await res.json();
                                if (quote?.regularMarketPrice && quote.regularMarketPrice !== asset.unitPrice) {
                                    updated = true;
                                    const newUnitPrice = quote.regularMarketPrice;
                                    return {
                                        ...asset,
                                        unitPrice: newUnitPrice,
                                        totalValue: newUnitPrice * asset.quantity,
                                        totalValueCurrency: quote.currency || asset.unitPriceCurrency,
                                        unitPriceCurrency: quote.currency || asset.unitPriceCurrency,
                                        valueSource: "live_price" as const,
                                        lastRefreshed: new Date().toISOString()
                                    };
                                }
                            }
                        } catch (e) {
                            console.warn("Auto-refresh failed for", asset.ticker);
                        }
                    }
                    return asset;
                }));

                if (updated) {
                    setAssets(newAssets);
                    storage.saveAssets(newAssets);
                }

                const today = new Date().toISOString().split('T')[0];
                const hasToday = loadedHistory.some(h => h.date === today);
                if (!hasToday) {
                    const navAssets = updated ? newAssets : loadedAssets;
                    const totalNAV = navAssets.reduce((acc, asset) => {
                        return acc + convertCurrency(asset.totalValue, asset.totalValueCurrency, "USD", rates.rates);
                    }, 0);
                    const newHistory = [...loadedHistory, { date: today, totalNAV, displayCurrency: "ZAR" }];
                    setNavHistory(newHistory);
                    storage.saveNAVHistory(newHistory);
                }
            }
        };
        loadData();
    }, [isDemo, user]);

    const totalNAV = assets.reduce((acc, asset) => {
        return acc + convertCurrency(asset.totalValue, asset.totalValueCurrency, displayCurrency, fxRates);
    }, 0);

    const anchorEntry = getPeriodAnchor(navHistory, changePeriod);
    const convertedPrevNAV = anchorEntry
        ? convertCurrency(anchorEntry.totalNAV, "USD", displayCurrency, fxRates)
        : totalNAV;
    const change = totalNAV - convertedPrevNAV;
    const changePercent = (change / (convertedPrevNAV || 1)) * 100;

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
        } catch (e: any) {
            console.error(e);
            if (e.message?.includes("quota") || e.status === "RESOURCE_EXHAUSTED" || e.message?.includes("429")) {
                setAnalysisError("AI Quota Exceeded. Please wait a minute or upgrade your plan to continue.");
            } else {
                setAnalysisError("Failed to analyze text. Please try describing it differently.");
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSaveDrafts = () => {
        let updatedAssets = [...assets];

        (draftAssets as Asset[]).forEach(draft => {
            const existingIdx = updatedAssets.findIndex(a =>
                a.name.toLowerCase() === draft.name.toLowerCase() &&
                a.assetType === draft.assetType
            );

            if (existingIdx !== -1) {
                const existing = updatedAssets[existingIdx];
                const newQuantity = existing.quantity + draft.quantity;
                const newTotalValue = existing.totalValue + draft.totalValue;

                const sources = new Set((existing.source || "").split(", ").filter(Boolean));
                if (draft.source) sources.add(draft.source);
                const combinedSource = Array.from(sources).join(", ");

                updatedAssets[existingIdx] = {
                    ...existing,
                    quantity: newQuantity,
                    totalValue: newTotalValue,
                    source: combinedSource || existing.source,
                    updatedAt: new Date().toISOString(),
                    aiRationale: `Combined holdings. ${existing.aiRationale || ""} ${draft.aiRationale || ""}`.trim()
                };
            } else {
                updatedAssets.push(draft);
            }
        });

        setAssets(updatedAssets);
        storage.saveAssets(updatedAssets);
        setDraftAssets([]);
        setIsAddModalOpen(false);
        setInputText("");
    };

    const handleBulkDelete = () => {
        if (isDemo) return;
        const newAssets = assets.filter(a => !selectedAssetIds.includes(a.id));
        setAssets(newAssets);
        storage.saveAssets(newAssets);
        setSelectedAssetIds([]);
        setIsSelectMode(false);
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

    const handleUpdateAsset = (updated: Asset) => {
        const newAssets = assets.map(a => a.id === updated.id ? updated : a);
        setAssets(newAssets);
        storage.saveAssets(newAssets);
        setIsEditModalOpen(false);
    };

    const handleDeleteAsset = (id: string) => {
        const newAssets = assets.filter(a => a.id !== id);
        setAssets(newAssets);
        storage.saveAssets(newAssets);
        setIsEditModalOpen(false);
    };

    const handleSaveGoal = (newGoal: FinancialGoal) => {
        setGoalState(newGoal);
        storage.saveGoal(newGoal);
        setIsEditingGoal(false);
    };

    const handleClearGoal = () => {
        setGoalState(null);
        storage.clearGoal();
        setIsEditingGoal(false);
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
            } catch (e: any) {
                console.error(e);
                if (e.message?.includes("quota") || e.status === "RESOURCE_EXHAUSTED" || e.message?.includes("429")) {
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
        handleFileUpload
    };
};
