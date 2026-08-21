// lib/analytics/api.ts
// Frontend-facing analytics API wrappers.

import type { AnalyticsEvent, EventPayload } from "./types";

export interface MetricIncrement {
  metric: string;
  amount?: number;
  category?: string;
  dimension?: string;
}

/**
 * Client-safe tracker: fires a POST to /api/analytics/track so that
 * the actual Appwrite writes happen server-side with the admin API key.
 * Never throws — analytics must not break the calling feature.
 */
export async function postTrackEvent(
  event: AnalyticsEvent,
  payload: EventPayload,
  metricIncrements: MetricIncrement[] = []
): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const url = typeof window !== "undefined" ? "/api/analytics/track" : `${baseUrl}/api/analytics/track`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, payload, metricIncrements }),
    });
  } catch (err) {
    console.error("[Analytics] postTrackEvent failed:", err);
  }
}
import type {
  Timeframe,
  AcquisitionSummary,
  ContributorSummary,
  RevenueSummary,
  ChartDataPoint,
  AnalyticsMetricName,
} from "./types/index";

const BASE = "/api/analytics/metrics";

async function fetchAnalytics<T>(params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}?${qs}`, { cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Analytics API error");
  }
  const json = await res.json() as { data: T };
  return json.data;
}

export const analyticsApi = {
  getAcquisitionSummary(timeframe: Timeframe): Promise<AcquisitionSummary> {
    return fetchAnalytics<AcquisitionSummary>({ dashboard: "acquisition", timeframe });
  },

  getContributorSummary(timeframe: Timeframe): Promise<ContributorSummary> {
    return fetchAnalytics<ContributorSummary>({ dashboard: "contributors", timeframe });
  },

  getRevenueSummary(timeframe: Timeframe): Promise<RevenueSummary> {
    return fetchAnalytics<RevenueSummary>({ dashboard: "revenue", timeframe });
  },

  getMetricSeries(metric: AnalyticsMetricName, timeframe: Timeframe): Promise<ChartDataPoint[]> {
    return fetchAnalytics<ChartDataPoint[]>({ metric, timeframe });
  },
};
