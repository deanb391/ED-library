import { NextRequest, NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/analytics/posthog-server";
import type { AnalyticsEvent, EventPayload } from "@/lib/analytics/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = body.event as AnalyticsEvent;
    const payload = body.payload as EventPayload;

    if (!event || !payload) {
      return NextResponse.json({ error: "Missing event or payload" }, { status: 400 });
    }

    // Call the server-side event tracker
    trackServerEvent(event, payload);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Analytics API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
