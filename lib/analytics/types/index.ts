// lib/analytics/types/index.ts
// Centralized type definitions for the analytics system

// ─── Metric Names ─────────────────────────────────────────────────────────────

export type AnalyticsMetricName =
  // Acquisition
  | "DAILY_SIGNUPS"
  | "DAILY_ACTIVE_USERS"
  | "DAILY_SIGNUPS_BY_DEPT"
  // Contributors
  | "DAILY_CONTRIBUTOR_APPLICATIONS"
  | "DAILY_COURSES_CREATED"
  | "DAILY_UPLOADS"
  | "TOTAL_CONTRIBUTORS"
  | "TOTAL_COURSES"
  | "TOTAL_UPLOADS"
  | "TOTAL_USERS"
  // Wallet & Payments
  | "DAILY_WALLET_TOPUPS"
  | "DAILY_WALLET_TOPUP_AMOUNT"
  | "DAILY_WALLET_TOPUPS_FAILED"
  | "DAILY_COURSE_SALES"
  | "DAILY_COURSE_REVENUE"
  // Revenue
  | "DAILY_REVENUE_IN"
  | "DAILY_REVENUE_OUT"
  | "DAILY_PLATFORM_CUT"
  | "DAILY_DEPOSIT_CHARGES"
  | "DAILY_PAYMENT_CHARGES"
  | "DAILY_WITHDRAWAL_CHARGES"
  | "DAILY_FLUTTERWAVE_CHARGES"
  // Subscriptions
  | "DAILY_SUBSCRIPTIONS"
  | "DAILY_SUBSCRIPTION_REVENUE"
  // Withdrawals
  | "DAILY_WITHDRAWALS"
  | "DAILY_WITHDRAWAL_AMOUNT"
  | "DAILY_WITHDRAWALS_FAILED";

// ─── Timeframe Options ────────────────────────────────────────────────────────

export type Timeframe = "7d" | "30d" | "90d" | "1y" | "2y";

// ─── Chart Data Point ─────────────────────────────────────────────────────────

export interface ChartDataPoint {
  date: string;     // "YYYY-MM-DD" or aggregated label
  value: number;
  label?: string;   // for display
}

// ─── Pie Chart Data Point ─────────────────────────────────────────────────────

export interface PieDataPoint {
  name: string;
  value: number;
  color?: string;
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

export interface MetricCardData {
  label: string;
  value: number | string;
  trend?: number;   // % change from previous period
  prefix?: string;  // e.g. "₦"
  suffix?: string;  // e.g. "%"
}

// ─── Analytics API Response ───────────────────────────────────────────────────

export interface AnalyticsSeriesResponse {
  metric: AnalyticsMetricName;
  timeframe: Timeframe;
  data: ChartDataPoint[];
  total: number;
}

// ─── Dashboard Summary ────────────────────────────────────────────────────────

export interface AcquisitionSummary {
  totalUsers: number;
  signupsThisPeriod: number;
  activeUsersThisPeriod: number;
  signupSeries: ChartDataPoint[];
  activeUserSeries: ChartDataPoint[];
  weeklyActiveUserSeries: ChartDataPoint[];
  monthlyActiveUserSeries: ChartDataPoint[];
  signupsByDept: PieDataPoint[];
}

export interface ContributorSummary {
  totalContributors: number;
  applicationsThisPeriod: number;
  coursesCreatedThisPeriod: number;
  uploadsThisPeriod: number;
  applicationSeries: ChartDataPoint[];
  courseCreatedSeries: ChartDataPoint[];
  uploadSeries: ChartDataPoint[];
}

export interface RevenueSummary {
  totalIn: number;
  totalOut: number;
  platformCut: number;
  depositCharges: number;
  withdrawalCharges: number;
  flutterwaveCharges: number;
  revenueSeries: ChartDataPoint[];
  payoutSeries: ChartDataPoint[];
  walletTopupSeries: ChartDataPoint[];
  withdrawalSeries: ChartDataPoint[];
  subscriptionSeries: ChartDataPoint[];
}
