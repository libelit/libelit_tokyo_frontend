"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { Project } from "@/lib/types";

interface FundingProgressChartProps {
  projects: Project[];
}

export function FundingProgressChart({ projects }: FundingProgressChartProps) {
  const { chartData, totalFunding, trend, percentageChange } = useMemo(() => {
    // Group projects by month and calculate cumulative funding
    const monthlyData: Record<string, { raised: number; target: number }> = {};

    // Sort projects by creation date
    const sortedProjects = [...projects].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    sortedProjects.forEach((project) => {
      const date = new Date(project.created_at);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { raised: 0, target: 0 };
      }

      monthlyData[monthKey].raised += project.amount_raised || 0;
      monthlyData[monthKey].target += project.loan_amount || 0;
    });

    // Convert to array and calculate cumulative values
    const entries = Object.entries(monthlyData);
    let cumulativeRaised = 0;
    let cumulativeTarget = 0;

    const data = entries.map(([month, values]) => {
      cumulativeRaised += values.raised;
      cumulativeTarget += values.target;
      return {
        month,
        raised: cumulativeRaised,
        target: cumulativeTarget,
      };
    });

    // If no data, generate placeholder months
    if (data.length === 0) {
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        data.push({
          month: date.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          }),
          raised: 0,
          target: 0,
        });
      }
    }

    // Calculate trend
    const total = cumulativeRaised;
    const previousTotal = data.length > 1 ? data[data.length - 2]?.raised || 0 : 0;
    const change = previousTotal > 0
      ? ((total - previousTotal) / previousTotal) * 100
      : total > 0 ? 100 : 0;

    return {
      chartData: data,
      totalFunding: total,
      trend: change >= 0 ? "up" : "down",
      percentageChange: Math.abs(change).toFixed(1),
    };
  }, [projects]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Funding Progress</h2>
          <p className="text-sm text-gray-500">Cumulative funding over time</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{formatCurrency(totalFunding)}</p>
          <div className="flex items-center justify-end gap-1 text-sm">
            {trend === "up" ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={trend === "up" ? "text-green-600" : "text-red-600"}>
              {percentageChange}%
            </span>
            <span className="text-gray-500">vs last period</span>
          </div>
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRaised" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E86A33" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#E86A33" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value) => [
                formatCurrency(value as number),
                "",
              ]}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="target"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTarget)"
            />
            <Area
              type="monotone"
              dataKey="raised"
              stroke="#E86A33"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRaised)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#E86A33]" />
          <span className="text-gray-600">Amount Raised</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <span className="text-gray-600">Target Amount</span>
        </div>
      </div>
    </div>
  );
}
