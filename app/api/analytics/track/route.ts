import { NextRequest, NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/analytics/posthog-server";

export async function POST(req: NextRequest) {
  try {
    const { event, payload } = await req.json();

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
