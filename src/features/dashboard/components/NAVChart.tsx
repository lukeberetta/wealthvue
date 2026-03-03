import React, { useMemo, useState } from "react";
import {
    AreaChart,
    Area,
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

interface NAVChartProps {
    navHistory: NAVHistoryEntry[];
    displayCurrency: string;
    fxRates: { [key: string]: number };
    onResetTracking?: () => Promise<void>;
}

type Period = "1W" | "1M" | "3M" | "All";

const PERIODS: Period[] = ["1W", "1M", "3M", "All"];

function periodLabel(p: Period) {
    return { "1W": "1 Week", "1M": "1 Month", "3M": "3 Months", "All": "All Time" }[p];
}

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
        <div className="bg-surface border border-border rounded-xl px-3.5 py-2.5 shadow-lg text-left min-w-[140px]">
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

export const NAVChart = ({ navHistory, displayCurrency, fxRates, onResetTracking }: NAVChartProps) => {
    const [period, setPeriod] = useState<Period>("1M");
    const [resetArmed, setResetArmed] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

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

        return filtered.map((entry, i) => {
            const nav = convertCurrency(entry.totalNAV, "USD", displayCurrency, fxRates);
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
    }, [navHistory, displayCurrency, fxRates, period]);

    const isEmpty = navHistory.length < 2 || chartData.length < 2;

    // Determine chart colour based on whether the period is up or down
    const isUp = chartData.length >= 2
        ? chartData[chartData.length - 1].nav >= chartData[0].nav
        : true;

    const lineColor = isUp ? "var(--color-positive)" : "var(--color-negative)";
    const gradientId = isUp ? "navGradientUp" : "navGradientDown";

    // Calculate min/max for Y domain padding
    const navValues = chartData.map(d => d.nav);
    const minNav = Math.min(...navValues);
    const maxNav = Math.max(...navValues);
    const padding = (maxNav - minNav) * 0.12 || maxNav * 0.05;
    const yMin = Math.max(0, minNav - padding);
    const yMax = maxNav + padding;

    // Period change stats
    const firstNav = chartData[0]?.nav ?? 0;
    const lastNav = chartData[chartData.length - 1]?.nav ?? 0;
    const periodChange = lastNav - firstNav;
    const periodChangePct = firstNav > 0 ? (periodChange / firstNav) * 100 : 0;

    // Decide how many X ticks to show
    const xTickCount = period === "1W" ? 7 : period === "1M" ? 5 : period === "3M" ? 6 : 6;

    return (
        <div className="bg-surface rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-widest">
                        Net Worth History
                    </h3>
                    {!isEmpty && (
                        <span className={cn(
                            "text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-full",
                            isUp
                                ? "text-positive bg-positive/10"
                                : "text-negative bg-negative/10"
                        )}>
                            {isUp ? "+" : ""}{periodChangePct.toFixed(2)}% · {periodLabel(period)}
                        </span>
                    )}
                </div>

                {/* Period selector */}
                <div className="flex items-center gap-0.5 bg-surface-2 rounded-full p-0.5">
                    {PERIODS.map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-bold transition-all duration-200",
                                period === p
                                    ? "bg-surface text-text-1 shadow-sm"
                                    : "text-text-3 hover:text-text-2"
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>
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
                            width={68}
                        />
                        <Tooltip
                            content={<CustomTooltip displayCurrency={displayCurrency} />}
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
