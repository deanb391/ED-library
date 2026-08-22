// app/api/analytics/metrics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAcquisitionSummary, getContributorSummary, getRevenueSummary, getMetricSeries } from "@/lib/analytics/services/query.service";
import type { Timeframe, AnalyticsMetricName } from "@/lib/analytics/types/index";

const VALID_TIMEFRAMES: Timeframe[] = ["7d", "30d", "90d", "1y", "2y"];

function isValidTimeframe(t: string): t is Timeframe {
  return VALID_TIMEFRAMES.includes(t as Timeframe);
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dashboard = searchParams.get("dashboard");
  const timeframeParam = searchParams.get("timeframe") ?? "30d";
  const metric = searchParams.get("metric") as AnalyticsMetricName | null;

  if (!isValidTimeframe(timeframeParam)) {
    return NextResponse.json({ error: "Invalid timeframe" }, { status: 400 });
  }

  const timeframe: Timeframe = timeframeParam;

  try {
    if (dashboard === "acquisition") {
      const data = await getAcquisitionSummary(timeframe);
      return NextResponse.json({ data });
    }

    if (dashboard === "contributors") {
      const data = await getContributorSummary(timeframe);
      return NextResponse.json({ data });
    }

    if (dashboard === "revenue") {
      const data = await getRevenueSummary(timeframe);
      return NextResponse.json({ data });
    }

    if (metric) {
      const data = await getMetricSeries(metric, timeframe);
      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: "Missing dashboard or metric parameter" }, { status: 400 });
  } catch (err) {
    console.error("[Analytics API] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
