import { NextRequest, NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/analytics/posthog-server";
import type { AnalyticsEvent, EventPayload } from "@/lib/analytics/types";
import {
  trackAnalyticsEvent,
  type EventPayload as AppwriteEventPayload,
} from "@/lib/analytics/services/analytics.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = body.event as AnalyticsEvent;
    const payload = body.payload as EventPayload;
    const metricIncrements: Array<{
      metric: string;
      amount?: number;
      category?: string;
      dimension?: string;
    }> = body.metricIncrements ?? [];

    if (!event || !payload) {
      return NextResponse.json({ error: "Missing event or payload" }, { status: 400 });
    }

    // 1. Fire PostHog (server-side)
    trackServerEvent(event, payload);

    // 2. Write raw event + metric aggregates to Appwrite using the server admin SDK
    const appwritePayload: AppwriteEventPayload = {
      eventName: event,
      distinctId: payload.distinctId,
      userId: payload.userId,
      metadata: payload.metadata as Record<string, any> | undefined,
    };

    await trackAnalyticsEvent(appwritePayload, metricIncrements);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Analytics API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
