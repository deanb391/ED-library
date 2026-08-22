// lib/analytics/posthog-server.ts
// SERVER-ONLY PostHog tracking logic.
import { PostHog } from "posthog-node";
import type { AnalyticsEvent, EventPayload } from "./types";

// ─── Lazy singleton client ────────────────────────────────────────────────────

let _client: PostHog | null = null;

function getClient(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key) {
    return null;
  }

  if (!_client) {
    _client = new PostHog(key, {
      host: host ?? "https://us.i.posthog.com",
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
export function trackServerEvent(event: AnalyticsEvent, payload: EventPayload): void {
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

      await client.flush();
    })
    .catch((err: unknown) => {
      console.error("[Analytics] Failed to track event:", event, err);
    });
}
