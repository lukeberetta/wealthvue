import React from "react";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Asset } from "../../../types";
import { formatCurrency } from "../../../lib/utils";
import { convertCurrency } from "../../../lib/fx";

interface AssetAllocationChartProps {
    assets: Asset[];
    displayCurrency: string;
    fxRates: { [key: string]: number };
}

const COLORS = ['#C96442', '#4A7C59', '#6B6560', '#B5534A', '#EDE9E3', '#1A1612'];

export const AssetAllocationChart = ({ assets, displayCurrency, fxRates }: AssetAllocationChartProps) => {
    const assetTypeData = Object.entries(
        assets.reduce((acc, asset) => {
            const val = convertCurrency(asset.totalValue, asset.totalValueCurrency, displayCurrency, fxRates);
            acc[asset.assetType] = (acc[asset.assetType] || 0) + val;
            return acc;
        }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));

    return (
        <Card className="lg:col-span-1">
            <h3 className="text-sm font-bold text-text-3 uppercase tracking-widest mb-6">Allocation</h3>
            {assets.length > 0 ? (
                <div className="space-y-6">
                    <div className="h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={assetTypeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {assetTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => formatCurrency(value, displayCurrency)}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                        {assetTypeData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="text-[10px] font-bold text-text-2 uppercase tracking-tight truncate">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="h-[240px] flex flex-col items-center justify-center text-center p-6 bg-surface-2/30 rounded-2xl border border-dashed border-border">
                    <PieChart className="text-text-3/30 mb-4" size={32} />
                    <p className="text-xs text-text-3 font-medium">No data to show</p>
                </div>
            )}
        </Card>
    );
};
