import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { NAVHistoryEntry } from "../../../types";
import { formatCurrency } from "../../../lib/utils";
import { convertCurrency } from "../../../lib/fx";

interface PerformanceChartProps {
    navHistory: NAVHistoryEntry[];
    displayCurrency: string;
    fxRates: { [key: string]: number };
}

export const PerformanceChart = ({ navHistory, displayCurrency, fxRates }: PerformanceChartProps) => {
    return (
        <Card className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-text-3 uppercase tracking-widest">Performance</h3>
                <div className="flex gap-1 bg-surface-2 p-1 rounded-lg">
                    {['30D', '90D', 'ALL'].map(t => (
                        <button key={t} className="text-[10px] font-bold px-3 py-1 rounded-md hover:bg-surface transition-colors text-text-3 hover:text-text-1">
                            {t}
                        </button>
                    ))}
                </div>
            </div>
            {navHistory.length > 1 ? (
                <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={navHistory}>
                            <defs>
                                <linearGradient id="colorNAV" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#C96442" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#C96442" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" hide />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip
                                formatter={(value: number) => formatCurrency(convertCurrency(value, "USD", displayCurrency, fxRates), displayCurrency)}
                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px' }}
                            />
                            <Area type="monotone" dataKey="totalNAV" stroke="#C96442" fillOpacity={1} fill="url(#colorNAV)" strokeWidth={2.5} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-[240px] flex flex-col items-center justify-center text-center p-6 bg-surface-2/30 rounded-2xl border border-dashed border-border">
                    <TrendingUp className="text-text-3/30 mb-4" size={32} />
                    <p className="text-xs text-text-3 font-medium">Performance tracking will start soon</p>
                </div>
            )}
        </Card>
    );
};
