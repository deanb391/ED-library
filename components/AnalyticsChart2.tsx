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
  visitsPerDay: {
    mon: number;
    tue: number;
    wed: number;
    thu: number;
    fri: number;
    sat: number;
    sun: number;
  };
}

export default function AnalyticsChart({ visitsPerDay }: AnalyticsChartProps) {
  const data = [
    { day: "Mon", value: visitsPerDay.mon },
    { day: "Tue", value: visitsPerDay.tue },
    { day: "Wed", value: visitsPerDay.wed },
    { day: "Thu", value: visitsPerDay.thu },
    { day: "Fri", value: visitsPerDay.fri },
    { day: "Sat", value: visitsPerDay.sat },
    { day: "Sun", value: visitsPerDay.sun },
  ];

  return (
    <div className="w-full h-48 md:h-56" style={{ height: 220,  }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}