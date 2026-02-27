import React from "react";
import {
    Plus,
    Settings,
    LogOut,
    RefreshCw,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    Trash2,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, Asset } from "../../types";
import { formatCurrency, cn } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { SettingsView } from "../settings/SettingsView";
import { useDashboard } from "./hooks/useDashboard";
import { AssetAllocationChart } from "./components/AssetAllocationChart";
import { PerformanceChart } from "./components/PerformanceChart";
import { AssetList } from "./components/AssetList";
import { AddAssetModal } from "./components/AddAssetModal";
import { EditAssetModal } from "./components/EditAssetModal";

interface DashboardProps {
    user: User | null;
    isDemo: boolean;
    onSignOut: () => void;
    onGoHome: () => void;
}

export const Dashboard = ({ user, isDemo, onSignOut, onGoHome }: DashboardProps) => {
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
        isAccountMenuOpen,
        setIsAccountMenuOpen,
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
                <Loader2 className="animate-spin text-accent" size={40} />
            </div>
        );
    }

    if (currentView === 'settings') {
        return (
            <div className="min-h-screen flex flex-col bg-bg">
                <SettingsView user={user} onSignOut={onSignOut} onBack={() => setCurrentView('dashboard')} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-bg text-text-1">
            {isDemo && (
                <div className="bg-accent text-white p-2 text-center text-xs font-bold uppercase tracking-widest">
                    DEMO MODE · <button onClick={onSignOut} className="underline">Sign in</button> to track your real assets
                </div>
            )}

            <header className="bg-surface border-b border-border p-4 sticky top-0 z-40">
                <div className="max-w-[1120px] mx-auto flex justify-between items-center">
                    <button onClick={onGoHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-accent rounded flex items-center justify-center text-white font-serif font-bold">W</div>
                        <span className="text-xl font-serif font-semibold text-accent hidden sm:block">WealthVue</span>
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <select
                                value={displayCurrency}
                                onChange={(e) => setDisplayCurrency(e.target.value)}
                                className="appearance-none bg-surface-2 border border-border rounded-full px-4 py-1.5 pr-10 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-accent/20"
                            >
                                {Object.keys(fxRates).sort().map(curr => (
                                    <option key={curr} value={curr}>{curr}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-3" size={14} />
                        </div>

                        {isDemo ? (
                            <Button onClick={onSignOut} className="rounded-full px-4 py-1.5 text-xs">Sign In</Button>
                        ) : (
                            <div className="relative">
                                <button
                                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                                    className="flex items-center gap-3 hover:bg-surface-2 p-1 rounded-full transition-colors border border-transparent hover:border-border"
                                >
                                    <img src={user?.photoURL} className="w-8 h-8 rounded-full border border-border" alt="Avatar" />
                                    <ChevronDown size={14} className={cn("text-text-3 transition-transform", isAccountMenuOpen && "rotate-180")} />
                                </button>

                                <AnimatePresence>
                                    {isAccountMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsAccountMenuOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
                                            >
                                                <div className="p-5 border-b border-border bg-surface-2/30">
                                                    <p className="text-sm font-medium">{user?.displayName}</p>
                                                    <p className="text-xs text-text-3 truncate">{user?.email}</p>
                                                    <div className="mt-2 inline-block px-2 py-0.5 bg-accent-light text-accent text-[10px] font-bold rounded uppercase tracking-wider">
                                                        {user?.plan} Plan
                                                    </div>
                                                </div>
                                                <div className="p-2">
                                                    <button
                                                        onClick={() => {
                                                            setCurrentView('settings');
                                                            setIsAccountMenuOpen(false);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-2 hover:text-text-1 hover:bg-surface-2 rounded-xl transition-colors"
                                                    >
                                                        <Settings size={18} />
                                                        Settings
                                                    </button>
                                                    <button
                                                        onClick={onSignOut}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-negative hover:bg-negative/5 rounded-xl transition-colors"
                                                    >
                                                        <LogOut size={18} />
                                                        Sign Out
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-[1120px] mx-auto w-full p-6 space-y-8">
                {/* NAV Hero */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-2">Total Net Worth</p>
                        <h2 className="text-5xl font-serif tabular-nums">{formatCurrency(totalNAV, displayCurrency)}</h2>
                        <div className={cn("flex items-center gap-2 mt-3 text-sm font-medium", change >= 0 ? "text-positive" : "text-negative")}>
                            <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full", change >= 0 ? "bg-positive/10" : "bg-negative/10")}>
                                {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                <span>{formatCurrency(Math.abs(change), displayCurrency)} ({Math.abs(changePercent).toFixed(2)}%)</span>
                            </div>
                            <span className="text-text-3 font-normal">since yesterday</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" className="flex items-center gap-2 rounded-full px-5 py-2 text-sm">
                            <RefreshCw size={16} />
                            Refresh Prices
                        </Button>
                        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 rounded-full px-5 py-2 text-sm">
                            <Plus size={18} />
                            Add Asset
                        </Button>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-3 gap-8">
                    <AssetAllocationChart assets={assets} displayCurrency={displayCurrency} fxRates={fxRates} />
                    <PerformanceChart navHistory={navHistory} displayCurrency={displayCurrency} fxRates={fxRates} />
                </div>

                {/* Asset List */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="text-sm font-bold text-text-3 uppercase tracking-[0.2em]">Your Assets</h3>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {selectedAssetIds.length > 0 && (
                                <Button
                                    variant="ghost"
                                    onClick={handleBulkDelete}
                                    className="text-negative hover:bg-negative/5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg"
                                >
                                    <Trash2 size={14} />
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
                                    isSelectMode ? "text-accent bg-accent/10" : "text-text-3 hover:bg-surface-2"
                                )}
                            >
                                {isSelectMode ? "Cancel" : "Select"}
                            </Button>

                            <div className="relative flex-1 sm:flex-none">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="w-full appearance-none bg-surface-2 border border-border rounded-lg px-4 py-1.5 pr-10 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-accent/20"
                                >
                                    <option value="value_desc">Value: High to Low</option>
                                    <option value="value_asc">Value: Low to High</option>
                                    <option value="name_asc">Name: A to Z</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-3" size={14} />
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
                                setSelectedAssetIds(selectedAssetIds.filter(idx => idx !== id));
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
        </div>
    );
};
