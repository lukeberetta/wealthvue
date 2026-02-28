import React, { useState } from "react";
import {
    Plus,
    RefreshCw,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    Trash2,
    Loader2
} from "lucide-react";
import { User, Asset } from "../../types";
import { formatCurrency, cn } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { AppNav } from "../../components/ui/AppNav";
import { Footer } from "../../components/ui/Footer";
import { SettingsView } from "../settings/SettingsView";
import { useDashboard } from "./hooks/useDashboard";
import { PortfolioInsights, getArchetype } from "./components/PortfolioInsights";
import { PortfolioAdviceModal } from "./components/PortfolioAdviceModal";
import { AssetList } from "./components/AssetList";
import { AddAssetModal } from "./components/AddAssetModal";
import { EditAssetModal } from "./components/EditAssetModal";
import { convertCurrency } from "../../lib/fx";

interface DashboardProps {
    user: User | null;
    isDemo: boolean;
    onSignOut: () => void;
    onGoHome: () => void;
    onUpdateUser: (user: User) => void;
}

export const Dashboard = ({ user, isDemo, onSignOut, onGoHome, onUpdateUser }: DashboardProps) => {
    const [isAdviceModalOpen, setIsAdviceModalOpen] = useState(false);

    const {
        assets,
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
        sortedAssets,
        handleAddAsset,
        handleSaveDrafts,
        handleBulkDelete,
        handleUpdateAsset,
        handleDeleteAsset,
        handleFileUpload
    } = useDashboard(user, isDemo);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg">
                <Loader2 className="animate-spin text-accent" size={36} />
            </div>
        );
    }

    // Portfolio archetype — shared between PortfolioInsights and PortfolioAdviceModal
    const byType: Record<string, number> = assets.reduce((acc: Record<string, number>, a: Asset) => {
        const val = convertCurrency(a.totalValue, a.totalValueCurrency, displayCurrency, fxRates);
        acc[a.assetType] = (acc[a.assetType] || 0) + val;
        return acc;
    }, {});
    const allocationTotal: number = Object.values(byType).reduce((s: number, v: number) => s + v, 0);
    const allocationPct: Record<string, number> = Object.fromEntries(
        Object.entries(byType).map(([k, v]) => [k, allocationTotal > 0 ? (v / allocationTotal) * 100 : 0])
    );
    const archetype = getArchetype(allocationPct);

    // Shared nav props
    const navProps = {
        user,
        isDemo,
        displayCurrency,
        fxRates,
        onDisplayCurrencyChange: setDisplayCurrency,
        onSignIn: onGoHome,         // from app context, sign-in = go home to trigger login modal
        onSignOut,
        onOpenSettings: () => setCurrentView("settings"),
    };

    if (currentView === "settings") {
        return (
            <div className="min-h-screen flex flex-col bg-bg text-text-1">
                <AppNav {...navProps} onOpenSettings={undefined} />
                <main className="flex-1 pt-24 px-6">
                    <SettingsView
                        user={user}
                        onSignOut={onSignOut}
                        onBack={() => setCurrentView("dashboard")}
                        onUpdateUser={(updated) => {
                            onUpdateUser(updated);
                            setDisplayCurrency(updated.defaultCurrency);
                        }}
                    />
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-bg text-text-1">
            {/* Demo banner */}
            {isDemo && (
                <div className="bg-accent text-white py-2 text-center text-xs font-bold uppercase tracking-widest z-50 relative">
                    DEMO MODE ·{" "}
                    <button onClick={onSignOut} className="underline hover:no-underline">
                        Sign in
                    </button>{" "}
                    to track your real assets
                </div>
            )}

            <AppNav {...navProps} />

            <main className="flex-1 max-w-[1120px] mx-auto w-full px-6 pt-28 pb-12 space-y-10">

                {/* NAV Hero — net worth headline */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <p className="text-[10px] font-bold text-text-3 uppercase tracking-[0.22em] mb-2">
                            Total Net Worth
                        </p>
                        <h2 className="text-5xl font-serif tabular-nums text-text-1">
                            {formatCurrency(totalNAV, displayCurrency)}
                        </h2>
                        <div className={cn(
                            "flex items-center gap-2 mt-3 text-sm font-medium",
                            change >= 0 ? "text-positive" : "text-negative"
                        )}>
                            <div className={cn(
                                "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm",
                                change >= 0 ? "bg-positive/10" : "bg-negative/10"
                            )}>
                                {change >= 0
                                    ? <ArrowUpRight size={14} />
                                    : <ArrowDownRight size={14} />}
                                <span className="tabular-nums">
                                    {formatCurrency(Math.abs(change), displayCurrency)} ({Math.abs(changePercent).toFixed(2)}%)
                                </span>
                            </div>
                            <span className="text-text-3 font-normal text-xs">since yesterday</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            className="flex items-center gap-2 rounded-full px-5 py-2 text-sm"
                        >
                            <RefreshCw size={15} />
                            Refresh Prices
                        </Button>
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 rounded-full px-5 py-2 text-sm"
                        >
                            <Plus size={17} />
                            Add Asset
                        </Button>
                    </div>
                </div>

                {/* Portfolio Insights */}
                <PortfolioInsights
                    assets={assets}
                    displayCurrency={displayCurrency}
                    fxRates={fxRates}
                    onOpenAdvice={() => setIsAdviceModalOpen(true)}
                />

                {/* Asset list */}
                <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-[0.22em]">
                            Your Assets
                        </h3>

                        <div className="flex items-center gap-2.5 w-full sm:w-auto">
                            {selectedAssetIds.length > 0 && (
                                <Button
                                    variant="ghost"
                                    onClick={handleBulkDelete}
                                    className="text-negative hover:bg-negative/5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg"
                                >
                                    <Trash2 size={13} />
                                    Delete ({selectedAssetIds.length})
                                </Button>
                            )}

                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setIsSelectMode(!isSelectMode);
                                    if (isSelectMode) setSelectedAssetIds([]);
                                }}
                                className={cn(
                                    "text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-lg",
                                    isSelectMode
                                        ? "text-accent bg-accent/10"
                                        : "text-text-3 hover:bg-surface-2"
                                )}
                            >
                                {isSelectMode ? "Cancel" : "Select"}
                            </Button>

                            <div className="relative flex-1 sm:flex-none">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="w-full appearance-none bg-surface-2 border border-border rounded-lg px-4 py-1.5 pr-9 text-xs font-bold text-text-1 focus:outline-none focus:ring-2 focus:ring-accent/20"
                                >
                                    <option value="value_desc">Value: High to Low</option>
                                    <option value="value_asc">Value: Low to High</option>
                                    <option value="name_asc">Name: A to Z</option>
                                </select>
                                <ChevronDown
                                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-3"
                                    size={13}
                                />
                            </div>
                        </div>
                    </div>

                    <AssetList
                        assets={sortedAssets}
                        displayCurrency={displayCurrency}
                        fxRates={fxRates}
                        isSelectMode={isSelectMode}
                        selectedAssetIds={selectedAssetIds}
                        onSelectAsset={(id, checked) => {
                            if (checked) {
                                setSelectedAssetIds([...selectedAssetIds, id]);
                            } else {
                                setSelectedAssetIds(selectedAssetIds.filter(x => x !== id));
                            }
                        }}
                        onEditAsset={(asset) => {
                            setSelectedAsset(asset);
                            setIsEditModalOpen(true);
                        }}
                        onAddAsset={() => setIsAddModalOpen(true)}
                    />
                </div>
            </main>

            <Footer />

            {/* Modals */}
            <AddAssetModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setDraftAssets([]);
                    setInputText("");
                    setAnalysisError(null);
                }}
                isAnalyzing={isAnalyzing}
                analysisError={analysisError}
                inputText={inputText}
                onInputTextChange={setInputText}
                onFileUpload={handleFileUpload}
                onAnalyze={handleAddAsset}
                draftAssets={draftAssets}
                onUpdateDraft={(index, updated) => {
                    setDraftAssets(prev => prev.map((d, i) => i === index ? { ...d, ...updated } : d));
                }}
                onDiscardDrafts={() => setDraftAssets([])}
                onSaveDrafts={handleSaveDrafts}
                displayCurrency={displayCurrency}
            />

            {selectedAsset && (
                <EditAssetModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    selectedAsset={selectedAsset}
                    onUpdateAsset={handleUpdateAsset}
                    onDeleteAsset={handleDeleteAsset}
                    onAssetChange={setSelectedAsset}
                    isDemo={isDemo}
                />
            )}

            <PortfolioAdviceModal
                isOpen={isAdviceModalOpen}
                onClose={() => setIsAdviceModalOpen(false)}
                assets={assets}
                totalNAV={totalNAV}
                displayCurrency={displayCurrency}
                fxRates={fxRates}
                archetypeTitle={archetype.title}
                archetypeSubtitle={archetype.subtitle}
            />
        </div>
    );
};
