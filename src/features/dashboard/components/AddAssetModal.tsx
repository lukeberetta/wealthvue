import React from "react";
import { Sparkles, Upload, Loader2, Check, Briefcase, Coins, Car, Home, Wallet, MoreHorizontal, AlertCircle } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Asset } from "../../../types";
import { formatCurrency, cn } from "../../../lib/utils";

interface AddAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInputTextChange: (text: string) => void;
    isAnalyzing: boolean;
    inputText: string;
    analysisError?: string | null;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAnalyze: () => void;
    draftAssets: Partial<Asset>[];
    onDiscardDrafts: () => void;
    onSaveDrafts: () => void;
    displayCurrency: string;
}

export const AddAssetModal = ({
    isOpen,
    onClose,
    isAnalyzing,
    inputText,
    onInputTextChange,
    analysisError,
    onFileUpload,
    onAnalyze,
    draftAssets,
    onDiscardDrafts,
    onSaveDrafts,
    displayCurrency
}: AddAssetModalProps) => {
    const getIcon = (type?: string) => {
        switch (type) {
            case 'stock': return <Briefcase size={20} />;
            case 'crypto': return <Coins size={20} />;
            case 'vehicle': return <Car size={20} />;
            case 'property': return <Home size={20} />;
            case 'cash': return <Wallet size={20} />;
            default: return <MoreHorizontal size={20} />;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Asset">
            <div className="space-y-8">
                {draftAssets.length === 0 ? (
                    <div className="space-y-6">
                        <div className="bg-accent-light/30 p-6 rounded-2xl border border-accent/10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white">
                                    <Sparkles size={18} />
                                </div>
                                <h4 className="font-serif text-lg">AI-Powered Input</h4>
                            </div>
                            <p className="text-sm text-text-2 mb-6">
                                Describe your asset in plain English or upload a screenshot from any investment app.
                            </p>

                            <div className="space-y-4">
                                <textarea
                                    className="w-full h-32 p-4 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none text-sm leading-relaxed"
                                    placeholder="E.g.: 'I have 15 shares of Apple' or '2020 VW Polo 1.0 with 50,000km'..."
                                    value={inputText}
                                    onChange={(e) => onInputTextChange(e.target.value)}
                                    disabled={isAnalyzing}
                                />

                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-px bg-border" />
                                    <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">OR</span>
                                    <div className="flex-1 h-px bg-border" />
                                </div>

                                <label className={cn(
                                    "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-surface-2 transition-all group",
                                    isAnalyzing && "opacity-50 pointer-events-none"
                                )}>
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 text-text-3 group-hover:text-accent transition-colors mb-2" />
                                        <p className="text-xs font-medium text-text-2">Upload screenshot</p>
                                        <p className="text-[10px] text-text-3 mt-1 uppercase tracking-tighter">PNG, JPG up to 10MB</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={onFileUpload} />
                                </label>
                            </div>
                        </div>

                        {analysisError && (
                            <div className="bg-negative/5 p-4 rounded-xl border border-negative/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <div className="w-8 h-8 bg-negative/10 rounded-full flex items-center justify-center text-negative shrink-0">
                                    <AlertCircle size={18} />
                                </div>
                                <p className="text-sm font-medium text-negative">{analysisError}</p>
                            </div>
                        )}

                        <Button
                            className="w-full py-4 rounded-xl flex items-center justify-center gap-2 text-lg font-medium shadow-lg shadow-accent/10"
                            onClick={onAnalyze}
                            disabled={isAnalyzing || !inputText.trim()}
                        >
                            {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                            {isAnalyzing ? "AI is analyzing..." : "Analyze with AI"}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-positive/5 p-4 rounded-xl border border-positive/20 flex items-center gap-3">
                            <div className="w-8 h-8 bg-positive/10 rounded-full flex items-center justify-center text-positive">
                                <Check size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-positive">Analysis Complete</p>
                                <p className="text-xs text-text-3">Review the detected assets below before saving.</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {draftAssets.map((asset, idx) => (
                                <div key={idx} className="bg-surface-2/50 p-4 rounded-xl border border-border flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center text-accent">
                                            {getIcon(asset.assetType)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{asset.name}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] font-bold text-text-3 uppercase tracking-tighter">
                                                    {asset.quantity && asset.quantity > 1 ? `${asset.quantity} units · ` : ''}
                                                    {formatCurrency(asset.unitPrice || 0, asset.unitPriceCurrency || displayCurrency)}
                                                </p>
                                                {asset.source && (
                                                    <>
                                                        <span className="text-text-3">·</span>
                                                        <span className="text-[9px] font-bold text-accent uppercase tracking-tighter bg-accent-light/50 px-1 rounded">
                                                            {asset.source}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium tabular-nums text-sm">
                                            {formatCurrency(asset.totalValue || 0, asset.totalValueCurrency || displayCurrency)}
                                        </p>
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent-light text-accent font-bold uppercase tracking-tighter">
                                            AI Estimate
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <Button variant="secondary" className="flex-1 py-3 rounded-xl" onClick={onDiscardDrafts}>
                                Discard
                            </Button>
                            <Button className="flex-[2] py-3 rounded-xl" onClick={onSaveDrafts}>
                                Save to Portfolio
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};
