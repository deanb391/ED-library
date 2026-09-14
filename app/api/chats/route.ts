import { NextRequest, NextResponse } from "next/server";
import {
  getChatsForAdminService,
  getChatForContributorService,
  getChatByIdService,
  createChatService,
} from "@/lib/services/chats.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const contributorId = searchParams.get("contributorId");
    const chatId = searchParams.get("chatId");

    if (contributorId) {
      const chat = await getChatForContributorService(contributorId);
      return NextResponse.json({ chat });
    }

    if (chatId) {
      const chat = await getChatByIdService(chatId);
      return NextResponse.json({ chat });
    }

    const chats = await getChatsForAdminService();
    return NextResponse.json({ chats });
  } catch (error: any) {
    console.error("GET /api/chats error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch chats" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { contributorId } = await req.json();
    if (!contributorId) {
      return NextResponse.json({ error: "contributorId is required" }, { status: 400 });
    }

    const chat = await createChatService(contributorId);
    return NextResponse.json(chat, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/chats error:", error);
    return NextResponse.json({ error: error.message || "Failed to create chat" }, { status: 500 });
  }
}
