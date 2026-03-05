import React, { useEffect, useMemo, useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import { TrendingUp, RotateCcw, ChevronDown } from "lucide-react";
import { Asset, NAVHistoryEntry } from "../../../types";
import { convertCurrency } from "../../../lib/fx";
import { formatCurrencyCompact, cn } from "../../../lib/utils";

const TYPE_LABELS: Record<string, string> = {
    stock: "Stocks",
    etf: "ETFs",
    crypto: "Crypto",
    commodities: "Commodities",
    vehicle: "Vehicles",
    property: "Property",
    cash: "Cash",
    other: "Other",
};

interface NAVChartProps {
    navHistory: NAVHistoryEntry[];
    displayCurrency: string;
    fxRates: { [key: string]: number };
    assets?: Asset[];
    onResetTracking?: () => Promise<void>;
    period: Period;
}

export type Period = "1W" | "1M" | "3M" | "All";
export const PERIODS: Period[] = ["1W", "1M", "3M", "All"];



function cutoffDate(period: Period): string {
    const d = new Date();
    if (period === "1W") d.setDate(d.getDate() - 7);
    else if (period === "1M") d.setMonth(d.getMonth() - 1);
    else if (period === "3M") d.setMonth(d.getMonth() - 3);
    else return "0000-00-00";
    return d.toISOString().split("T")[0];
}

function formatXLabel(dateStr: string, period: Period): string {
    const [, month, day] = dateStr.split("-");
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const m = monthNames[parseInt(month, 10) - 1];
    if (period === "1W") return `${m} ${parseInt(day, 10)}`;
    if (period === "1M" || period === "3M") return `${m} ${parseInt(day, 10)}`;
    return m; // "All" — just show month
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, displayCurrency }: any) {
    if (!active || !payload?.length) return null;
    const { date, nav, change, changePct } = payload[0].payload;
    const isPositive = change >= 0;

    return (
        <div className="bg-surface border border-border rounded-xl px-3.5 py-2.5 shadow-lg text-left min-w-[160px]">
            <p className="text-[10px] text-text-3 mb-1">{date}</p>
            <p className="text-sm font-bold tabular-nums text-text-1">
                {formatCurrencyCompact(nav, displayCurrency)}
            </p>
            {change !== null && (
                <p className={cn("text-[11px] tabular-nums font-medium mt-0.5", isPositive ? "text-positive" : "text-negative")}>
                    {isPositive ? "+" : ""}{formatCurrencyCompact(change, displayCurrency)}{" "}
                    ({isPositive ? "+" : ""}{changePct.toFixed(2)}%)
                </p>
            )}
        </div>
    );
}

export const NAVChart = ({ navHistory, displayCurrency, fxRates, assets = [], onResetTracking, period }: NAVChartProps) => {
    const [resetArmed, setResetArmed] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    const handleResetClick = async () => {
        if (!resetArmed) {
            setResetArmed(true);
            return;
        }
        setIsResetting(true);
        setResetArmed(false);
        await onResetTracking?.();
        setIsResetting(false);
    };

    // Category breakdown — current value per type + period % change from navHistory
    const categoryBreakdown = useMemo(() => {
        const currentByType: Record<string, number> = {};
        for (const asset of assets) {
            const val = convertCurrency(asset.totalValue, asset.totalValueCurrency, displayCurrency, fxRates);
            currentByType[asset.assetType] = (currentByType[asset.assetType] || 0) + val;
        }

        const sorted = [...navHistory].sort((a, b) => a.date.localeCompare(b.date));
        const cutoff = cutoffDate(period);
        const anchor = period === "All"
            ? sorted[0]
            : sorted.filter(e => e.date <= cutoff).at(-1) ?? sorted[0];

        return Object.entries(currentByType)
            .map(([type, value]) => {
                let changePct: number | null = null;
                if (anchor?.categoryBreakdown && anchor.categoryBreakdown[type] != null) {
                    const anchorVal = convertCurrency(anchor.categoryBreakdown[type], "USD", displayCurrency, fxRates);
                    changePct = anchorVal > 0 ? ((value - anchorVal) / anchorVal) * 100 : null;
                }
                return { type, value, changePct };
            })
            .sort((a, b) => b.value - a.value);
    }, [assets, navHistory, displayCurrency, fxRates, period]);

    // Reset to "all" if the selected category disappears
    useEffect(() => {
        if (selectedCategory !== "all" && !categoryBreakdown.find(c => c.type === selectedCategory)) {
            setSelectedCategory("all");
        }
    }, [categoryBreakdown, selectedCategory]);

    // Overall period % change for the "All" tab (independent of selectedCategory)
    const allPeriodChangePct = useMemo(() => {
        const cutoff = cutoffDate(period);
        const filtered = [...navHistory]
            .sort((a, b) => a.date.localeCompare(b.date))
            .filter(e => e.date >= cutoff);
        if (filtered.length < 2) return 0;
        const first = convertCurrency(filtered[0].totalNAV, "USD", displayCurrency, fxRates);
        const last = convertCurrency(filtered[filtered.length - 1].totalNAV, "USD", displayCurrency, fxRates);
        return first > 0 ? ((last - first) / first) * 100 : 0;
    }, [navHistory, displayCurrency, fxRates, period]);

    const chartData = useMemo(() => {
        if (navHistory.length === 0) return [];

        const cutoff = cutoffDate(period);

        const filtered = [...navHistory]
            .sort((a, b) => a.date.localeCompare(b.date))
            .filter(e => e.date >= cutoff);

        if (filtered.length === 0) return [];

        const getVal = (entry: NAVHistoryEntry): number | null => {
            if (selectedCategory === "all") return entry.totalNAV;
            return entry.categoryBreakdown?.[selectedCategory] ?? null;
        };

        const validFiltered = filtered.filter(e => getVal(e) !== null);
        if (validFiltered.length === 0) return [];

        const firstUSD = getVal(validFiltered[0])!;
        const first = convertCurrency(firstUSD, "USD", displayCurrency, fxRates);

        return validFiltered.map((entry, i) => {
            const navUSD = getVal(entry)!;
            const nav = convertCurrency(navUSD, "USD", displayCurrency, fxRates);
            const change = i === 0 ? null : nav - first;
            const changePct = i === 0 || first === 0 ? 0 : ((nav - first) / first) * 100;

            return {
                date: entry.date,
                dateLabel: formatXLabel(entry.date, period),
                nav,
                change,
                changePct,
            };
        });
    }, [navHistory, displayCurrency, fxRates, period, selectedCategory]);

    const isEmpty = navHistory.length < 2 || chartData.length < 2;

    const lineColor = "var(--color-text-1)";
    const gradientId = "navGradientNeutral";

    const allValues = chartData.map((d: { nav: number }) => d.nav);
    const minNav = allValues.length > 0 ? Math.min(...allValues) : 0;
    const maxNav = allValues.length > 0 ? Math.max(...allValues) : 0;
    const padding = (maxNav - minNav) * 0.12 || maxNav * 0.05;
    const yMin = Math.max(0, minNav - padding);
    const yMax = maxNav + padding;

    const firstNav = chartData[0]?.nav ?? 0;

    const xTickCount = period === "1W" ? 7 : period === "1M" ? 5 : period === "3M" ? 6 : 6;

    const activeChangePct = selectedCategory === "all"
        ? allPeriodChangePct
        : (categoryBreakdown.find(c => c.type === selectedCategory)?.changePct ?? null);
    const activeIsUp = activeChangePct === null ? true : activeChangePct >= 0;

    return (
        <div className="bg-surface rounded-2xl p-6">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-widest">
                        Net Worth History
                    </h3>
                    {activeChangePct !== null && (
                        <span className={cn(
                            "text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-full",
                            activeIsUp ? "text-positive bg-positive/10" : "text-negative bg-negative/10"
                        )}>
                            {activeIsUp ? "+" : ""}{activeChangePct.toFixed(2)}%
                        </span>
                    )}
                </div>
                {categoryBreakdown.length > 0 && (
                    <div className="relative">
                        <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            className="appearance-none bg-surface-2 border border-border rounded-lg px-3 py-1.5 pr-7 text-xs font-bold text-text-1 focus:outline-none focus:ring-2 focus:ring-accent/20"
                        >
                            <option value="all">All</option>
                            {categoryBreakdown.map(({ type }) => (
                                <option key={type} value={type}>
                                    {TYPE_LABELS[type] || type}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-text-3" size={12} />
                    </div>
                )}
            </div>

            {/* Empty state */}
            {isEmpty ? (
                <div className="h-[200px] flex flex-col items-center justify-center text-center bg-surface-2/30 rounded-2xl border border-dashed border-border">
                    <TrendingUp className="text-text-3/30 mb-3" size={28} />
                    <p className="text-xs text-text-3 font-medium">
                        {navHistory.length < 2
                            ? "History builds up over time — check back tomorrow"
                            : `No data for this period`}
                    </p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart
                        data={chartData}
                        margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
                    >
                        <defs>
                            <linearGradient id="navGradientNeutral" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--color-text-1)" stopOpacity={0.08} />
                                <stop offset="100%" stopColor="var(--color-text-1)" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <XAxis
                            dataKey="dateLabel"
                            tick={{ fill: "var(--color-text-3)", fontSize: 10, fontFamily: "DM Sans" }}
                            tickLine={false}
                            axisLine={false}
                            interval={Math.max(0, Math.floor(chartData.length / xTickCount) - 1)}
                            dy={6}
                        />
                        <YAxis
                            domain={[yMin, yMax]}
                            tickFormatter={v => formatCurrencyCompact(v, displayCurrency)}
                            tick={{ fill: "var(--color-text-3)", fontSize: 10, fontFamily: "DM Sans" }}
                            tickLine={false}
                            axisLine={false}
                            tickCount={4}
                            width={62}
                        />
                        <Tooltip
                            content={
                                <CustomTooltip
                                    displayCurrency={displayCurrency}
                                />
                            }
                            cursor={{ stroke: "var(--color-border)", strokeWidth: 1, strokeDasharray: "4 3" }}
                        />

                        {/* Baseline — first value in period */}
                        <ReferenceLine
                            y={firstNav}
                            stroke="var(--color-border)"
                            strokeDasharray="4 3"
                            strokeWidth={1}
                        />

                        <Area
                            type="monotone"
                            dataKey="nav"
                            stroke={lineColor}
                            strokeWidth={1.75}
                            fill={`url(#${gradientId})`}
                            dot={false}
                            activeDot={{
                                r: 4,
                                fill: lineColor,
                                stroke: "var(--color-surface)",
                                strokeWidth: 2,
                            }}
                            animationDuration={600}
                            animationEasing="ease-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}

            {/* Footer — reset tracking */}
            {onResetTracking && navHistory.length > 0 && (
                <div className="flex items-center justify-end mt-3">
                    {resetArmed ? (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-text-3">Reset all tracking history?</span>
                            <button
                                onClick={handleResetClick}
                                disabled={isResetting}
                                className="text-[10px] font-bold text-negative hover:text-negative/80 transition-colors disabled:opacity-40"
                            >
                                {isResetting ? "Resetting…" : "Yes, reset"}
                            </button>
                            <button
                                onClick={() => setResetArmed(false)}
                                className="text-[10px] text-text-3 hover:text-text-2 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleResetClick}
                            className="flex items-center gap-1 text-[10px] text-text-3 hover:text-text-2 transition-colors"
                            title="Clear history and start tracking from today"
                        >
                            <RotateCcw size={10} />
                            Reset tracking
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
