"use client";
// components/dashboard/analytics/TimeframeToggle.tsx
import type { Timeframe } from "@/lib/analytics/types/index";
import { TIMEFRAME_OPTIONS } from "@/lib/analytics/utils/timeframes";

interface Props {
  value: Timeframe;
  onChange: (tf: Timeframe) => void;
}

export default function TimeframeToggle({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
      {TIMEFRAME_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${value === opt.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
