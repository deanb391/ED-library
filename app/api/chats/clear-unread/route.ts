import { NextRequest, NextResponse } from "next/server";
import { clearChatUnreadCountService } from "@/lib/services/chats.service";

export async function POST(req: NextRequest) {
  try {
    const { chatId, userId } = await req.json();
    if (!chatId || !userId) {
      return NextResponse.json({ error: "chatId and userId are required" }, { status: 400 });
    }

    const updated = await clearChatUnreadCountService(chatId, userId);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("POST /api/chats/clear-unread error:", error);
    return NextResponse.json({ error: error.message || "Failed to clear unread" }, { status: 500 });
  }
}
