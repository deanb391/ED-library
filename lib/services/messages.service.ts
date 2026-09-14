import prisma from "@/lib/prisma";
import { updateChatLastMessageService, getChatForContributorService } from "./chats.service";
import { sendChatMessageDigestEmail } from "@/lib/email/events";
import { getLfuCache, setLfuCache } from "@/lib/lfu-cache";
import { randomUUID } from "crypto";

export type Message = {
  $id: string;
  chatId: string;
  senderId: string;
  text: string;
  status: "sent" | "delivered" | "seen";
  $createdAt: string;
  $updatedAt: string;
};

export type MessageDraft = {
  chatId: string;
  senderId: string;
  text: string;
  status?: "sent" | "delivered" | "seen";
};

export function mapMessageDoc(doc: any): Message {
  if (!doc) return null as any;
  return {
    $id: doc.id || doc.$id,
    chatId: doc.chatId || "",
    senderId: doc.senderId || "",
    text: doc.text || "",
    status: (doc.status as any) || "sent",
    $createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.$createdAt || new Date().toISOString()),
    $updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : (doc.$updatedAt || new Date().toISOString()),
  };
}

export async function createMessageService(draft: MessageDraft): Promise<Message> {
  const text = draft.text || "";
  const status = draft.status || "sent";

  const id = randomUUID();
  const doc = await prisma.message.create({
    data: {
      id,
      chatId: draft.chatId,
      senderId: draft.senderId,
      text,
      status,
    },
  });

  const message = mapMessageDoc(doc);

  // Update chat last message asynchronously
  updateChatLastMessageService(draft.chatId, text, draft.senderId)
    .then(async () => {
      try {
        const chatDoc = await prisma.chat.findUnique({ where: { id: draft.chatId } });
        if (!chatDoc) return;

        const participants = Array.isArray(chatDoc.participants)
          ? chatDoc.participants
          : JSON.parse(chatDoc.participants || "[]");

        const recipientId = participants.find((p: string) => p !== draft.senderId);
        if (!recipientId || recipientId === "admin") return;

        // If recipient is a contributor, check if they are offline
        const recipientDoc = await prisma.user.findUnique({ where: { id: recipientId } });
        if (!recipientDoc) return;

        const lastTime = recipientDoc.lastTime;
        const isOffline = !lastTime || (new Date().getTime() - new Date(lastTime).getTime() > 5 * 60 * 1000);

        if (isOffline && recipientDoc.email) {
          const cacheKey = `msg_email_throttle:${recipientId}`;
          const isThrottled = await getLfuCache<boolean>("chat:throttle", cacheKey);

          if (!isThrottled) {
            // Unread check
            const chat = await getChatForContributorService(recipientId);
            if (!chat) return;

            const chatUnread = chat.unreadCounts[recipientId] || 0;
            
            if (chatUnread === 1) {
              await setLfuCache("chat:throttle", cacheKey, true, 15 * 60);

              const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.ed-library.app";

              await sendChatMessageDigestEmail(
                recipientDoc.email, 
                {
                  recipientName: recipientDoc.name || "Contributor",
                  senders: ["Administrator"],
                  lastMessageSnippet: text,
                  chatLink: `${baseUrl}/contributor/dashboard`,
                }
              );
            }
          }
        }
      } catch (err) {
        console.error("Offline message email dispatcher error:", err);
      }
    })
    .catch((err) => {
      console.error("Failed to update chat last message:", err);
    });

  return message;
}

export async function getMessagesByChatService(
  chatId: string,
  limit = 50,
  cursor?: string
): Promise<{ messages: Message[]; nextCursor?: string; hasMore: boolean }> {
  try {
    const findOptions: any = {
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    };

    if (cursor) {
      findOptions.cursor = { id: cursor };
      findOptions.skip = 1;
    }

    const docs = await prisma.message.findMany(findOptions);
    const messages = docs.map(mapMessageDoc).reverse();
    const nextCursor =
      docs.length === limit
        ? docs[docs.length - 1].id
        : undefined;

    return {
      messages,
      nextCursor,
      hasMore: docs.length === limit,
    };
  } catch (error) {
    console.error("getMessagesByChatService error:", error);
    return { messages: [], hasMore: false };
  }
}

export async function updateMessagesStatusService(
  messageIds: string[],
  status: "delivered" | "seen",
): Promise<boolean> {
  try {
    await prisma.message.updateMany({
      where: { id: { in: messageIds } },
      data: { status },
    });
    return true;
  } catch (err) {
    console.error("Failed to update message statuses:", err);
    return false;
  }
}
