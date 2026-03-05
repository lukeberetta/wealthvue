import React, { useState, useEffect, useRef } from "react";
import {
    Plus,
    ArrowUpRight,
    ArrowDownRight,
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
import { useLocation } from "react-router-dom";
import { AppNav } from "../../layouts/AppNav";
import { Footer } from "../../layouts/Footer";
import { SettingsView } from "../settings/SettingsView";
import { useDashboard } from "./hooks/useDashboard";
import { PortfolioInsights, getArchetype } from "./components/PortfolioInsights";
import { PortfolioAdviceModal } from "./components/PortfolioAdviceModal";
import { AssetList } from "./components/AssetList";
import { NAVChart, PERIODS, Period } from "./components/NAVChart";
import { AddAssetModal } from "./components/AddAssetModal";
import { EditAssetModal } from "./components/EditAssetModal";
import { convertCurrency } from "../../lib/fx";
import { useSubscription } from "../../hooks/useSubscription";
import { ReadOnlyBanner } from "../../components/ui/ReadOnlyBanner";
import { UpgradeModal } from "../subscription/UpgradeModal";

interface DashboardProps {
    user: User | null;
    isDemo: boolean;
    isAuthLoading?: boolean;
    onSignIn: () => void;
    onSignOut: () => void;
    onGoHome: () => void;
    onUpdateUser: (user: User) => void;
    onOpenFeedback?: () => void;
}

export const Dashboard = ({ user, isDemo, isAuthLoading = false, onSignIn, onSignOut, onGoHome, onUpdateUser, onOpenFeedback }: DashboardProps) => {
    const [isAdviceModalOpen, setIsAdviceModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState<string | undefined>();
    const [navPeriod, setNavPeriod] = useState<Period>("1M");
    const [goalAmountInput, setGoalAmountInput] = useState('');
    const [fabLabelVisible, setFabLabelVisible] = useState(true);
    const lastScrollY = useRef(0);
    const location = useLocation();
    const { isReadOnly, canUseAI } = useSubscription();

    const showUpgrade = (reason?: string) => {
        setUpgradeReason(reason);
        setIsUpgradeModalOpen(true);
    };

    // Guard: blocks action when read-only; shows upgrade modal instead
    const guard = (fn: () => void, reason?: string) => {
        if (isReadOnly) { showUpgrade(reason); return; }
        fn();
    };

    // Guard for AI-gated actions
    const aiGuard = (fn: () => void) => {
        if (!canUseAI) { showUpgrade("You've used all your AI credits for this period."); return; }
        fn();
    };

    const {
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
        handleResetTracking,
    } = useDashboard(user, isDemo);

    useEffect(() => {
        if ((location.state as { openSettings?: boolean })?.openSettings) {
            setCurrentView("settings");
            window.history.replaceState({}, "");
        }
    }, []);

    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY;
            setFabLabelVisible(y <= lastScrollY.current || y < 60);
            lastScrollY.current = y;
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const openGoalEditor = (existing: FinancialGoal | null) => {
        setGoalAmountInput(existing ? String(existing.targetAmount) : '');
        setIsEditingGoal(true);
    };

    const submitGoal = () => {
        const amount = parseFloat(goalAmountInput);
        if (isNaN(amount) || amount <= 0) return;
        handleSaveGoal({ targetAmount: amount, currency: displayCurrency });
    };

    if (isLoading || isAuthLoading) {
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
        onSignIn,
        onSignOut,
        onOpenSettings: () => setCurrentView("settings"),
        onOpenFeedback: !isDemo ? onOpenFeedback : undefined,
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
            {isReadOnly && <ReadOnlyBanner onUpgradeClick={() => showUpgrade()} />}

            <main className={cn("flex-1 max-w-[1120px] mx-auto w-full px-6 pb-24 space-y-16", isDemo ? "pt-36" : "pt-28")}>

                {/* NAV Hero — net worth headline */}
                <div className="space-y-5">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-text-3 uppercase tracking-[0.22em] mb-3">
                                Total Net Worth
                            </p>
                            <h2 className="text-[clamp(1.5rem,9vw,4.5rem)] md:text-7xl font-serif tabular-nums text-text-1 leading-none">
                                <AnimatedNumber value={totalNAV} format={(n) => formatCurrency(n, displayCurrency)} />
                            </h2>

                            {/* Period selector + change badge */}
                            <div className="flex items-center gap-3 mt-5">
                                <div className="flex items-center gap-0.5 bg-surface-2 rounded-full p-0.5 shrink-0">
                                    {(['1D', '1W', '1M', 'All'] as const).map(p => (
                                        <button
                                            key={p}
                                            onClick={isDemo ? onSignIn : () => setChangePeriod(p)}
                                            className={cn(
                                                "px-3 py-1 rounded-full text-xs font-bold transition-all duration-200",
                                                changePeriod === p
                                                    ? "bg-surface text-text-1 shadow-sm"
                                                    : "text-text-3 hover:text-text-2"
                                            )}
                                        >{p}</button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-2 min-w-0">
                                    <div className={cn(
                                        "flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium shrink-0",
                                        change >= 0 ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"
                                    )}>
                                        {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                        <span className="tabular-nums">
                                            <span className="hidden sm:inline">{formatCurrencyCompact(Math.abs(change), displayCurrency)} </span>
                                            ({Math.abs(changePercent).toFixed(2)}%)
                                        </span>
                                    </div>
                                    <span className="hidden sm:inline text-text-3 font-normal text-xs shrink-0">
                                        {changePeriod === '1D' ? 'since yesterday'
                                            : changePeriod === '1W' ? 'past week'
                                                : changePeriod === '1M' ? 'past month'
                                                    : 'all time'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:flex gap-3">
                            <Button
                                onClick={isDemo ? onSignIn : () => guard(() => setIsAddModalOpen(true), "Upgrade to Pro to continue managing your assets.")}
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
                                    className="flex items-center gap-1 bg-accent text-on-accent rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-accent/90 transition-colors"
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
                                                    className="h-full bg-text-1 rounded-full transition-all duration-700 ease-out"
                                                    style={{ width: `${progress * 100}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <Target size={11} className="text-text-3 shrink-0" />
                                                    <p className="text-xs text-text-3 tabular-nums">
                                                        {formatCurrencyCompact(totalNAV, displayCurrency)} of {formatCurrencyCompact(convertedTarget, displayCurrency)}
                                                        {' '}
                                                        <span className="text-text-2 font-medium">({(progress * 100).toFixed(1)}%)</span>
                                                        {remaining > 0 && (
                                                            <> · {formatCurrencyCompact(remaining, displayCurrency)} to go</>
                                                        )}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={isDemo ? onSignIn : () => openGoalEditor(goal)}
                                                    className="text-text-3 hover:text-accent transition-colors shrink-0"
                                                    aria-label="Edit goal"
                                                >
                                                    <Pencil size={11} />
                                                </button>
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
                                onClick={isDemo ? onSignIn : () => openGoalEditor(null)}
                                className="flex items-center gap-1.5 text-xs text-text-3 hover:text-accent transition-colors"
                            >
                                <Target size={13} />
                                Set a financial goal
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Portfolio Insights */}
                <div>
                    <h3 className="text-xl font-serif text-text-1 mb-6">Portfolio Snapshot</h3>
                    <PortfolioInsights
                        assets={assets}
                        displayCurrency={displayCurrency}
                        fxRates={fxRates}
                        onOpenAdvice={isDemo ? onSignIn : () => aiGuard(() => setIsAdviceModalOpen(true))}
                    />
                </div>

                {/* NAV History Chart */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-serif text-text-1">Performance</h3>
                        <div className="flex items-center gap-0.5 bg-surface-2 rounded-full p-0.5">
                            {PERIODS.map(p => (
                                <button
                                    key={p}
                                    onClick={() => setNavPeriod(p)}
                                    className={cn(
                                        "px-3 py-1 rounded-full text-xs font-bold transition-all duration-200",
                                        navPeriod === p
                                            ? "bg-surface text-text-1 shadow-sm"
                                            : "text-text-3 hover:text-text-2"
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                    <NAVChart
                        navHistory={navHistory}
                        displayCurrency={displayCurrency}
                        fxRates={fxRates}
                        assets={assets}
                        onResetTracking={isDemo ? undefined : handleResetTracking}
                        period={navPeriod}
                    />
                </div>

                {/* Asset list */}
                <div>
                    <div className="mb-6">
                        <h3 className="text-xl font-serif text-text-1">My Assets</h3>
                    </div>
                    <AssetList
                        assets={sortedAssets}
                        displayCurrency={displayCurrency}
                        fxRates={fxRates}
                        totalNAV={totalNAV}
                        selectedAssetIds={selectedAssetIds}
                        refreshingAssetId={refreshingAssetId}
                        onSelectAsset={(id, checked) => {
                            if (isDemo) { onSignIn(); return; }
                            if (isReadOnly) { showUpgrade(); return; }
                            if (checked) setSelectedAssetIds([...selectedAssetIds, id]);
                            else setSelectedAssetIds(selectedAssetIds.filter(x => x !== id));
                        }}
                        onEditAsset={(asset) => {
                            if (isDemo) { onSignIn(); return; }
                            if (isReadOnly) { showUpgrade(); return; }
                            setSelectedAsset(asset);
                            setIsEditModalOpen(true);
                        }}
                        onAddAsset={isDemo ? onSignIn : () => guard(() => setIsAddModalOpen(true))}
                        onRefreshAsset={isDemo ? undefined : handleRefreshAsset}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        onBulkDelete={isDemo ? onSignIn : () => guard(handleBulkDelete)}
                    />
                </div>
                {/* Mobile FAB — sticky so it stays above the footer */}
                <div className="md:hidden sticky bottom-4 flex justify-center pointer-events-none">
                    <motion.button
                        className="pointer-events-auto w-fit z-40 flex items-center h-12 bg-accent text-on-accent rounded-full px-5 text-sm font-semibold shadow-lg shadow-accent/30"
                        onClick={isDemo ? onSignIn : () => guard(() => setIsAddModalOpen(true))}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Add Asset"
                    >
                        <Plus size={17} />
                        <motion.span
                            animate={{
                                maxWidth: fabLabelVisible ? 100 : 0,
                                opacity: fabLabelVisible ? 1 : 0,
                                paddingLeft: fabLabelVisible ? 8 : 0,
                            }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            style={{ overflow: "hidden", whiteSpace: "nowrap", display: "inline-block" }}
                        >
                            Add Asset
                        </motion.span>
                    </motion.button>
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
                goal={goal}
                navHistory={navHistory}
            />

            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                reason={upgradeReason}
            />

        </div>
    );
};
