"use client";
// components/dashboard/cards/MetricCard.tsx

interface Props {
  label: string;
  value: string | number;
  trend?: number;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
  icon?: React.ReactNode;
}

export default function MetricCard({ label, value, trend, prefix = "", suffix = "", loading = false, icon }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
    );
  }

  const trendPositive = trend !== undefined && trend >= 0;
  const trendColor = trend === undefined ? "" : trendPositive ? "text-emerald-600" : "text-red-500";
  const trendBg = trend === undefined ? "" : trendPositive ? "bg-emerald-50" : "bg-red-50";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        {icon && <div className="text-gray-300">{icon}</div>}
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-2">
        {prefix}{typeof value === "number" ? value.toLocaleString() : value}{suffix}
      </p>
      {trend !== undefined && (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${trendColor} ${trendBg}`}>
          {trendPositive ? "▲" : "▼"} {Math.abs(trend)}%
          <span className="text-gray-400 font-normal ml-1">vs prev period</span>
        </span>
      )}
    </div>
  );
}
