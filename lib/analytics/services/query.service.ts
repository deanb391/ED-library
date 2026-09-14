// lib/analytics/services/query.service.ts
// READ-side analytics service. Fetches and shapes data for the dashboard.
import prisma from "@/lib/prisma";
import { getLfuCache, setLfuCache } from "@/lib/lfu-cache";
import {
  getDateRange,
  fillDateSeries,
  aggregateSeries,
  calcTrend,
} from "../utils/timeframes";
import type {
  Timeframe,
  ChartDataPoint,
  PieDataPoint,
  AcquisitionSummary,
  ContributorSummary,
  RevenueSummary,
  AnalyticsMetricName,
} from "../types/index";

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function fetchMetricSeries(
  metric: AnalyticsMetricName,
  startDate: string,
  endDate: string,
  category?: string,
  dimension?: string
): Promise<ChartDataPoint[]> {
  try {
    const where: any = {
      metric,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (category !== undefined) where.category = category;
    if (dimension !== undefined) where.dimension = dimension;

    const docs = await prisma.analyticsDailyMetric.findMany({
      where,
      orderBy: { date: 'asc' },
      take: 800,
    });

    return docs.map((d) => ({ date: d.date, value: d.value }));
  } catch (err) {
    console.error(`[AnalyticsQuery] fetchMetricSeries failed for ${metric}:`, err);
    return [];
  }
}

async function fetchMetricSum(
  metric: AnalyticsMetricName,
  startDate: string,
  endDate: string
): Promise<number> {
  const series = await fetchMetricSeries(metric, startDate, endDate);
  return series.reduce((acc, cur) => acc + cur.value, 0);
}

/**
 * Fetch daily active user counts from the dedicated `daily_users` table.
 */
async function fetchDailyUsersSeries(
  startDate: string,
  endDate: string
): Promise<ChartDataPoint[]> {
  try {
    const docs = await prisma.dailyUser.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
      take: 800,
    });
    return docs.map((d) => ({
      date: d.date,
      value: d.count,
    }));
  } catch (err) {
    console.error("[AnalyticsQuery] fetchDailyUsersSeries failed:", err);
    return [];
  }
}

async function fetchWeeklyUsersSeries(
  startDate: string,
  endDate: string
): Promise<ChartDataPoint[]> {
  try {
    const docs = await prisma.weeklyUser.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
      take: 800,
    });
    return docs.map((d) => ({
      date: d.date || "",
      value: d.count || 0,
    }));
  } catch (err) {
    console.error("[AnalyticsQuery] fetchWeeklyUsersSeries failed:", err);
    return [];
  }
}

async function fetchMonthlyUsersSeries(
  startDate: string,
  endDate: string
): Promise<ChartDataPoint[]> {
  try {
    const docs = await prisma.monthlyUser.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
      take: 800,
    });
    return docs.map((d) => ({
      date: d.month || d.date || "",
      value: d.count || 0,
    }));
  } catch (err) {
    console.error("[AnalyticsQuery] fetchMonthlyUsersSeries failed:", err);
    return [];
  }
}

// ─── Acquisition ──────────────────────────────────────────────────────────────

export async function getAcquisitionSummary(timeframe: Timeframe): Promise<AcquisitionSummary> {
  const cacheKey = `acquisition:${timeframe}`;
  const cached = await getLfuCache<AcquisitionSummary>("analytics:summaries_v2", cacheKey);
  if (cached) return cached;

  const { startDate, endDate } = getDateRange(timeframe);

  const prevEnd = new Date(startDate);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  const days = (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000;
  prevStart.setDate(prevStart.getDate() - Math.ceil(days));

  const prevStartStr = prevStart.toISOString().substring(0, 10);
  const prevEndStr = prevEnd.toISOString().substring(0, 10);

  const [
    signupSeries,
    activeUserSeries,
    weeklyActiveUserSeries,
    monthlyActiveUserSeries,
    totalUsersData,
    prevSignups,
    prevActiveSeries,
    deptRaw,
  ] = await Promise.all([
    fetchMetricSeries("DAILY_SIGNUPS", startDate, endDate),
    fetchDailyUsersSeries(startDate, endDate),
    fetchWeeklyUsersSeries(startDate, endDate),
    fetchMonthlyUsersSeries(startDate, endDate),
    fetchMetricSeries("TOTAL_USERS", "2000-01-01", endDate),
    fetchMetricSum("DAILY_SIGNUPS", prevStartStr, prevEndStr),
    fetchDailyUsersSeries(prevStartStr, prevEndStr),
    prisma.analyticsDailyMetric.findMany({
      where: {
        metric: "DAILY_SIGNUPS_BY_DEPT",
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      take: 500,
    }).catch(() => []),
  ]);

  const prevActive = prevActiveSeries.reduce((a, b) => a + b.value, 0);

  const signupsThisPeriod = signupSeries.reduce((a, b) => a + b.value, 0);
  const activeUsersThisPeriod = activeUserSeries.reduce((a, b) => a + b.value, 0);
  const totalUsers = totalUsersData.reduce((a, b) => a + b.value, 0);

  const deptMap = new Map<string, number>();
  for (const doc of deptRaw) {
    const dim = doc.dimension || "Unknown";
    deptMap.set(dim, (deptMap.get(dim) ?? 0) + doc.value);
  }
  const signupsByDept: PieDataPoint[] = Array.from(deptMap.entries()).map(([name, value]) => ({ name, value }));

  const result = {
    totalUsers,
    signupsThisPeriod,
    activeUsersThisPeriod,
    signupSeries: aggregateSeries(fillDateSeries(signupSeries, startDate, endDate), timeframe),
    activeUserSeries: aggregateSeries(fillDateSeries(activeUserSeries, startDate, endDate), timeframe),
    weeklyActiveUserSeries: weeklyActiveUserSeries,
    monthlyActiveUserSeries: monthlyActiveUserSeries,
    signupsByDept,
  };

  await setLfuCache("analytics:summaries_v2", cacheKey, result, 50, 900);

  return result;
}

// ─── Contributors ─────────────────────────────────────────────────────────────

export async function getContributorSummary(timeframe: Timeframe): Promise<ContributorSummary> {
  const cacheKey = `contributors:${timeframe}`;
  const cached = await getLfuCache<ContributorSummary>("analytics:summaries_v2", cacheKey);
  if (cached) return cached;

  const { startDate, endDate } = getDateRange(timeframe);

  const [applicationSeries, courseCreatedSeries, uploadSeries, totalContributorsData, totalCoursesData, totalUploadsData] = await Promise.all([
    fetchMetricSeries("DAILY_CONTRIBUTOR_APPLICATIONS", startDate, endDate),
    fetchMetricSeries("DAILY_COURSES_CREATED", startDate, endDate),
    fetchMetricSeries("DAILY_UPLOADS", startDate, endDate),
    fetchMetricSeries("TOTAL_CONTRIBUTORS", "2000-01-01", endDate),
    fetchMetricSeries("TOTAL_COURSES", "2000-01-01", endDate),
    fetchMetricSeries("TOTAL_UPLOADS", "2000-01-01", endDate),
  ]);

  const result = {
    totalContributors: totalContributorsData.reduce((a, b) => a + b.value, 0),
    applicationsThisPeriod: applicationSeries.reduce((a, b) => a + b.value, 0),
    coursesCreatedThisPeriod: courseCreatedSeries.reduce((a, b) => a + b.value, 0),
    uploadsThisPeriod: uploadSeries.reduce((a, b) => a + b.value, 0),
    applicationSeries: aggregateSeries(fillDateSeries(applicationSeries, startDate, endDate), timeframe),
    courseCreatedSeries: aggregateSeries(fillDateSeries(courseCreatedSeries, startDate, endDate), timeframe),
    uploadSeries: aggregateSeries(fillDateSeries(uploadSeries, startDate, endDate), timeframe),
  };

  await setLfuCache("analytics:summaries_v2", cacheKey, result, 50, 900);

  return result;
}

// ─── Revenue ──────────────────────────────────────────────────────────────────

export async function getRevenueSummary(timeframe: Timeframe): Promise<RevenueSummary> {
  const cacheKey = `revenue:${timeframe}`;
  const cached = await getLfuCache<RevenueSummary>("analytics:summaries_v2", cacheKey);
  if (cached) return cached;

  const { startDate, endDate } = getDateRange(timeframe);

  const [
    revenueInSeries,
    revenueOutSeries,
    platformCutSeries,
    depositChargesSeries,
    withdrawalChargesSeries,
    flutterwaveSeries,
    walletTopupSeries,
    subscriptionSeries,
    withdrawalSeries,
  ] = await Promise.all([
    fetchMetricSeries("DAILY_REVENUE_IN", startDate, endDate),
    fetchMetricSeries("DAILY_REVENUE_OUT", startDate, endDate),
    fetchMetricSeries("DAILY_PLATFORM_CUT", startDate, endDate),
    fetchMetricSeries("DAILY_DEPOSIT_CHARGES", startDate, endDate),
    fetchMetricSeries("DAILY_WITHDRAWAL_CHARGES", startDate, endDate),
    fetchMetricSeries("DAILY_FLUTTERWAVE_CHARGES", startDate, endDate),
    fetchMetricSeries("DAILY_WALLET_TOPUP_AMOUNT", startDate, endDate),
    fetchMetricSeries("DAILY_SUBSCRIPTION_REVENUE", startDate, endDate),
    fetchMetricSeries("DAILY_WITHDRAWAL_AMOUNT", startDate, endDate),
  ]);

  const result = {
    totalIn: revenueInSeries.reduce((a, b) => a + b.value, 0),
    totalOut: revenueOutSeries.reduce((a, b) => a + b.value, 0),
    platformCut: platformCutSeries.reduce((a, b) => a + b.value, 0),
    depositCharges: depositChargesSeries.reduce((a, b) => a + b.value, 0),
    withdrawalCharges: withdrawalChargesSeries.reduce((a, b) => a + b.value, 0),
    flutterwaveCharges: flutterwaveSeries.reduce((a, b) => a + b.value, 0),
    revenueSeries: aggregateSeries(fillDateSeries(revenueInSeries, startDate, endDate), timeframe),
    payoutSeries: aggregateSeries(fillDateSeries(revenueOutSeries, startDate, endDate), timeframe),
    walletTopupSeries: aggregateSeries(fillDateSeries(walletTopupSeries, startDate, endDate), timeframe),
    withdrawalSeries: aggregateSeries(fillDateSeries(withdrawalSeries, startDate, endDate), timeframe),
    subscriptionSeries: aggregateSeries(fillDateSeries(subscriptionSeries, startDate, endDate), timeframe),
  };

  await setLfuCache("analytics:summaries_v2", cacheKey, result, 50, 900);

  return result;
}

// ─── Generic series endpoint ──────────────────────────────────────────────────

export async function getMetricSeries(metric: AnalyticsMetricName, timeframe: Timeframe) {
  const cacheKey = `series:${metric}:${timeframe}`;
  const cached = await getLfuCache<any>("analytics:series_v2", cacheKey);
  if (cached) return cached;

  const { startDate, endDate } = getDateRange(timeframe);
  const raw = await fetchMetricSeries(metric, startDate, endDate);
  const result = aggregateSeries(fillDateSeries(raw, startDate, endDate), timeframe);
  
  await setLfuCache("analytics:series_v2", cacheKey, result, 100, 900);
  return result;
}
