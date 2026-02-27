import React from "react";
import { Briefcase, Coins, Car, Home, Wallet, MoreHorizontal, Sparkles, Plus } from "lucide-react";
import { Asset } from "../../../types";
import { Button } from "../../../components/ui/Button";
import { AssetRow } from "./AssetRow";

interface AssetListProps {
    assets: Asset[];
    displayCurrency: string;
    fxRates: { [key: string]: number };
    selectedAssetIds: string[];
    onSelectAsset: (id: string, checked: boolean) => void;
    onEditAsset: (asset: Asset) => void;
    onAddAsset: () => void;
}

export const AssetList = ({
    assets,
    displayCurrency,
    fxRates,
    selectedAssetIds,
    onSelectAsset,
    onEditAsset,
    onAddAsset
}: AssetListProps) => {
    if (assets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-24 bg-surface rounded-3xl border border-border shadow-sm">
                <div className="w-20 h-20 bg-surface-2 rounded-full flex items-center justify-center text-accent/20 mb-8">
                    <Sparkles size={40} />
                </div>
                <h3 className="text-2xl font-serif mb-3">Your view is empty.</h3>
                <p className="text-text-2 max-w-sm mx-auto mb-10 leading-relaxed">
                    Add your first asset by describing it or uploading a screenshot. Our AI will handle the valuation.
                </p>
                <Button onClick={onAddAsset} className="flex items-center gap-2 rounded-full px-8 py-3">
                    <Plus size={20} />
                    Add Your First Asset
                </Button>
            </div>
        );
    }

    const groupedAssets = assets.reduce((acc, asset) => {
        acc[asset.assetType] = acc[asset.assetType] || [];
        acc[asset.assetType].push(asset);
        return acc;
    }, {} as Record<string, Asset[]>);

    const getIcon = (type: string) => {
        switch (type) {
            case 'stock': return <Briefcase size={12} />;
            case 'crypto': return <Coins size={12} />;
            case 'vehicle': return <Car size={12} />;
            case 'property': return <Home size={12} />;
            case 'cash': return <Wallet size={12} />;
            default: return <MoreHorizontal size={12} />;
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-8">
            {Object.entries(groupedAssets).map(([type, typeAssets]) => (
                <div key={type} className="space-y-4">
                    <h4 className="text-[10px] font-bold text-text-3 uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-border">
                        {getIcon(type)}
                        {type}s
                    </h4>
                    <div className="space-y-3">
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
                </div>
            ))}
        </div>
    );
};
