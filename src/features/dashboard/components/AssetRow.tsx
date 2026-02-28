import React from "react";
import { Asset } from "../../../types";
import { formatCurrency, cn } from "../../../lib/utils";
import { convertCurrency } from "../../../lib/fx";
import { AssetIcon } from "./AssetIcon";

interface AssetRowProps {
    asset: Asset;
    displayCurrency: string;
    fxRates: { [key: string]: number };
    isSelected: boolean;
    onSelect: (id: string, checked: boolean) => void;
    onClick: (asset: Asset) => void;
}


export const AssetRow: React.FC<AssetRowProps> = ({
    asset, displayCurrency, fxRates, isSelected, onSelect, onClick,
}) => {
    const converted = convertCurrency(asset.totalValue, asset.totalValueCurrency, displayCurrency, fxRates);
    const isLiability = converted < 0;

    return (
        <div
            className={cn(
                "flex items-center gap-3 py-3 px-3 rounded-lg border-b border-border/40 last:border-b-0 transition-colors cursor-pointer",
                isSelected ? "bg-accent/5" : "hover:bg-surface-2/50"
            )}
            onClick={() => onClick(asset)}
        >
            {/* Checkbox */}
            <div className="w-5 shrink-0" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelect(asset.id, e.target.checked)}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent/20 cursor-pointer"
                />
            </div>

            {/* Icon */}
            <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-accent shrink-0">
                <AssetIcon asset={asset} size={14} />
            </div>

            {/* Name + subtitle */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-1 truncate">{asset.name}</p>
                <p className="text-[10px] text-text-3 tabular-nums">
                    {asset.quantity !== 1 ? `${asset.quantity} × ` : ""}
                    {formatCurrency(asset.unitPrice, asset.unitPriceCurrency)}
                </p>
            </div>

            {/* Held at */}
            <div className="hidden sm:flex w-24 justify-end shrink-0">
                {asset.source && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-2 text-text-2 truncate max-w-full">
                        {asset.source}
                    </span>
                )}
            </div>

            {/* Price source */}
            <div className="hidden sm:flex w-16 justify-end shrink-0">
                <span className={cn(
                    "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                    asset.valueSource === "live_price"
                        ? "bg-positive/10 text-positive"
                        : asset.valueSource === "ai_estimate"
                        ? "bg-accent/10 text-accent"
                        : "bg-surface-2 text-text-3"
                )}>
                    {asset.valueSource === "live_price" ? "Live" : asset.valueSource === "ai_estimate" ? "AI Est." : "Manual"}
                </span>
            </div>

            {/* Value */}
            <p className={cn("text-sm font-medium tabular-nums text-right w-32 shrink-0", isLiability && "text-negative")}>
                {formatCurrency(converted, displayCurrency)}
            </p>
        </div>
    );
};
