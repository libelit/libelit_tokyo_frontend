"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartDataPoint {
  date: string;
  value: number;
}

interface LoansChartProps {
  data: ChartDataPoint[];
}

// Format large numbers for Y-axis
function formatYAxisValue(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
}

// Format currency for tooltip
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function LoansChart({ data }: LoansChartProps) {
  // Calculate dynamic Y-axis domain and ticks based on data
  const { maxValue, ticks } = useMemo(() => {
    const max = Math.max(...data.map((d) => d.value), 0);

    if (max === 0) {
      return { maxValue: 100, ticks: [0, 25, 50, 75, 100] };
    }

    // Round up to a nice number
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    const normalized = max / magnitude;
    let niceMax: number;

    if (normalized <= 1) niceMax = magnitude;
    else if (normalized <= 2) niceMax = 2 * magnitude;
    else if (normalized <= 5) niceMax = 5 * magnitude;
    else niceMax = 10 * magnitude;

    // Generate 4-5 tick marks
    const tickCount = 4;
    const tickInterval = niceMax / tickCount;
    const calculatedTicks = Array.from({ length: tickCount + 1 }, (_, i) => i * tickInterval);

    return { maxValue: niceMax, ticks: calculatedTicks };
  }, [data]);

  const currentYear = new Date().getFullYear();

  return (
    <Card className="shadow-none border-none bg-white">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">
          Approved loans value
        </CardTitle>
        <span className="text-sm text-muted-foreground">
          {currentYear}
        </span>
      </CardHeader>
      <CardContent>
        <div className="h-[180px] sm:h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E86A33" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E86A33" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" vertical={true} horizontal={true} stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#888" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#888" }}
                width={50}
                domain={[0, maxValue]}
                ticks={ticks}
                tickFormatter={formatYAxisValue}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [formatCurrency(value), "Approved Loans"]}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#E86A33"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
