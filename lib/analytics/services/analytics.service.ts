import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";

export type EventPayload = {
  eventName: string;
  distinctId: string;
  userId?: string;
  metadata?: Record<string, any>;
  value?: number;
};

/**
 * 1. Log Raw Event
 */
export async function logRawEvent(payload: EventPayload) {
  try {
    const id = randomUUID();
    await prisma.analyticsEvent.create({
      data: {
        id,
        eventName: payload.eventName,
        distinctId: payload.distinctId,
        userId: payload.userId || null,
        metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
        value: payload.value || 0,
      },
    });
  } catch (err) {
    console.error("[Analytics] Failed to log raw event:", err);
  }
}

/**
 * 2. Write-Time Aggregation (Upsert Daily Metric)
 */
export async function incrementDailyMetric(
  metric: string,
  amount: number = 1,
  category: string | null = null,
  dimension: string | null = null
) {
  const today = new Date().toISOString().substring(0, 10);
  
  try {
    const exactMatch = await prisma.analyticsDailyMetric.findFirst({
      where: {
        date: today,
        metric,
        category: category || null,
        dimension: dimension || null,
      },
    });

    if (exactMatch) {
      await prisma.analyticsDailyMetric.update({
        where: { id: exactMatch.id },
        data: {
          value: exactMatch.value + amount,
        },
      });
    } else {
      const id = randomUUID();
      await prisma.analyticsDailyMetric.create({
        data: {
          id,
          date: today,
          metric,
          value: amount,
          category: category || null,
          dimension: dimension || null,
        },
      });
    }
  } catch (err) {
    console.error("[Analytics] Failed to increment metric:", err);
  }
}

/**
 * 3. Unified Track Function
 */
export async function trackAnalyticsEvent(payload: EventPayload, metricIncrements: Array<{metric: string, amount?: number, category?: string, dimension?: string}> = []) {
  await Promise.all([
    logRawEvent(payload),
    ...metricIncrements.map(inc => incrementDailyMetric(inc.metric, inc.amount || 1, inc.category, inc.dimension))
  ]);
}

/**
 * 4. Fetch Time Series Data
 */
export async function fetchMetricSeries(metric: string, startDate: string, endDate: string) {
  try {
    const docs = await prisma.analyticsDailyMetric.findMany({
      where: {
        metric,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      take: 1000,
    });
    return docs;
  } catch (err) {
    console.error("[Analytics] Failed to fetch metric series:", err);
    return [];
  }
}

/**
 * 5. Fetch Aggregate Sums
 */
export async function fetchMetricAggregate(metric: string, startDate: string, endDate: string) {
  const series = await fetchMetricSeries(metric, startDate, endDate);
  return series.reduce((acc, curr) => acc + curr.value, 0);
}
