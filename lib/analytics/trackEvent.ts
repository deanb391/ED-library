// lib/analytics/trackEvent.ts
// Environment-aware analytics wrapper. Safe for both Client and Server components.

import type { AnalyticsEvent, EventPayload } from "./posthog-server";

/**
 * Universal trackEvent function.
 * - On Server: Calls the PostHog SDK directly (via dynamic import).
 * - On Client: Proxies the request through /api/analytics/track.
 */
export function trackEvent(event: AnalyticsEvent, payload: EventPayload): void {
  if (typeof window === "undefined") {
    // SERVER SIDE
    // We use a dynamic import here to ensure 'posthog-node' is NEVER 
    // pulled into the client-side bundle by mistake.
    import("./posthog-server")
      .then((m) => m.trackServerEvent(event, payload))
      .catch((err) => console.error("[Analytics] Server tracking failed:", err));
  } else {
    // CLIENT SIDE
    // Proxy through the internal API to avoid bundling Node libraries in the browser.
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, payload }),
    }).catch((err) => console.error("[Analytics] Client proxy tracking failed:", err));
  }
}
