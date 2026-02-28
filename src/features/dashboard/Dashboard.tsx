import React, { useState } from "react";
import {
    Plus,
    RefreshCw,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    Trash2,
    Loader2,
    Target,
    Pencil,
    X,
    Check
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { AnimatedNumber } from "./components/AnimatedNumber";
import { FinancialGoal } from "../../types";
import { User, Asset } from "../../types";
import { formatCurrency, formatCurrencyCompact, cn } from "../../lib/utils";
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
    const [goalAmountInput, setGoalAmountInput] = useState('');

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
    } = useDashboard(user, isDemo);

    const openGoalEditor = (existing: FinancialGoal | null) => {
        setGoalAmountInput(existing ? String(existing.targetAmount) : '');
        setIsEditingGoal(true);
    };

    const submitGoal = () => {
        const amount = parseFloat(goalAmountInput);
        if (isNaN(amount) || amount <= 0) return;
        handleSaveGoal({ targetAmount: amount, currency: displayCurrency });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg">
                <Loader2 className="animate-spin text-accent" size={36} />
            </div>
        );
    }

    // Portfolio archetype — shared between PortfolioInsights and PortfolioAdviceModal
    // Use only positive-value assets for archetype (liabilities don't define investor type)
    const byType: Record<string, number> = assets.reduce((acc: Record<string, number>, a: Asset) => {
        const val = convertCurrency(a.totalValue, a.totalValueCurrency, displayCurrency, fxRates);
        if (val > 0) acc[a.assetType] = (acc[a.assetType] || 0) + val;
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
            <AppNav {...navProps} />

            <main className="flex-1 max-w-[1120px] mx-auto w-full px-6 pt-28 pb-12 space-y-10">

                {/* NAV Hero — net worth headline */}
                <div className="space-y-5">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-text-3 uppercase tracking-[0.22em] mb-3">
                                Total Net Worth
                            </p>
                            <h2 className="text-6xl md:text-7xl font-serif tabular-nums text-text-1 leading-none">
                                <AnimatedNumber value={totalNAV} format={(n) => formatCurrency(n, displayCurrency)} />
                            </h2>

                            {/* Period selector + change badge */}
                            <div className="flex items-center gap-3 mt-5 flex-wrap">
                                <div className="flex items-center gap-0.5 bg-surface-2 rounded-full p-0.5">
                                    {(['1D', '1W', '1M', 'All'] as const).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setChangePeriod(p)}
                                            className={cn(
                                                "px-3 py-1 rounded-full text-xs font-bold transition-all duration-200",
                                                changePeriod === p
                                                    ? "bg-surface text-text-1 shadow-sm"
                                                    : "text-text-3 hover:text-text-2"
                                            )}
                                        >{p}</button>
                                    ))}
                                </div>

                                <div className={cn(
                                    "flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium",
                                    change >= 0 ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"
                                )}>
                                    {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    <span className="tabular-nums">
                                        {formatCurrencyCompact(Math.abs(change), displayCurrency)} ({Math.abs(changePercent).toFixed(2)}%)
                                    </span>
                                </div>

                                <span className="text-text-3 font-normal text-xs">
                                    {changePeriod === '1D' ? 'since yesterday'
                                        : changePeriod === '1W' ? 'past week'
                                            : changePeriod === '1M' ? 'past month'
                                                : 'all time'}
                                </span>
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

                    {/* Financial goal — full width below the hero row */}
                    <AnimatePresence mode="wait">
                        {isEditingGoal ? (
                            <motion.div
                                key="goal-form"
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center gap-2 flex-wrap"
                            >
                                <input
                                    type="number"
                                    value={goalAmountInput}
                                    onChange={e => setGoalAmountInput(e.target.value)}
                                    placeholder={`${displayCurrency} target`}
                                    className="bg-surface-2 border border-border rounded-lg px-3 py-1.5 text-xs text-text-1 placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-accent/20 w-44"
                                    onKeyDown={e => e.key === 'Enter' && submitGoal()}
                                    autoFocus
                                />
                                <button
                                    onClick={submitGoal}
                                    className="flex items-center gap-1 bg-accent text-white rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-accent/90 transition-colors"
                                >
                                    <Check size={12} /> Save
                                </button>
                                <button
                                    onClick={() => setIsEditingGoal(false)}
                                    className="flex items-center gap-1 text-text-3 hover:text-text-2 transition-colors text-xs px-2 py-1.5"
                                >
                                    <X size={12} /> Cancel
                                </button>
                                {goal && (
                                    <button
                                        onClick={handleClearGoal}
                                        className="text-negative/70 hover:text-negative transition-colors text-xs px-2 py-1.5"
                                    >
                                        Remove goal
                                    </button>
                                )}
                            </motion.div>
                        ) : goal ? (
                            <motion.div
                                key="goal-display"
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.15 }}
                                className="space-y-2"
                            >
                                {(() => {
                                    const convertedTarget = convertCurrency(goal.targetAmount, goal.currency, displayCurrency, fxRates);
                                    const progress = Math.min(totalNAV / convertedTarget, 1);
                                    const remaining = Math.max(convertedTarget - totalNAV, 0);
                                    return (
                                        <>
                                            <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden w-full">
                                                <div
                                                    className="h-full bg-accent rounded-full transition-all duration-700 ease-out"
                                                    style={{ width: `${progress * 100}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-text-3 tabular-nums">
                                                    {formatCurrencyCompact(totalNAV, displayCurrency)} of {formatCurrencyCompact(convertedTarget, displayCurrency)}
                                                    {' '}
                                                    <span className="text-text-2 font-medium">({(progress * 100).toFixed(1)}%)</span>
                                                    {remaining > 0 && (
                                                        <> · {formatCurrencyCompact(remaining, displayCurrency)} to go</>
                                                    )}
                                                </p>
                                                <div className="flex items-center gap-1.5">
                                                    <Target size={11} className="text-text-3" />
                                                    <button
                                                        onClick={() => openGoalEditor(goal)}
                                                        className="text-text-3 hover:text-accent transition-colors"
                                                        aria-label="Edit goal"
                                                    >
                                                        <Pencil size={11} />
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </motion.div>
                        ) : (
                            <motion.button
                                key="goal-cta"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                onClick={() => openGoalEditor(null)}
                                className="flex items-center gap-1.5 text-xs text-text-3 hover:text-accent transition-colors"
                            >
                                <Target size={13} />
                                Set a financial goal
                            </motion.button>
                        )}
                    </AnimatePresence>
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
