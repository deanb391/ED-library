// lib/analytics/types.ts

export type AnalyticsEvent =
  // Auth
  | "USER_SIGNED_UP"
  | "USER_SIGNED_IN"
  | "AUTH_FAILED"
  // Contributor lifecycle
  | "CONTRIBUTOR_APPLIED"
  | "CONTRIBUTOR_APPROVED"
  | "CONTRIBUTOR_REJECTED"
  | "CONTRIBUTOR_FOLLOWED"
  // Payments
  | "PAYMENT_INITIATED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "PAYMENT_REFUNDED"
  // Subscriptions
  | "SUBSCRIPTION_CREATED"
  | "SUBSCRIPTION_RENEWED"
  | "SUBSCRIPTION_EXPIRED"
  | "SUBSCRIPTION_ACCESS_DENIED"
  // Course access
  | "COURSE_VIEWED"
  | "COURSE_ACCESSED"
  | "COURSE_ACCESS_DENIED"
  // Wallet
  | "WALLET_CREATED"
  | "WALLET_DEPOSIT"
  | "WALLET_WITHDRAWAL_INITIATED"
  | "WALLET_WITHDRAWAL_SUCCESS"
  | "WALLET_WITHDRAWAL_FAILED"
  | "WALLET_WITHDRAWAL_REFUNDED"
  | "WALLET_INSUFFICIENT_BALANCE"
  // Emails
  | "EMAIL_SENT"
  | "EMAIL_FAILED"
  // System
  | "API_ERROR"
  | "SEARCH_PERFORMED";

export interface EventPayload {
  /** Required by PostHog — use userId when authenticated, a stable anonymous id otherwise */
  distinctId: string;
  /** Optional copy of userId for filtering in PostHog */
  userId?: string;
  /** Arbitrary event-specific metadata */
  metadata?: Record<string, string | number | boolean | null | undefined>;
}
