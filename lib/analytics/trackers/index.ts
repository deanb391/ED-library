import { postTrackEvent } from "../api";
import { trackEvent as posthogTrackEvent } from "../trackEvent";

/**
 * Standardized Analytics Trackers
 * These functions are safe to call from the browser.
 * All Appwrite writes go through /api/analytics/track (server-side) so the admin key is used.
 */

// 1. ACQUISITION
export function trackUserSignup(userId: string, metadata: any = {}) {
  posthogTrackEvent("USER_SIGNED_UP", { distinctId: userId, userId, metadata });

  postTrackEvent(
    "USER_SIGNED_UP",
    { distinctId: userId, userId, metadata },
    [
      { metric: "DAILY_SIGNUPS" },
      { metric: "TOTAL_USERS" },
      ...(metadata.department ? [{ metric: "DAILY_SIGNUPS_BY_DEPT", dimension: metadata.department }] : [])
    ]
  );
}

export function trackUserSignin(userId: string, metadata: any = {}) {
  posthogTrackEvent("USER_SIGNED_IN", { distinctId: userId, userId, metadata });

  postTrackEvent(
    "USER_SIGNED_IN",
    { distinctId: userId, userId, metadata },
    [
      { metric: "DAILY_ACTIVE_USERS" }
    ]
  );
}

// 2. CONTRIBUTORS
export function trackContributorApplication(userId: string, metadata: any = {}) {
  posthogTrackEvent("CONTRIBUTOR_APPLIED", { distinctId: userId, userId, metadata });

  postTrackEvent(
    "CONTRIBUTOR_APPLIED",
    { distinctId: userId, userId, metadata },
    [
      { metric: "DAILY_CONTRIBUTOR_APPLICATIONS" },
      { metric: "TOTAL_CONTRIBUTORS" }
    ]
  );
}

export function trackCourseCreated(userId: string, courseId: string, metadata: any = {}) {
  postTrackEvent(
    "COURSE_ACCESSED",
    { distinctId: userId, userId, metadata: { ...metadata, courseId } },
    [
      { metric: "DAILY_COURSES_CREATED" },
      { metric: "TOTAL_COURSES" },
      ...(metadata.department ? [{ metric: "DAILY_COURSES_BY_DEPT", dimension: metadata.department }] : [])
    ]
  );
}

export function trackCourseUpload(userId: string, courseId: string, metadata: any = {}) {
  postTrackEvent(
    "COURSE_ACCESSED",
    { distinctId: userId, userId, metadata: { ...metadata, courseId } },
    [
      { metric: "DAILY_UPLOADS" },
      { metric: "TOTAL_UPLOADS" }
    ]
  );
}

// 3. REVENUE & PAYMENTS
export function trackWalletTopupInitiated(userId: string, amount: number, metadata: any = {}) {
  postTrackEvent(
    "WALLET_DEPOSIT",
    { distinctId: userId, userId, metadata },
    []
  );
}

export function trackWalletTopupSuccessful(userId: string, amount: number, metadata: any = {}) {
  postTrackEvent(
    "WALLET_DEPOSIT",
    { distinctId: userId, userId, metadata },
    [
      { metric: "DAILY_WALLET_TOPUPS" },
      { metric: "DAILY_WALLET_TOPUP_AMOUNT", amount }
    ]
  );
}

export function trackWalletTopupFailed(userId: string, amount: number, metadata: any = {}) {
  postTrackEvent(
    "PAYMENT_FAILED",
    { distinctId: userId, userId, metadata },
    [
      { metric: "DAILY_WALLET_TOPUPS_FAILED" }
    ]
  );
}

export function trackWithdrawalInitiated(userId: string, amount: number, metadata: any = {}) {
  postTrackEvent(
    "WALLET_WITHDRAWAL_INITIATED",
    { distinctId: userId, userId, metadata },
    []
  );
}

export function trackWithdrawalSuccessful(userId: string, amount: number, metadata: any = {}) {
  postTrackEvent(
    "WALLET_WITHDRAWAL_SUCCESS",
    { distinctId: userId, userId, metadata },
    [
      { metric: "DAILY_WITHDRAWALS" },
      { metric: "DAILY_WITHDRAWAL_AMOUNT", amount }
    ]
  );
}

export function trackWithdrawalFailed(userId: string, amount: number, metadata: any = {}) {
  postTrackEvent(
    "WALLET_WITHDRAWAL_FAILED",
    { distinctId: userId, userId, metadata },
    [
      { metric: "DAILY_WITHDRAWALS_FAILED" }
    ]
  );
}

export function trackSubscriptionCreated(userId: string, amount: number, metadata: any = {}) {
  postTrackEvent(
    "SUBSCRIPTION_CREATED",
    { distinctId: userId, userId, metadata },
    [
      { metric: "DAILY_SUBSCRIPTIONS" },
      { metric: "DAILY_SUBSCRIPTION_REVENUE", amount }
    ]
  );
}

export function trackCoursePayment(userId: string, amount: number, metadata: any = {}) {
  postTrackEvent(
    "PAYMENT_SUCCESS",
    { distinctId: userId, userId, metadata },
    [
      { metric: "DAILY_COURSE_SALES" },
      { metric: "DAILY_COURSE_REVENUE", amount }
    ]
  );
}
