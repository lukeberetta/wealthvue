import React from "react";
import { Briefcase, Coins, Car, Home, Wallet, MoreHorizontal } from "lucide-react";
import { Asset } from "../../../types";
import { formatCurrency, cn } from "../../../lib/utils";
import { convertCurrency } from "../../../lib/fx";

interface AssetRowProps {
    asset: Asset;
    displayCurrency: string;
    fxRates: { [key: string]: number };
    isSelected: boolean;
    isSelectMode: boolean;
    onSelect: (id: string, checked: boolean) => void;
    onClick: (asset: Asset) => void;
}

export const AssetRow: React.FC<AssetRowProps> = ({ asset, displayCurrency, fxRates, isSelected, isSelectMode, onSelect, onClick }) => {
    const getIcon = (type: string) => {
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
        <div
            className={cn(
                "group flex items-center gap-3 p-3 rounded-xl transition-all border border-transparent hover:border-border",
                isSelected ? "bg-accent-light/20 border-accent/20" : "hover:bg-surface-2"
            )}
        >
            <div className={cn(
                "flex items-center h-full transition-all duration-300 ease-in-out overflow-hidden",
                isSelectMode ? "w-6 opacity-100 mr-2" : "w-0 opacity-0 mr-0"
            )}>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelect(asset.id, e.target.checked)}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent/20 cursor-pointer"
                />
            </div>

            <div
                className="flex-1 flex items-center justify-between cursor-pointer"
                onClick={() => onClick(asset)}
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-surface-2 rounded-lg flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                        {getIcon(asset.assetType)}
                    </div>
                    <div>
                        <p className="font-medium text-sm">{asset.name}</p>
                        <div className="flex items-center gap-2">
                            <p className="text-[10px] font-bold text-text-3 uppercase tracking-tighter">
                                {asset.quantity > 1 ? `${asset.quantity} units · ` : ''}
                                {formatCurrency(asset.unitPrice, asset.unitPriceCurrency)}
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
                        {formatCurrency(convertCurrency(asset.totalValue, asset.totalValueCurrency, displayCurrency, fxRates), displayCurrency)}
                    </p>
                    <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter",
                        asset.valueSource === 'live_price' ? "bg-positive/10 text-positive" : "bg-accent-light text-accent"
                    )}>
                        {asset.valueSource === 'live_price' ? 'Live' : asset.valueSource === 'ai_estimate' ? 'AI Estimate' : 'Manual'}
                    </span>
                </div>
            </div>
        </div>
    );
};
