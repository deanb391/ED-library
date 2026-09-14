import { NextRequest, NextResponse } from "next/server";
import {
  getMessagesByChatService,
  createMessageService,
} from "@/lib/services/messages.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const chatId = searchParams.get("chatId");
    const limit = Number(searchParams.get("limit") || 50);
    const cursor = searchParams.get("cursor") || undefined;

    if (!chatId) {
      return NextResponse.json({ error: "chatId is required" }, { status: 400 });
    }

    const result = await getMessagesByChatService(chatId, limit, cursor);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.chatId || !body.senderId || !body.text) {
      return NextResponse.json({ error: "chatId, senderId, and text are required" }, { status: 400 });
    }

    const message = await createMessageService({
      chatId: body.chatId,
      senderId: body.senderId,
      text: body.text,
      status: body.status,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json({ error: error.message || "Failed to create message" }, { status: 500 });
  }
}
