import React, { useState } from "react";
import { LineChart, Coins, Car, Home, Wallet, MoreHorizontal, Sparkles, Plus, Search, Download, X, ChevronDown } from "lucide-react";
import { Asset } from "../../../types";
import { Button } from "../../../components/ui/Button";
import { AssetRow } from "./AssetRow";
import { formatCurrency, cn } from "../../../lib/utils";
import { convertCurrency } from "../../../lib/fx";

interface AssetListProps {
    assets: Asset[];
    displayCurrency: string;
    fxRates: { [key: string]: number };
    totalNAV: number;
    selectedAssetIds: string[];
    refreshingAssetId?: string | null;
    onSelectAsset: (id: string, checked: boolean) => void;
    onEditAsset: (asset: Asset) => void;
    onAddAsset: () => void;
    onRefreshAsset?: (asset: Asset) => void;
    sortBy: 'value_desc' | 'value_asc' | 'name_asc';
    onSortChange: (sort: 'value_desc' | 'value_asc' | 'name_asc') => void;
}

const TYPE_LABELS: Record<string, string> = {
    stock: "Stocks & ETFs",
    crypto: "Crypto",
    vehicle: "Vehicles",
    property: "Property",
    cash: "Cash",
    other: "Other",
};

const getTypeIcon = (type: string) => {
    switch (type) {
        case "stock": return <LineChart size={10} />;
        case "crypto": return <Coins size={10} />;
        case "vehicle": return <Car size={10} />;
        case "property": return <Home size={10} />;
        case "cash": return <Wallet size={10} />;
        default: return <MoreHorizontal size={10} />;
    }
};

export const AssetList = ({
    assets,
    displayCurrency,
    fxRates,
    totalNAV,
    selectedAssetIds,
    refreshingAssetId,
    onSelectAsset,
    onEditAsset,
    onAddAsset,
    onRefreshAsset,
    sortBy,
    onSortChange,
}: AssetListProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [accountFilter, setAccountFilter] = useState<string | null>(null);

    if (assets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-16 bg-surface-2/30 rounded-2xl border border-dashed border-border">
                <Sparkles className="text-text-3/30 mb-3" size={24} />
                <p className="text-xs text-text-3 font-medium mb-5">No assets yet</p>
                <Button onClick={onAddAsset} className="flex items-center gap-2 rounded-full px-6 py-2 text-sm">
                    <Plus size={15} />
                    Add Your First Asset
                </Button>
            </div>
        );
    }

    // Distinct accounts (sources) that exist across assets
    const presentAccounts = [...new Set(assets.map(a => a.source).filter(Boolean))] as string[];

    const filteredAssets = assets.filter(asset => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q
            || asset.name.toLowerCase().includes(q)
            || (asset.ticker || '').toLowerCase().includes(q);
        const matchesAccount = !accountFilter || asset.source === accountFilter;
        return matchesSearch && matchesAccount;
    });

    const handleExportCSV = () => {
        const headers = [
            'Name', 'Type', 'Ticker', 'Quantity', 'Unit Price', 'Unit Price Currency',
            `Value (${displayCurrency})`, 'Allocation %', 'Account', 'Price Source', 'Last Refreshed'
        ];
        const rows = filteredAssets.map(asset => {
            const val = convertCurrency(asset.totalValue, asset.totalValueCurrency, displayCurrency, fxRates);
            const pct = totalNAV > 0 ? (val / totalNAV * 100).toFixed(1) + '%' : 'N/A';
            return [
                asset.name,
                asset.assetType,
                asset.ticker || '',
                asset.quantity,
                asset.unitPrice,
                asset.unitPriceCurrency,
                val.toFixed(2),
                pct,
                asset.source || '',
                asset.valueSource || '',
                asset.lastRefreshed ? new Date(asset.lastRefreshed).toLocaleDateString() : ''
            ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
        });
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wealthvue-holdings-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const groups = Object.entries(
        filteredAssets.reduce((acc, asset) => {
            acc[asset.assetType] = acc[asset.assetType] || [];
            acc[asset.assetType].push(asset);
            return acc;
        }, {} as Record<string, Asset[]>)
    ).sort(([typeA, a], [typeB, b]) => {
        if (sortBy === 'name_asc') {
            return (TYPE_LABELS[typeA] ?? typeA).localeCompare(TYPE_LABELS[typeB] ?? typeB);
        }
        const totalA = a.reduce((s, x) => s + convertCurrency(x.totalValue, x.totalValueCurrency, displayCurrency, fxRates), 0);
        const totalB = b.reduce((s, x) => s + convertCurrency(x.totalValue, x.totalValueCurrency, displayCurrency, fxRates), 0);
        return sortBy === 'value_asc' ? totalA - totalB : totalB - totalA;
    });

    return (
        <div>
            {/* Toolbar: search → account → sort → export */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
                {/* Search */}
                <div className="relative">
                    <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="bg-surface-2 border border-border rounded-lg pl-7 pr-6 py-1.5 text-xs text-text-1 placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-accent/20 w-36"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-1 transition-colors"
                        >
                            <X size={11} />
                        </button>
                    )}
                </div>

                {/* Account filter */}
                {presentAccounts.length > 1 && (
                    <div className="relative">
                        <select
                            value={accountFilter ?? ''}
                            onChange={e => setAccountFilter(e.target.value || null)}
                            className="appearance-none bg-surface-2 border border-border rounded-lg px-3 py-1.5 pr-7 text-xs font-bold text-text-1 focus:outline-none focus:ring-2 focus:ring-accent/20"
                        >
                            <option value="">All accounts</option>
                            {presentAccounts.map(account => (
                                <option key={account} value={account}>{account}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-text-3" size={12} />
                    </div>
                )}

                {/* Sort */}
                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={e => onSortChange(e.target.value as 'value_desc' | 'value_asc' | 'name_asc')}
                        className="appearance-none bg-surface-2 border border-border rounded-lg px-3 py-1.5 pr-7 text-xs font-bold text-text-1 focus:outline-none focus:ring-2 focus:ring-accent/20"
                    >
                        <option value="value_desc">High to Low</option>
                        <option value="value_asc">Low to High</option>
                        <option value="name_asc">A to Z</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-text-3" size={12} />
                </div>

                {/* Export — pushed to the far right */}
                <button
                    onClick={handleExportCSV}
                    title="Export as CSV"
                    className="ml-auto p-1.5 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2 border border-border transition-all"
                >
                    <Download size={13} />
                </button>
            </div>

            {/* Column headers */}
            <div className="flex items-center gap-3 pb-2 px-3">
                <span className="flex-1 text-[9px] font-bold text-text-3 uppercase tracking-widest">Asset</span>
                <span className="hidden sm:block text-[9px] font-bold text-text-3 uppercase tracking-widest w-24 text-right">Account</span>
                <span className="hidden sm:block text-[9px] font-bold text-text-3 uppercase tracking-widest w-16 text-right">Source</span>
                <span className="hidden sm:block w-6 shrink-0" />
                <span className="text-[9px] font-bold text-text-3 uppercase tracking-widest text-right w-32">Value</span>
            </div>

            {filteredAssets.length === 0 ? (
                <div className="text-center py-10 text-xs text-text-3">
                    No holdings match your search
                </div>
            ) : (
                groups.map(([type, typeAssets], groupIndex) => {
                    const typeTotal = typeAssets.reduce(
                        (s, a) => s + convertCurrency(a.totalValue, a.totalValueCurrency, displayCurrency, fxRates), 0
                    );
                    return (
                        <div key={type}>
                            {/* Group header */}
                            <div className={cn(
                                "flex items-center justify-between px-3 py-2 rounded-lg bg-surface-2/60",
                                groupIndex > 0 && "mt-4"
                            )}>
                                <span className="flex items-center gap-1.5 text-[9px] font-bold text-text-2 uppercase tracking-widest">
                                    {getTypeIcon(type)}
                                    {TYPE_LABELS[type] ?? type}
                                </span>
                                <span className={cn(
                                    "text-[9px] font-bold tabular-nums",
                                    typeTotal < 0 ? "text-negative" : "text-text-2"
                                )}>
                                    {formatCurrency(typeTotal, displayCurrency)}
                                </span>
                            </div>

                            {/* Asset rows */}
                            {typeAssets.map(asset => (
                                <AssetRow
                                    key={asset.id}
                                    asset={asset}
                                    displayCurrency={displayCurrency}
                                    fxRates={fxRates}
                                    totalNAV={totalNAV}
                                    isSelected={selectedAssetIds.includes(asset.id)}
                                    isRefreshing={refreshingAssetId === asset.id}
                                    onSelect={onSelectAsset}
                                    onClick={onEditAsset}
                                    onRefresh={onRefreshAsset}
                                />
                            ))}
                        </div>
                    );
                })
            )}
        </div>
    );
};
