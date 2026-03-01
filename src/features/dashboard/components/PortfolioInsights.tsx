import React, { useState } from "react";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { motion, AnimatePresence } from "motion/react";
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


function getRiskProfile(pct: Record<string, number>): { label: string; value: 1 | 2 | 3; color: string } {
    const score = (pct.crypto || 0) * 0.9 + (pct.stock || 0) * 0.5
        - (pct.cash || 0) * 0.7 - (pct.property || 0) * 0.4;
    if (score > 40) return { label: "High",   value: 3, color: "var(--color-negative)" };
    if (score > 15) return { label: "Medium", value: 2, color: "var(--color-accent)" };
    return               { label: "Low",    value: 1, color: "var(--color-positive)" };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
        <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius - 2}
            outerRadius={outerRadius + 7}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
        />
    );
};

export const PortfolioInsights = ({ assets, displayCurrency, fxRates, onOpenAdvice }: PortfolioInsightsProps) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

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

    const activeEntry = activeIndex !== null ? chartData[activeIndex] : null;

    return (
        <div className="grid lg:grid-cols-5 gap-6">

            {/* ── Left: Allocation Breakdown ── */}
            <div className="lg:col-span-3 bg-surface rounded-2xl p-6">
                <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-6">Allocation</h3>
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">

                    {/* Donut with center label overlay */}
                    <div className="relative w-[180px] shrink-0 h-[180px]">
                        <ResponsiveContainer width="100%" height={180} minWidth={0}>
                            <RePieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={52}
                                    outerRadius={76}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                    activeIndex={activeIndex ?? undefined}
                                    activeShape={renderActiveShape}
                                    onMouseEnter={(_, index) => setActiveIndex(index)}
                                    onMouseLeave={() => setActiveIndex(null)}
                                    animationBegin={0}
                                    animationDuration={700}
                                    animationEasing="ease-out"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={TYPE_COLORS[entry.name] || TYPE_COLORS.other}
                                            style={{
                                                opacity: activeIndex === null || activeIndex === index ? 1 : 0.3,
                                                transition: "opacity 0.2s ease",
                                                cursor: "pointer",
                                            }}
                                        />
                                    ))}
                                </Pie>
                            </RePieChart>
                        </ResponsiveContainer>

                        {/* Center label */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <AnimatePresence mode="wait">
                                {activeEntry ? (
                                    <motion.div
                                        key={activeEntry.name}
                                        initial={{ opacity: 0, scale: 0.85 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.85 }}
                                        transition={{ duration: 0.15 }}
                                        className="text-center"
                                    >
                                        <div
                                            className="text-xl font-bold tabular-nums leading-none"
                                            style={{ color: TYPE_COLORS[activeEntry.name] || TYPE_COLORS.other }}
                                        >
                                            {(pct[activeEntry.name] || 0).toFixed(0)}%
                                        </div>
                                        <div className="text-[9px] text-text-3 font-medium mt-1 leading-tight max-w-[72px] text-center">
                                            {TYPE_LABELS[activeEntry.name] || activeEntry.name}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="default"
                                        initial={{ opacity: 0, scale: 0.85 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.85 }}
                                        transition={{ duration: 0.15 }}
                                        className="text-center"
                                    >
                                        <div className="text-lg font-bold text-text-1 tabular-nums leading-none">
                                            {chartData.length}
                                        </div>
                                        <div className="text-[9px] text-text-3 font-medium mt-1">
                                            {chartData.length === 1 ? "class" : "classes"}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Breakdown table */}
                    <div className="flex-1 space-y-3 w-full">
                        {chartData.map((entry, index) => {
                            const p = pct[entry.name] || 0;
                            const color = TYPE_COLORS[entry.name] || TYPE_COLORS.other;
                            const isActive = activeIndex === index;
                            const isDimmed = activeIndex !== null && !isActive;
                            return (
                                <div
                                    key={entry.name}
                                    className="space-y-1.5 cursor-default"
                                    style={{ opacity: isDimmed ? 0.35 : 1, transition: "opacity 0.2s ease" }}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onMouseLeave={() => setActiveIndex(null)}
                                >
                                    <div className="flex items-center justify-between text-[11px]">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2 h-2 rounded-full shrink-0 transition-transform duration-200"
                                                style={{
                                                    backgroundColor: color,
                                                    transform: isActive ? "scale(1.4)" : "scale(1)",
                                                }}
                                            />
                                            <span className={cn(
                                                "font-semibold transition-colors duration-150",
                                                isActive ? "text-text-1" : "text-text-2"
                                            )}>
                                                {TYPE_LABELS[entry.name] || entry.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 tabular-nums">
                                            <span className="text-text-3">{p.toFixed(1)}%</span>
                                            <span className={cn(
                                                "font-bold transition-colors duration-150",
                                                isActive ? "text-text-1" : "text-text-2"
                                            )}>
                                                {formatCurrency(entry.value, displayCurrency)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${p}%`, opacity: isActive ? 1 : 0.65 }}
                                            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: index * 0.05 }}
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        {/* Liabilities row */}
                        {hasLiabilities && (() => {
                            const liabPct = positiveTotal > 0 ? (Math.abs(totalLiabilities) / positiveTotal) * 100 : 0;
                            return (
                                <div className="space-y-1.5">
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
                                    <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full bg-negative/60"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${liabPct}%` }}
                                            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
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

            {/* ── Right: Portfolio Profile ── */}
            {(() => {
                const risk = getRiskProfile(pct);
                return (
                    <div className="lg:col-span-2 bg-surface rounded-2xl p-6 flex flex-col">
                        <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-5">Portfolio Profile</h3>

                        {/* Archetype identity */}
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-1.5 bg-accent/8 border border-accent/20 rounded-full px-2.5 py-1 mb-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                <span className="text-[9px] font-bold text-accent uppercase tracking-widest">Investor Type</span>
                            </div>

                            <motion.h2
                                key={archetype.title}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                                className="text-2xl font-serif text-text-1 mb-1.5"
                            >
                                {archetype.title}
                            </motion.h2>
                            <p className="text-sm text-text-2 leading-relaxed italic">{archetype.subtitle}</p>
                        </div>

                        {/* Risk level */}
                        <div className="border-t border-border/60 pt-4 mt-5 mb-5">
                            <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-2">Risk Level</p>
                            <div className="flex items-center gap-2">
                                {([1, 2, 3] as const).map(dot => (
                                    <div
                                        key={dot}
                                        className="w-3 h-3 rounded-full transition-all duration-300"
                                        style={{
                                            backgroundColor: dot <= risk.value ? risk.color : "transparent",
                                            border: `1.5px solid ${dot <= risk.value ? risk.color : "var(--color-border)"}`,
                                            opacity: dot <= risk.value ? 1 : 0.4,
                                        }}
                                    />
                                ))}
                                <span className="text-xs font-semibold ml-0.5" style={{ color: risk.color }}>
                                    {risk.label}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={onOpenAdvice}
                            className="w-full flex items-center justify-center gap-2 bg-surface-2 hover:bg-surface-2/80 text-text-1 rounded-xl py-3 px-4 text-sm font-medium transition-colors"
                        >
                            <Sparkles size={15} className="text-accent" />
                            Analyse Portfolio
                        </button>
                    </div>
                );
            })()}
        </div>
    );
};
