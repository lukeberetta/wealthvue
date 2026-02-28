import React from "react";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart, Sparkles } from "lucide-react";
import { Asset } from "../../../types";
import { formatCurrency, cn } from "../../../lib/utils";
import { convertCurrency } from "../../../lib/fx";
import { TYPE_COLORS } from "./AssetIcon";

interface PortfolioInsightsProps {
    assets: Asset[];
    displayCurrency: string;
    fxRates: { [key: string]: number };
    onOpenAdvice: () => void;
}


const TYPE_LABELS: Record<string, string> = {
    stock: "Stocks & ETFs",
    crypto: "Crypto",
    vehicle: "Vehicles",
    property: "Property",
    cash: "Cash",
    other: "Other",
};

export interface Archetype {
    title: string;
    subtitle: string;
}

export function getArchetype(pct: Record<string, number>): Archetype {
    const crypto = pct.crypto || 0;
    const stock = pct.stock || 0;
    const property = pct.property || 0;
    const cash = pct.cash || 0;
    const other = pct.other || 0;
    const typeCount = Object.keys(pct).length;
    const maxAlloc = Math.max(...Object.values(pct));

    if (crypto >= 60) return { title: "The Crypto Degen", subtitle: "High conviction. High volatility. Zero chill." };
    if (crypto >= 40) return { title: "Digital Maverick", subtitle: "Bullish on the future, one block at a time." };
    if (stock >= 70) return { title: "Equity Devotee", subtitle: "You believe in companies. Markets agree — mostly." };
    if (property >= 50) return { title: "Property Bull", subtitle: "Bricks over bytes. Slow and steady." };
    if (cash >= 60) return { title: "The Cautious Accumulator", subtitle: "Patience is a strategy. Or it should be." };
    if (typeCount >= 4 && maxAlloc < 40) return { title: "The Diversifier", subtitle: "You've read the books. It shows." };
    if (other >= 30) return { title: "The Speculator", subtitle: "Unconventional assets, unconventional thinking." };
    if (stock >= 40 && crypto >= 20) return { title: "Growth Seeker", subtitle: "Balanced between tradition and the frontier." };
    return { title: "The Balanced Investor", subtitle: "Risk-aware and opportunity-ready." };
}

export const PortfolioInsights = ({ assets, displayCurrency, fxRates, onOpenAdvice }: PortfolioInsightsProps) => {
    const totalNAV = assets.reduce((sum, a) =>
        sum + convertCurrency(a.totalValue, a.totalValueCurrency, displayCurrency, fxRates), 0);

    const byType = assets.reduce((acc, asset) => {
        const val = convertCurrency(asset.totalValue, asset.totalValueCurrency, displayCurrency, fxRates);
        acc[asset.assetType] = (acc[asset.assetType] || 0) + val;
        return acc;
    }, {} as Record<string, number>);

    // Separate positive assets from liabilities (negative values)
    const positiveByType: Record<string, number> = {};
    let totalLiabilities = 0;
    for (const [type, val] of Object.entries(byType)) {
        if (val >= 0) positiveByType[type] = val;
        else totalLiabilities += val;
    }

    const positiveTotal = Object.values(positiveByType).reduce((s, v) => s + v, 0);

    const chartData = Object.entries(positiveByType)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // Percentages based on positive assets only (for chart and archetype)
    const pct = Object.fromEntries(
        Object.entries(positiveByType).map(([k, v]) => [k, positiveTotal > 0 ? (v / positiveTotal) * 100 : 0])
    );

    const archetype = getArchetype(pct);
    const holdingsCount = assets.length;
    const hasLiabilities = totalLiabilities < 0;

    if (assets.length === 0) {
        return (
            <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-surface rounded-2xl p-6">
                    <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-6">Allocation</h3>
                    <div className="h-[220px] flex flex-col items-center justify-center text-center bg-surface-2/30 rounded-2xl border border-dashed border-border">
                        <PieChart className="text-text-3/30 mb-4" size={28} />
                        <p className="text-xs text-text-3 font-medium">No data to show</p>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-surface rounded-2xl p-6">
                    <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-6">Portfolio Profile</h3>
                    <div className="h-[220px] flex flex-col items-center justify-center text-center bg-surface-2/30 rounded-2xl border border-dashed border-border">
                        <Sparkles className="text-text-3/30 mb-4" size={28} />
                        <p className="text-xs text-text-3 font-medium">Add assets to reveal your profile</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid lg:grid-cols-5 gap-6">

            {/* ── Left: Allocation Breakdown ── */}
            <div className="lg:col-span-3 bg-surface rounded-2xl p-6">
                <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-6">Allocation</h3>
                <div className="flex flex-col sm:flex-row gap-6 items-start">

                    {/* Donut */}
                    <div className="w-full sm:w-[180px] shrink-0 h-[180px]">
                        <ResponsiveContainer width="100%" height={180} minWidth={0}>
                            <RePieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={52}
                                    outerRadius={78}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.name] || TYPE_COLORS.other} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => formatCurrency(value, displayCurrency)}
                                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: '11px' }}
                                />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Breakdown table */}
                    <div className="flex-1 space-y-3 w-full">
                        {chartData.map((entry, index) => {
                            const p = pct[entry.name] || 0;
                            return (
                                <div key={entry.name} className="space-y-1">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2 h-2 rounded-full shrink-0"
                                                style={{ backgroundColor: TYPE_COLORS[entry.name] || TYPE_COLORS.other }}
                                            />
                                            <span className="font-semibold text-text-1">
                                                {TYPE_LABELS[entry.name] || entry.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 tabular-nums">
                                            <span className="text-text-3">{p.toFixed(1)}%</span>
                                            <span className="font-bold text-text-1">
                                                {formatCurrency(entry.value, displayCurrency)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${p}%`,
                                                backgroundColor: TYPE_COLORS[entry.name] || TYPE_COLORS.other,
                                                opacity: 0.75,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        {/* Liabilities row */}
                        {hasLiabilities && (() => {
                            const liabPct = positiveTotal > 0 ? (Math.abs(totalLiabilities) / positiveTotal) * 100 : 0;
                            return (
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full shrink-0 bg-negative/60" />
                                            <span className="font-semibold text-text-1">Liabilities</span>
                                        </div>
                                        <div className="flex items-center gap-3 tabular-nums">
                                            <span className="text-text-3">{liabPct.toFixed(1)}%</span>
                                            <span className="font-bold text-negative">
                                                {formatCurrency(totalLiabilities, displayCurrency)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500 bg-negative/60"
                                            style={{ width: `${liabPct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })()}

                        <p className="text-[10px] text-text-3 pt-1">
                            {holdingsCount} holding{holdingsCount !== 1 ? "s" : ""} across {chartData.length} class{chartData.length !== 1 ? "es" : ""}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Right: Portfolio Character ── */}
            <div className="lg:col-span-2 bg-surface rounded-2xl p-6 flex flex-col justify-between">
                <div>
                    <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-6">Portfolio Profile</h3>

                    <div className="mb-6">
                        <div className="inline-flex items-center gap-2 bg-accent/8 border border-accent/20 rounded-full px-3 py-1 mb-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Investor Type</span>
                        </div>
                        <h2 className="text-2xl font-serif text-text-1 mb-1.5">{archetype.title}</h2>
                        <p className="text-sm text-text-2 leading-relaxed italic">{archetype.subtitle}</p>
                    </div>

                    <div className="border-t border-border/60 pt-5 space-y-2">
                        {chartData.slice(0, 2).map((entry, index) => (
                            <div key={entry.name} className="flex justify-between items-center text-xs">
                                <span className="text-text-3">{TYPE_LABELS[entry.name] || entry.name}</span>
                                <span
                                    className="font-bold"
                                    style={{ color: TYPE_COLORS[entry.name] || TYPE_COLORS.other }}
                                >
                                    {(pct[entry.name] || 0).toFixed(0)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={onOpenAdvice}
                    className="mt-6 w-full flex items-center justify-center gap-2 bg-surface-2 hover:bg-accent hover:text-white border border-border hover:border-accent text-text-1 rounded-xl py-3 px-4 text-sm font-medium transition-all duration-200 group"
                >
                    <Sparkles size={15} className="text-accent group-hover:text-white transition-colors" />
                    Analyse Portfolio
                </button>
            </div>
        </div>
    );
};
