"use client";
// components/dashboard/charts/BreakdownPieChart.tsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { PieDataPoint } from "@/lib/analytics/types/index";

const PALETTE = [
  "#3b82f6", "#8b5cf6", "#10b981", "#f97316", "#ec4899",
  "#06b6d4", "#facc15", "#f43f5e", "#a3e635", "#818cf8",
];

interface Props {
  data: PieDataPoint[];
  loading?: boolean;
  height?: number;
}

function LoadingSkeleton({ height }: { height: number }) {
  return (
    <div className="animate-pulse flex items-center justify-center" style={{ height }}>
      <div className="rounded-full bg-gray-200" style={{ width: height * 0.6, height: height * 0.6 }} />
    </div>
  );
}

function EmptyState({ height }: { height: number }) {
  return (
    <div className="flex flex-col items-center justify-center text-gray-400" style={{ height }}>
      <div className="text-3xl mb-2">🥧</div>
      <p className="text-sm">No data available</p>
    </div>
  );
}

export default function BreakdownPieChart({ data, loading = false, height = 240 }: Props) {
  if (loading) return <LoadingSkeleton height={height} />;
  if (!data.length || data.every((d) => d.value === 0)) return <EmptyState height={height} />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={height * 0.22}
          outerRadius={height * 0.38}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={entry.color ?? PALETTE[index % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => (typeof value === "number" ? value.toLocaleString() : String(value))}
          contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12 }}
          formatter={(value) => <span style={{ color: "#4b5563" }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
