import { ID, Query } from "appwrite";
import { databases } from "@/lib/appwrite/server";

const DATABASE_ID = "69617e75000c6c010a75";
const EVENTS_COLLECTION = "analytics_events";
const METRICS_COLLECTION = "analytics_daily_metrics";

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
  const now = new Date().toISOString();
  try {
    await databases.createDocument(
      DATABASE_ID,
      EVENTS_COLLECTION,
      ID.unique(),
      {
        eventName: payload.eventName,
        distinctId: payload.distinctId,
        userId: payload.userId || null,
        metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
        value: payload.value || 0,
      }
    );
  } catch (err) {
    console.error("[Analytics] Failed to log raw event:", err);
  }
}

/**
 * 2. Write-Time Aggregation (Upsert Daily Metric)
 * Instead of waiting for a cron job, we aggregate the metric immediately.
 */
export async function incrementDailyMetric(
  metric: string,
  amount: number = 1,
  category: string | null = null,
  dimension: string | null = null
) {
  const today = new Date().toISOString().substring(0, 10);
  
  try {
    // Attempt to find the existing metric document for today
    const queries = [
      Query.equal("date", today),
      Query.equal("metric", metric),
    ];
    
    // We must query exactly to avoid incrementing the wrong document
    // If we have categories or dimensions, we must match them.
    // However, Appwrite Query.equal on null is tricky, so we usually store "none" or just omit the query if null.
    // To be safe and precise, we enforce matching.
    const res = await databases.listDocuments(DATABASE_ID, METRICS_COLLECTION, [
      ...queries,
      Query.limit(10) // fetch a few to find the exact match manually to avoid index issues with optional fields
    ]);

    const exactMatch = res.documents.find(
      (doc) => 
        (doc.category || null) === category && 
        (doc.dimension || null) === dimension
    );

    if (exactMatch) {
      // Update
      await databases.updateDocument(DATABASE_ID, METRICS_COLLECTION, exactMatch.$id, {
        value: exactMatch.value + amount
      });
    } else {
      // Create new
      await databases.createDocument(DATABASE_ID, METRICS_COLLECTION, ID.unique(), {
        date: today,
        metric,
        value: amount,
        category: category || null,
        dimension: dimension || null
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
  // Fire and forget
  Promise.all([
    logRawEvent(payload),
    ...metricIncrements.map(inc => incrementDailyMetric(inc.metric, inc.amount || 1, inc.category, inc.dimension))
  ]).catch(err => console.error("[Analytics] Error in tracking:", err));
}

/**
 * 4. Fetch Time Series Data
 */
export async function fetchMetricSeries(metric: string, startDate: string, endDate: string) {
  try {
    const res = await databases.listDocuments(DATABASE_ID, METRICS_COLLECTION, [
      Query.equal("metric", metric),
      Query.greaterThanEqual("date", startDate),
      Query.lessThanEqual("date", endDate),
      Query.limit(1000) // 1000 days is ~3 years
    ]);
    return res.documents;
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
