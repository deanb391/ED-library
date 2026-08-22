// lib/analytics/trackEvent.ts
// Environment-aware analytics wrapper. Safe for both Client and Server components.

import type { AnalyticsEvent, EventPayload } from "./types";

/**
 * Universal trackEvent function.
 * - On Server: Calls the PostHog SDK directly (via dynamic import).
 * - On Client: Proxies the request through /api/analytics/track.
 */
export function trackEvent(event: AnalyticsEvent, payload: EventPayload): void {
  if (typeof window === "undefined") {
    // SERVER SIDE
    // Dynamically importing the server logic ensures 'posthog-node' isn't 
    // part of the initial static import tree for client components.
    // Use a variable for the path to further confuse some static analyzers if needed,
    // but standard dynamic import is usually enough if 'posthog-server' doesn't 
    // use 'server-only' and types are separate.
    import("./posthog-server")
      .then((m) => m.trackServerEvent(event, payload))
      .catch((err) => console.error("[Analytics] Server tracking failed:", err));
  } else {
    // CLIENT SIDE
    // Always use the API proxy for client-side events to keep Node libraries out of the browser.
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, payload }),
    }).catch((err) => console.error("[Analytics] Client proxy tracking failed:", err));
  }
}
