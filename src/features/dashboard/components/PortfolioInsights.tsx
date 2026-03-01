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

    // Determine the percentage of "investable" (liquid) assets 
    // This prevents a primary residence from overshadowing actual investment strategies
    const investableTotal = Object.entries(pct)
        .filter(([k]) => !['property', 'vehicle'].includes(k))
        .reduce((sum, [_, v]) => sum + v, 0);

    // If property dominates and they have very little investable assets
    if (property >= 75 && investableTotal < 15) {
        return { title: "Property Bull", subtitle: "Bricks over bytes. Slow and steady." };
    }

    // Scale liquid assets to 100% to find their true investing style
    const adjCrypto = investableTotal > 0 ? (crypto / investableTotal) * 100 : crypto;
    const adjStock = investableTotal > 0 ? (stock / investableTotal) * 100 : stock;
    const adjCash = investableTotal > 0 ? (cash / investableTotal) * 100 : cash;
    const adjOther = investableTotal > 0 ? (other / investableTotal) * 100 : other;

    // Liquid asset max alloc
    const maxLiquidAlloc = Math.max(adjCrypto, adjStock, adjCash, adjOther);

    if (adjCrypto >= 60) return { title: "The Crypto Degen", subtitle: "High conviction. High volatility. Zero chill." };
    if (adjCrypto >= 40) return { title: "Digital Maverick", subtitle: "Bullish on the future, one block at a time." };
    if (adjStock >= 70) return { title: "Equity Devotee", subtitle: "You believe in companies. Markets agree — mostly." };

    // If they still have a large chunk in property but didn't meet investable styles above
    if (property >= 60) return { title: "Property Bull", subtitle: "Bricks over bytes. Slow and steady." };

    if (adjCash >= 60) return { title: "The Cautious Accumulator", subtitle: "Patience is a strategy. Or it should be." };
    if (typeCount >= 4 && maxLiquidAlloc < 40) return { title: "The Diversifier", subtitle: "You've read the books. It shows." };
    if (adjOther >= 30) return { title: "The Speculator", subtitle: "Unconventional assets, unconventional thinking." };
    if (adjStock >= 40 && adjCrypto >= 20) return { title: "Growth Seeker", subtitle: "Balanced between tradition and the frontier." };

    return { title: "The Balanced Investor", subtitle: "Risk-aware and opportunity-ready." };
}


function getDiversificationScore(pct: Record<string, number>): { label: string; pct: number; color: string } {
    const values = Object.values(pct);
    const n = values.length;
    if (n <= 1) return { label: "Concentrated", pct: 8, color: "var(--color-negative)" };
    // Herfindahl–Hirschman Index: 1 = fully concentrated, 1/n = perfectly spread
    const hhi = values.reduce((sum, v) => sum + (v / 100) ** 2, 0);
    const maxHHI = 1;
    const minHHI = 1 / n;
    const score = Math.round(((maxHHI - hhi) / (maxHHI - minHHI)) * 100);
    if (score >= 70) return { label: "Diversified", pct: score, color: "var(--color-positive)" };
    if (score >= 40) return { label: "Moderate", pct: score, color: "var(--color-accent)" };
    return { label: "Concentrated", pct: score, color: "var(--color-negative)" };
}


function getRiskProfile(pct: Record<string, number>): { label: string; value: 1 | 2 | 3; color: string } {
    const score = (pct.crypto || 0) * 0.9 + (pct.stock || 0) * 0.5
        - (pct.cash || 0) * 0.7 - (pct.property || 0) * 0.4;
    if (score > 40) return { label: "High", value: 3, color: "var(--color-negative)" };
    if (score > 15) return { label: "Medium", value: 2, color: "var(--color-accent)" };
    return { label: "Low", value: 1, color: "var(--color-positive)" };
}

const ACCOUNT_PALETTE = [
    '#C96442', '#4A7C59', '#7B6FA8', '#3A8DA8',
    '#A89240', '#B5534A', '#5A8F7B', '#8F7B5A',
    '#6B8FA8', '#A87B5A',
];
function getAccountColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return ACCOUNT_PALETTE[Math.abs(hash) % ACCOUNT_PALETTE.length];
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
    const [tab, setTab] = useState<"type" | "account">("type");

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

    // Account breakdown (excludes liabilities/negative values)
    const byAccount = assets.reduce((acc, asset) => {
        const val = convertCurrency(asset.totalValue, asset.totalValueCurrency, displayCurrency, fxRates);
        if (val <= 0) return acc;
        const key = asset.source?.trim() || "Unassigned";
        acc[key] = (acc[key] || 0) + val;
        return acc;
    }, {} as Record<string, number>);
    const accountData = Object.entries(byAccount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    const accountTotal = accountData.reduce((s, e) => s + e.value, 0);
    const accountPct = Object.fromEntries(
        accountData.map(e => [e.name, accountTotal > 0 ? (e.value / accountTotal) * 100 : 0])
    );

    // Active display set — switches based on tab
    const displayData = tab === "type" ? chartData : accountData;
    const displayPct = tab === "type" ? pct : accountPct;
    const getColor = (name: string) => tab === "type"
        ? (TYPE_COLORS[name] || TYPE_COLORS.other)
        : getAccountColor(name);
    const getLabel = (name: string) => tab === "type"
        ? (TYPE_LABELS[name] || name)
        : name;

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

    const activeEntry = activeIndex !== null ? displayData[activeIndex] : null;

    return (
        <div className="grid lg:grid-cols-5 gap-6">

            {/* ── Left: Allocation Breakdown ── */}
            <div className="lg:col-span-3 bg-surface rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Allocation</h3>
                    <div className="flex items-center gap-0.5 bg-surface-2 rounded-full p-0.5">
                        {(["type", "account"] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => { setTab(t); setActiveIndex(null); }}
                                className={cn(
                                    "px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-200",
                                    tab === t
                                        ? "bg-surface text-text-1 shadow-sm"
                                        : "text-text-3 hover:text-text-2"
                                )}
                            >
                                {t === "type" ? "By Type" : "By Account"}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">

                    {/* Donut with center label overlay */}
                    <div className="relative w-[180px] shrink-0 h-[180px]">
                        <ResponsiveContainer width="100%" height={180} minWidth={0}>
                            <RePieChart>
                                <Pie
                                    data={displayData}
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
                                    {displayData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={getColor(entry.name)}
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
                                            style={{ color: getColor(activeEntry.name) }}
                                        >
                                            {(displayPct[activeEntry.name] || 0).toFixed(0)}%
                                        </div>
                                        <div className="text-[9px] text-text-3 font-medium mt-1 leading-tight max-w-[72px] text-center">
                                            {getLabel(activeEntry.name)}
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
                                            {displayData.length}
                                        </div>
                                        <div className="text-[9px] text-text-3 font-medium mt-1">
                                            {tab === "type"
                                                ? (displayData.length === 1 ? "class" : "classes")
                                                : (displayData.length === 1 ? "account" : "accounts")}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Breakdown table */}
                    <div className="flex-1 space-y-3 w-full">
                        {displayData.map((entry, index) => {
                            const p = displayPct[entry.name] || 0;
                            const color = getColor(entry.name);
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
                                                {getLabel(entry.name)}
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

                        {/* Liabilities row — type view only */}
                        {tab === "type" && hasLiabilities && (() => {
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
                            {tab === "type"
                                ? `${holdingsCount} holding${holdingsCount !== 1 ? "s" : ""} across ${chartData.length} class${chartData.length !== 1 ? "es" : ""}`
                                : `${holdingsCount} holding${holdingsCount !== 1 ? "s" : ""} across ${accountData.length} account${accountData.length !== 1 ? "s" : ""}`
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Right: Portfolio Profile ── */}
            {(() => {
                const risk = getRiskProfile(pct);
                const diversification = getDiversificationScore(pct);
                return (
                    <div className="lg:col-span-2 bg-surface rounded-2xl p-6 flex flex-col">
                        <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-5">Portfolio Profile</h3>

                        {/* Archetype identity */}
                        <div>
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

                        {/* Ratings */}
                        <div className="space-y-4 mt-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Risk Level</p>
                                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: risk.color }}>{risk.label}</span>
                                </div>
                                <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: risk.color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(risk.value / 3) * 100}%` }}
                                        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Diversification</p>
                                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: diversification.color }}>{diversification.label}</span>
                                </div>
                                <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: diversification.color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${diversification.pct}%` }}
                                        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onOpenAdvice}
                            className="mt-auto w-full flex items-center justify-center gap-2 bg-surface-2 hover:bg-surface-2/80 text-text-1 rounded-xl py-3 px-4 text-sm font-medium transition-colors"
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
