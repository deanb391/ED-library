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

const data = [
  { day: "Mon", visits: 120 },
  { day: "Tue", visits: 150 },
  { day: "Wed", visits: 130 },
  { day: "Thu", visits: 170 },
  { day: "Fri", visits: 200 },
  { day: "Sat", visits: 180 },
  { day: "Sun", visits: 220 },
];

const analytics = {
    avg_rating: 4.5,
    avg_time: 12,
    reached: [
        "1", "2", "3", "4", "5"
    ],
    visits_per_day: {
        mon: 1,
        tue: 2,
        wed: 3,
        thu: 4,
        fri: 5,
        sat: 6,
        sun: 7
    }
}

export default function AnalyticsChart() {
  return (
    <div className="w-full" style={{ height: 220, marginBottom: 20 }}>
        <div className="flex items-center justify-between mb-3" >
    <h3 className="text-sm font-semibold text-gray-900">
      Visits per Day
    </h3>
    <span className="text-xs text-gray-500">
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