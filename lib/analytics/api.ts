// lib/analytics/api.ts
// Frontend-facing analytics API wrappers.
import type {
  Timeframe,
  AcquisitionSummary,
  ContributorSummary,
  RevenueSummary,
  ChartDataPoint,
  AnalyticsMetricName,
} from "./types";

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
