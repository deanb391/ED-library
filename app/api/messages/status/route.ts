import { NextRequest, NextResponse } from "next/server";
import { updateMessagesStatusService } from "@/lib/services/messages.service";

export async function POST(req: NextRequest) {
  try {
    const { messageIds, status } = await req.json();
    if (!Array.isArray(messageIds) || !status) {
      return NextResponse.json({ error: "messageIds array and status are required" }, { status: 400 });
    }

    const success = await updateMessagesStatusService(messageIds, status);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error("POST /api/messages/status error:", error);
    return NextResponse.json({ error: error.message || "Failed to update status" }, { status: 500 });
  }
}
