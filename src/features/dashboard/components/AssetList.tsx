import React from "react";
import { LineChart, Coins, Car, Home, Wallet, MoreHorizontal, Sparkles, Plus } from "lucide-react";
import { Asset } from "../../../types";
import { Button } from "../../../components/ui/Button";
import { AssetRow } from "./AssetRow";
import { formatCurrency, cn } from "../../../lib/utils";
import { convertCurrency } from "../../../lib/fx";

interface AssetListProps {
    assets: Asset[];
    displayCurrency: string;
    fxRates: { [key: string]: number };
    selectedAssetIds: string[];
    onSelectAsset: (id: string, checked: boolean) => void;
    onEditAsset: (asset: Asset) => void;
    onAddAsset: () => void;
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
    selectedAssetIds,
    onSelectAsset,
    onEditAsset,
    onAddAsset,
}: AssetListProps) => {
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

    const groups = Object.entries(
        assets.reduce((acc, asset) => {
            acc[asset.assetType] = acc[asset.assetType] || [];
            acc[asset.assetType].push(asset);
            return acc;
        }, {} as Record<string, Asset[]>)
    ).sort(([, a], [, b]) => {
        const totalA = a.reduce((s, x) => s + convertCurrency(x.totalValue, x.totalValueCurrency, displayCurrency, fxRates), 0);
        const totalB = b.reduce((s, x) => s + convertCurrency(x.totalValue, x.totalValueCurrency, displayCurrency, fxRates), 0);
        return totalB - totalA;
    });

    return (
        <div>
            {/* Column headers */}
            <div className="flex items-center gap-3 pb-2">
                <div className="w-5 shrink-0" />
                <div className="w-8 shrink-0" />
                <span className="flex-1 text-[9px] font-bold text-text-3 uppercase tracking-widest">Name</span>
                <span className="hidden sm:block text-[9px] font-bold text-text-3 uppercase tracking-widest w-24 text-right">Held at</span>
                <span className="hidden sm:block text-[9px] font-bold text-text-3 uppercase tracking-widest w-16 text-right">Source</span>
                <span className="text-[9px] font-bold text-text-3 uppercase tracking-widest text-right w-32">Value</span>
            </div>

            {groups.map(([type, typeAssets], groupIndex) => {
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
                                isSelected={selectedAssetIds.includes(asset.id)}
                                onSelect={onSelectAsset}
                                onClick={onEditAsset}
                            />
                        ))}
                    </div>
                );
            })}
        </div>
    );
};
