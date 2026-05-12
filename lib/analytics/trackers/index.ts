import { trackAnalyticsEvent } from "../services/analytics.service";
import { trackEvent as posthogTrackEvent } from "../trackEvent";

/**
 * Standardized Analytics Trackers
 * These functions abstract event names and ensure proper aggregation metrics are recorded.
 */

// 1. ACQUISITION
export function trackUserSignup(userId: string, metadata: any = {}) {
  // Posthog legacy
  posthogTrackEvent("USER_SIGNED_UP", { distinctId: userId, userId, metadata });

  trackAnalyticsEvent(
    {
      eventName: "USER_SIGNED_UP",
      distinctId: userId,
      userId,
      metadata,
    },
    [
      { metric: "DAILY_SIGNUPS" },
      { metric: "TOTAL_USERS" },
      // Optional dimension tracking
      ...(metadata.department ? [{ metric: "DAILY_SIGNUPS_BY_DEPT", dimension: metadata.department }] : [])
    ]
  );
}

export function trackUserSignin(userId: string, metadata: any = {}) {
  posthogTrackEvent("USER_SIGNED_IN", { distinctId: userId, userId, metadata });

  trackAnalyticsEvent(
    {
      eventName: "USER_SIGNED_IN",
      distinctId: userId,
      userId,
      metadata,
    },
    [
      { metric: "DAILY_ACTIVE_USERS" }
    ]
  );
}

// 2. CONTRIBUTORS
export function trackContributorApplication(userId: string, metadata: any = {}) {
  posthogTrackEvent("CONTRIBUTOR_APPLIED", { distinctId: userId, userId, metadata });

  trackAnalyticsEvent(
    {
      eventName: "CONTRIBUTOR_APPLIED",
      distinctId: userId,
      userId,
      metadata,
    },
    [
      { metric: "DAILY_CONTRIBUTOR_APPLICATIONS" },
      { metric: "TOTAL_CONTRIBUTORS" }
    ]
  );
}

export function trackCourseCreated(userId: string, courseId: string, metadata: any = {}) {
  trackAnalyticsEvent(
    {
      eventName: "COURSE_CREATED",
      distinctId: userId,
      userId,
      metadata: { ...metadata, courseId },
    },
    [
      { metric: "DAILY_COURSES_CREATED" },
      { metric: "TOTAL_COURSES" },
      ...(metadata.department ? [{ metric: "DAILY_COURSES_BY_DEPT", dimension: metadata.department }] : [])
    ]
  );
}

export function trackCourseUpload(userId: string, courseId: string, metadata: any = {}) {
  trackAnalyticsEvent(
    {
      eventName: "COURSE_ASSET_UPLOADED",
      distinctId: userId,
      userId,
      metadata: { ...metadata, courseId },
    },
    [
      { metric: "DAILY_UPLOADS" },
      { metric: "TOTAL_UPLOADS" }
    ]
  );
}

// 3. REVENUE & PAYMENTS
export function trackWalletTopupInitiated(userId: string, amount: number, metadata: any = {}) {
  trackAnalyticsEvent(
    {
      eventName: "WALLET_TOPUP_INITIATED",
      distinctId: userId,
      userId,
      value: amount,
      metadata,
    },
    []
  );
}

export function trackWalletTopupSuccessful(userId: string, amount: number, metadata: any = {}) {
  trackAnalyticsEvent(
    {
      eventName: "WALLET_TOPUP_SUCCESSFUL",
      distinctId: userId,
      userId,
      value: amount,
      metadata,
    },
    [
      { metric: "DAILY_WALLET_TOPUPS" },
      { metric: "DAILY_WALLET_TOPUP_AMOUNT", amount }
    ]
  );
}

export function trackWalletTopupFailed(userId: string, amount: number, metadata: any = {}) {
  trackAnalyticsEvent(
    {
      eventName: "WALLET_TOPUP_FAILED",
      distinctId: userId,
      userId,
      value: amount,
      metadata,
    },
    [
      { metric: "DAILY_WALLET_TOPUPS_FAILED" }
    ]
  );
}

export function trackWithdrawalInitiated(userId: string, amount: number, metadata: any = {}) {
  trackAnalyticsEvent(
    {
      eventName: "WITHDRAWAL_INITIATED",
      distinctId: userId,
      userId,
      value: amount,
      metadata,
    },
    []
  );
}

export function trackWithdrawalSuccessful(userId: string, amount: number, metadata: any = {}) {
  trackAnalyticsEvent(
    {
      eventName: "WITHDRAWAL_SUCCESSFUL",
      distinctId: userId,
      userId,
      value: amount,
      metadata,
    },
    [
      { metric: "DAILY_WITHDRAWALS" },
      { metric: "DAILY_WITHDRAWAL_AMOUNT", amount }
    ]
  );
}

export function trackWithdrawalFailed(userId: string, amount: number, metadata: any = {}) {
  trackAnalyticsEvent(
    {
      eventName: "WITHDRAWAL_FAILED",
      distinctId: userId,
      userId,
      value: amount,
      metadata,
    },
    [
      { metric: "DAILY_WITHDRAWALS_FAILED" }
    ]
  );
}

export function trackSubscriptionCreated(userId: string, amount: number, metadata: any = {}) {
  trackAnalyticsEvent(
    {
      eventName: "SUBSCRIPTION_CREATED",
      distinctId: userId,
      userId,
      value: amount,
      metadata,
    },
    [
      { metric: "DAILY_SUBSCRIPTIONS" },
      { metric: "DAILY_SUBSCRIPTION_REVENUE", amount }
    ]
  );
}

export function trackCoursePayment(userId: string, amount: number, metadata: any = {}) {
  trackAnalyticsEvent(
    {
      eventName: "COURSE_PURCHASED",
      distinctId: userId,
      userId,
      value: amount,
      metadata,
    },
    [
      { metric: "DAILY_COURSE_SALES" },
      { metric: "DAILY_COURSE_REVENUE", amount }
    ]
  );
}
