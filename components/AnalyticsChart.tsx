// components/AnalyticsChart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsChartProps {
  visitsPerDay: { mon: number; tue: number; wed: number; thu: number; fri: number; sat: number; sun: number };
}

export default function AnalyticsChart({ visitsPerDay }: AnalyticsChartProps) {
  const data = [
    { day: "Mon", visits: visitsPerDay.mon },
    { day: "Tue", visits: visitsPerDay.tue },
    { day: "Wed", visits: visitsPerDay.wed },
    { day: "Thu", visits: visitsPerDay.thu },
    { day: "Fri", visits: visitsPerDay.fri },
    { day: "Sat", visits: visitsPerDay.sat },
    { day: "Sun", visits: visitsPerDay.sun },
  ];
  return (
    <div className="w-full" style={{ height: 220, marginBottom: 20 }}>
        <div className="flex items-center justify-between mb-3" >
    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
      Visits per Day
    </h3>
    <span className="text-xs text-gray-500 dark:text-gray-400">
      Last 7 days
    </span>
  </div>
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
      <YAxis tick={{ fontSize: 12 }} />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="visits"
        stroke="#2563eb"
        strokeWidth={2}
        dot={{ r: 3 }}
      />
    </LineChart>
  </ResponsiveContainer>
</div>
  );
}