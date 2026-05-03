import posthog from "posthog-js";

export function register() {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: "history-change",
    capture_pageleave: true,
  });
}
