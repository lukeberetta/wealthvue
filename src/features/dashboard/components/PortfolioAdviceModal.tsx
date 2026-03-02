import React, { useEffect, useState } from "react";
import { Sparkles, AlertTriangle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Modal } from "../../../components/ui/Modal";
import { Asset, NAVHistoryEntry, FinancialGoal } from "../../../types";
import { analyzePortfolio } from "../../../services/gemini";
import { convertCurrency } from "../../../lib/fx";

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
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ summary: string; advice: string[] } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || result) return;

        const run = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Aggregate by type with per-type counts
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

                // Individual asset details, sorted by value descending, capped at 15
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

                // 30-day NAV trend (history stored in USD, convert to display currency)
                let navTrend: { change: number; changePct: number; period: string } | null = null;
                if (navHistory.length >= 2) {
                    const sorted = [...navHistory].sort((a, b) => a.date.localeCompare(b.date));
                    const latest = sorted[sorted.length - 1];
                    const cutoff = new Date();
                    cutoff.setDate(cutoff.getDate() - 30);
                    const cutoffStr = cutoff.toISOString().split('T')[0];
                    const anchor = sorted.filter(e => e.date <= cutoffStr).at(-1) ?? sorted[0];
                    if (anchor.totalNAV > 0 && latest !== anchor) {
                        const latestDisplay = convertCurrency(latest.totalNAV, 'USD', displayCurrency, fxRates);
                        const anchorDisplay = convertCurrency(anchor.totalNAV, 'USD', displayCurrency, fxRates);
                        navTrend = {
                            change: latestDisplay - anchorDisplay,
                            changePct: ((latest.totalNAV - anchor.totalNAV) / anchor.totalNAV) * 100,
                            period: "30 days",
                        };
                    }
                }

                // Goal progress
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
                setResult(data);
            } catch (e: any) {
                if (e.message?.includes("quota") || e.status === "RESOURCE_EXHAUSTED" || e.message?.includes("429")) {
                    setError("AI quota exceeded. Please wait a moment and try again.");
                } else {
                    setError("Couldn't generate analysis right now. Please try again.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        run();
    }, [isOpen]);

    // Reset on close so next open triggers a fresh call
    const handleClose = () => {
        setResult(null);
        setError(null);
        onClose();
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
                    <div className="flex items-start gap-3 p-4 bg-negative/8 border border-negative/20 rounded-xl">
                        <AlertTriangle size={16} className="text-negative shrink-0 mt-0.5" />
                        <p className="text-sm text-text-2">{error}</p>
                    </div>
                )}

                {/* Results */}
                {!isLoading && result && (
                    <>
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

                        <p className="text-[10px] text-text-3 pt-2 border-t border-border/50">
                            AI-generated analysis based on your current portfolio. Not financial advice.
                        </p>
                    </>
                )}
            </div>
        </Modal>
    );
};
