"use client";
// components/dashboard/charts/TimeSeriesChart.tsx
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { ChartDataPoint } from "@/lib/analytics/types";
import { formatDateLabel } from "@/lib/analytics/utils/timeframes";

type ChartType = "line" | "bar" | "area";

interface SeriesConfig {
  dataKey: string;
  label: string;
  color: string;
}

interface Props {
  data: ChartDataPoint[];
  type?: ChartType;
  series?: SeriesConfig[];
  loading?: boolean;
  prefix?: string;
  height?: number;
}

const SKELETON_BARS = 12;

function LoadingSkeleton({ height }: { height: number }) {
  return (
    <div className="animate-pulse flex items-end gap-1 w-full" style={{ height }}>
      {Array.from({ length: SKELETON_BARS }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-200 rounded-t flex-1"
          style={{ height: `${30 + Math.random() * 60}%` }}
        />
      ))}
    </div>
  );
}

function EmptyState({ height }: { height: number }) {
  return (
    <div className="flex flex-col items-center justify-center text-gray-400" style={{ height }}>
      <div className="text-3xl mb-2">📊</div>
      <p className="text-sm">No data for this period</p>
    </div>
  );
}

const defaultSeries: SeriesConfig[] = [
  { dataKey: "value", label: "Value", color: "#3b82f6" },
];

function formatTooltipValue(value: number, prefix = "") {
  return `${prefix}${value.toLocaleString()}`;
}

export default function TimeSeriesChart({
  data,
  type = "area",
  series = defaultSeries,
  loading = false,
  prefix = "",
  height = 260,
}: Props) {
  if (loading) return <LoadingSkeleton height={height} />;
  const hasData = data.some((d) => d.value > 0);
  if (!hasData) return <EmptyState height={height} />;

  const formatted = data.map((d) => ({ ...d, label: d.label ?? formatDateLabel(d.date) }));

  const commonAxisProps = {
    tick: { fontSize: 11, fill: "#9ca3af" },
    axisLine: false,
    tickLine: false,
  };

  const renderChart = () => {
    if (type === "line") {
      return (
        <LineChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="label" {...commonAxisProps} />
          <YAxis {...commonAxisProps} tickFormatter={(v: number) => `${prefix}${v.toLocaleString()}`} />
          <Tooltip formatter={(v: number) => formatTooltipValue(v, prefix)} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {series.map((s) => (
            <Line key={s.dataKey} type="monotone" dataKey={s.dataKey} name={s.label} stroke={s.color} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      );
    }
    if (type === "bar") {
      return (
        <BarChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="label" {...commonAxisProps} />
          <YAxis {...commonAxisProps} tickFormatter={(v: number) => `${prefix}${v.toLocaleString()}`} />
          <Tooltip formatter={(v: number) => formatTooltipValue(v, prefix)} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {series.map((s) => (
            <Bar key={s.dataKey} dataKey={s.dataKey} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      );
    }
    // area (default)
    return (
      <AreaChart data={formatted}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.dataKey} id={`grad-${s.dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis dataKey="label" {...commonAxisProps} />
        <YAxis {...commonAxisProps} tickFormatter={(v: number) => `${prefix}${v.toLocaleString()}`} />
        <Tooltip formatter={(v: number) => formatTooltipValue(v, prefix)} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s) => (
          <Area key={s.dataKey} type="monotone" dataKey={s.dataKey} name={s.label} stroke={s.color} strokeWidth={2} fill={`url(#grad-${s.dataKey})`} dot={false} />
        ))}
      </AreaChart>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      {renderChart()}
    </ResponsiveContainer>
  );
}
