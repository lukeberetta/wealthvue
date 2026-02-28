import React, { useEffect, useState } from "react";
import { Loader2, Sparkles, AlertTriangle, ArrowRight } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Asset } from "../../../types";
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
                const byType = assets.reduce((acc, asset) => {
                    const val = convertCurrency(asset.totalValue, asset.totalValueCurrency, displayCurrency, fxRates);
                    acc[asset.assetType] = (acc[asset.assetType] || 0) + val;
                    return acc;
                }, {} as Record<string, number>);

                const breakdown = Object.entries(byType).map(([assetType, value]) => ({
                    assetType,
                    value,
                    pct: totalNAV > 0 ? (value / totalNAV) * 100 : 0,
                }));

                const data = await analyzePortfolio(breakdown, totalNAV, displayCurrency);
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
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <Loader2 size={28} className="animate-spin text-accent" />
                        <p className="text-sm text-text-2">Analysing your portfolio...</p>
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
