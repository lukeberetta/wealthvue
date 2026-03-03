import React, { useEffect, useState } from "react";
import { Sparkles, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Modal } from "../../../components/ui/Modal";
import { Asset, NAVHistoryEntry, FinancialGoal } from "../../../types";
import { analyzePortfolio } from "../../../services/gemini";
import { convertCurrency } from "../../../lib/fx";
import { useAuth } from "../../../contexts/AuthContext";
import {
    loadCachedAnalysis,
    saveCachedAnalysis,
} from "../../../services/firestoreService";

interface PortfolioAdviceModalProps {
    isOpen: boolean;
    onClose: () => void;
    assets: Asset[];
    totalNAV: number;
    displayCurrency: string;
    fxRates: { [key: string]: number };
    archetypeTitle: string;
    archetypeSubtitle: string;
    goal: FinancialGoal | null;
    navHistory: NAVHistoryEntry[];
}

const CACHE_TTL_HOURS = 24;

const ANALYSIS_MESSAGES = [
    "Reviewing your holdings…",
    "Looking up market conditions…",
    "Assessing risk and allocation…",
    "Crunching the numbers…",
    "Writing personalised insights…",
];

function AnalysisMessages() {
    const [index, setIndex] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setIndex(i => (i + 1) % ANALYSIS_MESSAGES.length), 2200);
        return () => clearInterval(id);
    }, []);
    return (
        <div className="h-6 overflow-hidden relative w-full">
            <AnimatePresence mode="wait">
                <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.32 }}
                    className="text-sm text-text-2 text-center absolute inset-x-0"
                >
                    {ANALYSIS_MESSAGES[index]}
                </motion.p>
            </AnimatePresence>
        </div>
    );
}

/**
 * Compute a short deterministic string from the portfolio's asset-type
 * allocation percentages (rounded to the nearest whole-percent).
 * When this string changes, the cache is considered stale regardless of age.
 */
function computePortfolioHash(
    breakdown: { assetType: string; pct: number }[]
): string {
    return [...breakdown]
        .sort((a, b) => a.assetType.localeCompare(b.assetType))
        .map(b => `${b.assetType}:${Math.round(b.pct)}`)
        .join("|");
}

function formatAgeLabel(isoDate: string): string {
    const ageMs = Date.now() - new Date(isoDate).getTime();
    const hours = Math.floor(ageMs / (1000 * 60 * 60));
    const minutes = Math.floor(ageMs / (1000 * 60));
    if (hours >= 1) return `${hours}h ago`;
    if (minutes >= 1) return `${minutes}m ago`;
    return "just now";
}

export const PortfolioAdviceModal = ({
    isOpen,
    onClose,
    assets,
    totalNAV,
    displayCurrency,
    fxRates,
    archetypeTitle,
    archetypeSubtitle,
    goal,
    navHistory,
}: PortfolioAdviceModalProps) => {
    const { firebaseUser } = useAuth();
    const uid = firebaseUser?.uid ?? null;

    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ summary: string; advice: string[] } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cachedAt, setCachedAt] = useState<string | null>(null); // ISO date if result came from cache
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        if (!isOpen) return;
        // If we already have a result in state and this isn't a manual refresh,
        // keep showing it without re-fetching.
        if (result && refreshTrigger === 0) return;

        const run = async () => {
            setIsLoading(true);
            setError(null);
            setCachedAt(null);

            // ---- Build the portfolio breakdown (needed for hash + AI call) ----
            const byType: Record<string, number> = {};
            const countByType: Record<string, number> = {};
            for (const asset of assets) {
                const val = convertCurrency(asset.totalValue, asset.totalValueCurrency, displayCurrency, fxRates);
                byType[asset.assetType] = (byType[asset.assetType] || 0) + val;
                countByType[asset.assetType] = (countByType[asset.assetType] || 0) + 1;
            }

            const breakdown = Object.entries(byType).map(([assetType, value]) => ({
                assetType,
                value,
                pct: totalNAV > 0 ? (value / totalNAV) * 100 : 0,
                count: countByType[assetType] || 0,
            }));

            const currentHash = computePortfolioHash(breakdown);

            // ---- Check Firestore cache (only for authenticated users) ----
            if (uid && refreshTrigger === 0) {
                const cached = await loadCachedAnalysis(uid);
                if (cached) {
                    const ageMs = Date.now() - new Date(cached.generatedAt).getTime();
                    const ttlMs = CACHE_TTL_HOURS * 60 * 60 * 1000;
                    if (cached.portfolioHash === currentHash && ageMs < ttlMs) {
                        setResult({ summary: cached.summary, advice: cached.advice });
                        setCachedAt(cached.generatedAt);
                        setIsLoading(false);
                        return;
                    }
                }
            }

            // ---- Full AI analysis ----
            try {
                const assetDetails = assets
                    .map(a => ({
                        name: a.name,
                        ticker: a.ticker,
                        assetType: a.assetType,
                        valuePct: totalNAV > 0
                            ? (convertCurrency(a.totalValue, a.totalValueCurrency, displayCurrency, fxRates) / totalNAV) * 100
                            : 0,
                    }))
                    .sort((a, b) => b.valuePct - a.valuePct)
                    .slice(0, 15);

                let navTrend: { change: number; changePct: number; period: string } | null = null;
                if (navHistory.length >= 2) {
                    const sorted = [...navHistory].sort((a, b) => a.date.localeCompare(b.date));
                    const latest = sorted[sorted.length - 1];
                    const cutoff = new Date();
                    cutoff.setDate(cutoff.getDate() - 30);
                    const cutoffStr = cutoff.toISOString().split("T")[0];
                    const anchor = sorted.filter(e => e.date <= cutoffStr).at(-1) ?? sorted[0];
                    if (anchor.totalNAV > 0 && latest !== anchor) {
                        const latestDisplay = convertCurrency(latest.totalNAV, "USD", displayCurrency, fxRates);
                        const anchorDisplay = convertCurrency(anchor.totalNAV, "USD", displayCurrency, fxRates);
                        navTrend = {
                            change: latestDisplay - anchorDisplay,
                            changePct: ((latest.totalNAV - anchor.totalNAV) / anchor.totalNAV) * 100,
                            period: "30 days",
                        };
                    }
                }

                let goalContext: { targetAmount: number; currency: string; progressPct: number } | null = null;
                if (goal) {
                    const targetInDisplay = convertCurrency(goal.targetAmount, goal.currency, displayCurrency, fxRates);
                    goalContext = {
                        targetAmount: targetInDisplay,
                        currency: displayCurrency,
                        progressPct: targetInDisplay > 0 ? (totalNAV / targetInDisplay) * 100 : 0,
                    };
                }

                const data = await analyzePortfolio(breakdown, totalNAV, displayCurrency, assetDetails, goalContext, navTrend);
                if (!data) throw new Error("No analysis returned");

                setResult(data);
                setCachedAt(null); // fresh result — no "cached" badge

                // Persist to Firestore in the background
                if (uid) {
                    saveCachedAnalysis(uid, {
                        summary: data.summary,
                        advice: data.advice,
                        generatedAt: new Date().toISOString(),
                        portfolioHash: currentHash,
                    });
                }
            } catch (e: unknown) {
                const err = e as { message?: string; status?: string };
                if (err.message?.includes("quota") || err.status === "RESOURCE_EXHAUSTED" || err.message?.includes("429")) {
                    setError("AI quota exceeded. Please wait a moment and try again.");
                } else {
                    setError("Couldn't generate analysis right now. Please try again.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, refreshTrigger]);

    // Keep result visible between open/close cycles — only reset on manual refresh
    const handleClose = () => {
        setError(null);
        onClose();
    };

    const handleRefresh = () => {
        setResult(null);
        setCachedAt(null);
        setError(null);
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Portfolio Analysis">
            <div className="space-y-6">

                {/* Archetype header */}
                <div className="flex items-start gap-4 p-4 bg-accent/6 border border-accent/15 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles size={14} className="text-accent" />
                    </div>
                    <div>
                        <p className="font-serif text-lg text-text-1">{archetypeTitle}</p>
                        <p className="text-sm text-text-2 italic mt-0.5">{archetypeSubtitle}</p>
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12 gap-6">
                        <div className="w-10 h-10 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
                        <div className="text-center space-y-2">
                            <AnalysisMessages />
                            <p className="text-[11px] text-text-3">Using live market data for context</p>
                        </div>
                    </div>
                )}

                {/* Error */}
                {!isLoading && error && (
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-4 bg-negative/8 border border-negative/20 rounded-xl">
                            <AlertTriangle size={16} className="text-negative shrink-0 mt-0.5" />
                            <p className="text-sm text-text-2">{error}</p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            className="flex items-center gap-1.5 text-xs text-text-3 hover:text-text-2 transition-colors"
                        >
                            <RefreshCw size={12} />
                            Try again
                        </button>
                    </div>
                )}

                {/* Results */}
                {!isLoading && result && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-5"
                        >
                            {/* Summary */}
                            <div>
                                <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-3">Summary</p>
                                <p className="text-sm text-text-1 leading-relaxed">{result.summary}</p>
                            </div>

                            <div className="border-t border-border" />

                            {/* Advice */}
                            <div>
                                <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-4">What to focus on</p>
                                <ul className="space-y-3">
                                    {result.advice.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <ArrowRight size={10} className="text-accent" />
                                            </div>
                                            <p className="text-sm text-text-1 leading-relaxed">{item}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Footer — cache badge + refresh */}
                            <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                <p className="text-[10px] text-text-3">
                                    {cachedAt
                                        ? `Analysed ${formatAgeLabel(cachedAt)} · cached`
                                        : "AI-generated analysis · not financial advice"}
                                </p>
                                <button
                                    onClick={handleRefresh}
                                    disabled={isLoading}
                                    className="flex items-center gap-1 text-[10px] text-text-3 hover:text-accent transition-colors disabled:opacity-40"
                                    title="Run fresh analysis"
                                >
                                    <RefreshCw size={10} />
                                    Refresh
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </Modal>
    );
};
