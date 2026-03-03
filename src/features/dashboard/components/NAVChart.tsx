import React, { useMemo, useState, useEffect } from "react";
import {
    AreaChart,
    Area,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import { TrendingUp, RotateCcw } from "lucide-react";
import { NAVHistoryEntry } from "../../../types";
import { convertCurrency } from "../../../lib/fx";
import { formatCurrencyCompact, cn } from "../../../lib/utils";
import {
    fetchSP500History,
    findSP500Close,
    SP500DataPoint,
} from "../../../lib/benchmark";

interface NAVChartProps {
    navHistory: NAVHistoryEntry[];
    displayCurrency: string;
    fxRates: { [key: string]: number };
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
function CustomTooltip({ active, payload, displayCurrency, showBenchmark }: any) {
    if (!active || !payload?.length) return null;
    const { date, nav, change, changePct, benchmarkNAV } = payload[0].payload;
    const isPositive = change >= 0;

    const benchmarkChange = benchmarkNAV != null ? benchmarkNAV - nav : null;
    const isBeating = benchmarkChange != null && benchmarkChange < 0; // portfolio > benchmark

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
            {showBenchmark && benchmarkNAV != null && (
                <div className="mt-1.5 pt-1.5 border-t border-border/60">
                    <p className="text-[10px] text-text-3 mb-0.5">S&P 500 (benchmark)</p>
                    <p className="text-[11px] tabular-nums font-medium text-accent">
                        {formatCurrencyCompact(benchmarkNAV, displayCurrency)}
                    </p>
                    {benchmarkChange !== null && (
                        <p className={cn("text-[10px] tabular-nums mt-0.5", isBeating ? "text-positive" : "text-negative")}>
                            {isBeating ? "Beating by " : "Lagging by "}
                            {formatCurrencyCompact(Math.abs(benchmarkChange), displayCurrency)}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export const NAVChart = ({ navHistory, displayCurrency, fxRates, onResetTracking, period }: NAVChartProps) => {
    const [resetArmed, setResetArmed] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    // Benchmark state
    const [showBenchmark, setShowBenchmark] = useState(true);
    const [sp500Data, setSP500Data] = useState<SP500DataPoint[]>([]);
    const [benchmarkLoading, setBenchmarkLoading] = useState(false);
    const [benchmarkError, setBenchmarkError] = useState(false);

    useEffect(() => {
        if (!showBenchmark || sp500Data.length > 0) return;
        setBenchmarkLoading(true);
        setBenchmarkError(false);
        fetchSP500History()
            .then((data) => {
                setSP500Data(data);
            })
            .catch(() => {
                setBenchmarkError(true);
                setShowBenchmark(false);
            })
            .finally(() => setBenchmarkLoading(false));
    }, [showBenchmark, sp500Data.length]);

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

    const chartData = useMemo(() => {
        if (navHistory.length === 0) return [];

        const cutoff = cutoffDate(period);

        // Sort ascending, filter to period window
        const filtered = [...navHistory]
            .sort((a, b) => a.date.localeCompare(b.date))
            .filter(e => e.date >= cutoff);

        if (filtered.length === 0) return [];

        const first = convertCurrency(filtered[0].totalNAV, "USD", displayCurrency, fxRates);

        // S&P 500 start close for this period (scale benchmark to portfolio start NAV)
        const sp500Start = sp500Data.length > 0
            ? findSP500Close(sp500Data, filtered[0].date)
            : null;

        return filtered.map((entry, i) => {
            const nav = convertCurrency(entry.totalNAV, "USD", displayCurrency, fxRates);
            const change = i === 0 ? null : nav - first;
            const changePct = i === 0 || first === 0 ? 0 : ((nav - first) / first) * 100;

            let benchmarkNAV: number | undefined = undefined;
            if (showBenchmark && sp500Data.length > 0 && sp500Start && sp500Start > 0 && first > 0) {
                const sp500Close = findSP500Close(sp500Data, entry.date);
                if (sp500Close != null) {
                    benchmarkNAV = first * (sp500Close / sp500Start);
                }
            }

            return {
                date: entry.date,
                dateLabel: formatXLabel(entry.date, period),
                nav,
                change,
                changePct,
                benchmarkNAV,
            };
        });
    }, [navHistory, displayCurrency, fxRates, period, sp500Data, showBenchmark]);

    const isEmpty = navHistory.length < 2 || chartData.length < 2;

    // Determine chart colour based on whether the period is up or down
    const isUp = chartData.length >= 2
        ? chartData[chartData.length - 1].nav >= chartData[0].nav
        : true;

    const lineColor = isUp ? "var(--color-positive)" : "var(--color-negative)";
    const gradientId = isUp ? "navGradientUp" : "navGradientDown";

    // Calculate min/max for Y domain padding — include benchmark values if visible
    const allValues = chartData.flatMap((d: { nav: number; benchmarkNAV?: number }) =>
        [d.nav, showBenchmark ? d.benchmarkNAV : undefined].filter((v): v is number => v != null)
    );
    const minNav = allValues.length > 0 ? Math.min(...allValues) : 0;
    const maxNav = allValues.length > 0 ? Math.max(...allValues) : 0;
    const padding = (maxNav - minNav) * 0.12 || maxNav * 0.05;
    const yMin = Math.max(0, minNav - padding);
    const yMax = maxNav + padding;

    // Period change stats
    const firstNav = chartData[0]?.nav ?? 0;
    const lastNav = chartData[chartData.length - 1]?.nav ?? 0;
    const periodChange = lastNav - firstNav;
    const periodChangePct = firstNav > 0 ? (periodChange / firstNav) * 100 : 0;

    // S&P 500 period change for comparison badge
    const firstBenchmark = chartData[0]?.benchmarkNAV;
    const lastBenchmark = chartData[chartData.length - 1]?.benchmarkNAV;
    const sp500Pct = firstBenchmark && lastBenchmark && firstNav > 0
        ? ((lastBenchmark - firstBenchmark) / firstBenchmark) * 100
        : null;

    // Decide how many X ticks to show
    const xTickCount = period === "1W" ? 7 : period === "1M" ? 5 : period === "3M" ? 6 : 6;

    return (
        <div className="bg-surface rounded-2xl p-6">
            {/* Header */}
            {!isEmpty && (
                <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2">
                    {/* Title — flex-1 on mobile so toggle stays on the same row */}
                    <h3 className="order-1 flex-1 sm:flex-none text-[10px] font-bold text-text-3 uppercase tracking-widest">
                        Net Worth History
                    </h3>

                    {/* Toggle — order-2 mobile (row 1, right of title), order-3 desktop (rightmost) */}
                    <button
                        onClick={() => setShowBenchmark(b => !b)}
                        disabled={benchmarkLoading}
                        className={cn(
                            "order-2 sm:order-3 sm:ml-auto flex items-center gap-2 group",
                            benchmarkLoading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <span className={cn(
                            "text-[10px] font-semibold transition-colors",
                            showBenchmark ? "text-text-2" : "text-text-3 group-hover:text-text-2"
                        )}>
                            {benchmarkLoading ? "Loading…" : benchmarkError ? "Unavailable" : "S&P 500"}
                        </span>
                        <span className={cn(
                            "relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-200",
                            showBenchmark ? "bg-accent" : "bg-border"
                        )}>
                            <span className={cn(
                                "inline-block h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-200",
                                showBenchmark ? "translate-x-3.5" : "translate-x-0.5"
                            )} />
                        </span>
                    </button>

                    {/* Pills — order-3 mobile (wraps to row 2), order-2 desktop (inline after title) */}
                    <div className="order-3 sm:order-2 flex items-center gap-2 w-full sm:w-auto">
                        <span className={cn(
                            "text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-full",
                            isUp ? "text-positive bg-positive/10" : "text-negative bg-negative/10"
                        )}>
                            You: {isUp ? "+" : ""}{periodChangePct.toFixed(2)}%
                        </span>
                        {showBenchmark && sp500Pct !== null && (
                            <span className={cn(
                                "text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-full",
                                sp500Pct >= 0 ? "text-positive bg-positive/10" : "text-negative bg-negative/10"
                            )}>
                                S&P 500: {sp500Pct >= 0 ? "+" : ""}{sp500Pct.toFixed(2)}%
                            </span>
                        )}
                    </div>
                </div>
            )}

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
                            <linearGradient id="navGradientUp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--color-positive)" stopOpacity={0.18} />
                                <stop offset="100%" stopColor="var(--color-positive)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="navGradientDown" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--color-negative)" stopOpacity={0.18} />
                                <stop offset="100%" stopColor="var(--color-negative)" stopOpacity={0} />
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
                                    showBenchmark={showBenchmark}
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

                        {/* S&P 500 benchmark overlay */}
                        {showBenchmark && sp500Data.length > 0 && (
                            <Line
                                type="monotone"
                                dataKey="benchmarkNAV"
                                stroke="var(--color-accent)"
                                strokeWidth={1.5}
                                strokeDasharray="5 3"
                                dot={false}
                                activeDot={{
                                    r: 3,
                                    fill: "var(--color-accent)",
                                    stroke: "var(--color-surface)",
                                    strokeWidth: 2,
                                }}
                                animationDuration={600}
                                connectNulls
                            />
                        )}
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
