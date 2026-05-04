// lib/analytics/trackEvent.ts
// Server-side PostHog event tracking — fire-and-forget, never crashes callers.

import { PostHog } from "posthog-node";

// ─── Event name union ────────────────────────────────────────────────────────

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
  | "API_ERROR";

// ─── Payload type ─────────────────────────────────────────────────────────────

export interface EventPayload {
  /** Required by PostHog — use userId when authenticated, a stable anonymous id otherwise */
  distinctId: string;
  /** Optional copy of userId for filtering in PostHog */
  userId?: string;
  /** Arbitrary event-specific metadata */
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

// ─── Lazy singleton client ────────────────────────────────────────────────────

let _client: PostHog | null = null;

function getClient(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key) {
    // Key not set — silently skip tracking (e.g. local dev without env var)
    return null;
  }

  if (!_client) {
    _client = new PostHog(key, {
      host: host ?? "https://us.i.posthog.com",
      // Disable automatic flushing — we flush manually so the serverless
      // function doesn't close before events are delivered.
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return _client;
}

// ─── Public tracking function ─────────────────────────────────────────────────

/**
 * Track a server-side event in PostHog.
 * Fire-and-forget: never throws, never blocks the caller.
 */
export function trackEvent(event: AnalyticsEvent, payload: EventPayload): void {
  // Run fully async — caller is never awaited, never blocked, never crashed.
  Promise.resolve()
    .then(async () => {
      const client = getClient();
      if (!client) return;

      client.capture({
        distinctId: payload.distinctId,
        event,
        properties: {
          ...(payload.userId ? { userId: payload.userId } : {}),
          ...(payload.metadata ?? {}),
          $lib: "posthog-node",
          platform: "server",
        },
      });

      // Flush immediately so serverless functions don't drop the event
      await client.flush();
    })
    .catch((err: unknown) => {
      // Log internally but never propagate
      console.error("[Analytics] Failed to track event:", event, err);
    });
}
