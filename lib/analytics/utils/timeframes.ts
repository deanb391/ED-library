// lib/analytics/utils/timeframes.ts
// Centralized, reusable timeframe utilities for all analytics charts.
import type { Timeframe, ChartDataPoint } from "../types/index";

export interface TimeframeOption {
  label: string;
  value: Timeframe;
  days: number;
}

export const TIMEFRAME_OPTIONS: TimeframeOption[] = [
  { label: "7 days", value: "7d", days: 7 },
  { label: "30 days", value: "30d", days: 30 },
  { label: "3 months", value: "90d", days: 90 },
  { label: "1 year", value: "1y", days: 365 },
  { label: "2 years", value: "2y", days: 730 },
];

/**
 * Get start and end date strings for a given timeframe.
 */
export function getDateRange(timeframe: Timeframe): { startDate: string; endDate: string } {
  const option = TIMEFRAME_OPTIONS.find((o) => o.value === timeframe);
  const days = option?.days ?? 30;

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);

  return {
    startDate: start.toISOString().substring(0, 10),
    endDate: end.toISOString().substring(0, 10),
  };
}

/**
 * Fill in gaps in a time series so that every date in a range has a data point.
 * Missing dates default to 0.
 */
export function fillDateSeries(
  data: ChartDataPoint[],
  startDate: string,
  endDate: string
): ChartDataPoint[] {
  const map = new Map<string, number>(data.map((d) => [d.date, d.value]));

  const result: ChartDataPoint[] = [];
  const cursor = new Date(startDate);
  const end = new Date(endDate);

  while (cursor <= end) {
    const dateStr = cursor.toISOString().substring(0, 10);
    result.push({ date: dateStr, value: map.get(dateStr) ?? 0, label: formatDateLabel(dateStr) });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

/**
 * Format a YYYY-MM-DD string into a readable label.
 */
export function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Aggregate a dense daily series into weekly or monthly bins for readability.
 * For 1y/2y views we aggregate monthly; for 90d weekly; otherwise daily.
 */
export function aggregateSeries(data: ChartDataPoint[], timeframe: Timeframe): ChartDataPoint[] {
  if (timeframe === "7d" || timeframe === "30d") return data;

  const bins = new Map<string, number>();

  for (const point of data) {
    const date = new Date(point.date + "T00:00:00");
    let key: string;

    if (timeframe === "90d") {
      // Weekly bins — key on Monday of that week
      const monday = getMondayOf(date);
      key = monday.toISOString().substring(0, 10);
    } else {
      // Monthly bins — key on the first of the month
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
    }

    bins.set(key, (bins.get(key) ?? 0) + point.value);
  }

  return Array.from(bins.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value, label: formatDateLabel(date) }));
}

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

/**
 * Calculate percent change between two values.
 */
export function calcTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}
