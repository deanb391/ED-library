"use server";
import { ID, Query } from "node-appwrite";
import { databases } from "@/lib/appwrite/server";
import { updateChatLastMessageService, getChatsForAdminService, getChatForContributorService } from "./chats.service";
import { sendChatMessageDigestEmail } from "@/lib/email/events";

const DATABASE_ID = "69617e75000c6c010a75";
const MESSAGE_COLLECTION = "messages";
const USER_COLLECTION = "user";

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

function mapMessageDoc(doc: any): Message {
  return {
    $id: doc.$id,
    chatId: doc.chatId || "",
    senderId: doc.senderId || "",
    text: doc.text || "",
    status: doc.status || "sent",
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
  };
}

export async function createMessageService(draft: MessageDraft): Promise<Message> {
  const now = new Date().toISOString();
  const text = draft.text || "";
  const status = draft.status || "sent";

  const payload = {
    chatId: draft.chatId,
    senderId: draft.senderId,
    text,
    status,
    $createdAt: now,
    $updatedAt: now,
  };

  const doc = await databases.createDocument(
    DATABASE_ID,
    MESSAGE_COLLECTION,
    ID.unique(),
    payload
  );

  const message = mapMessageDoc(doc);

  // Update chat last message asynchronously
  updateChatLastMessageService(draft.chatId, text, draft.senderId)
    .then(async () => {
      try {
        const chatDoc = await databases.getDocument(DATABASE_ID, "chats", draft.chatId);
        const participants = Array.isArray(chatDoc.participants)
          ? chatDoc.participants
          : JSON.parse(chatDoc.participants || "[]");

        const recipientId = participants.find((p: string) => p !== draft.senderId);
        if (!recipientId || recipientId === "admin") return;

        // If recipient is a contributor, check if they are offline
        const recipientDoc = await databases.getDocument(DATABASE_ID, USER_COLLECTION, recipientId);
        const lastTime = recipientDoc.lastTime;
        const isOffline = !lastTime || (new Date().getTime() - new Date(lastTime).getTime() > 5 * 60 * 1000);

        if (isOffline && recipientDoc.email) {
          const lastEmailAt = recipientDoc.lastMessageEmailAt;
          const nowMs = new Date().getTime();
          // Rate limit emails to 15 mins
          const isThrottled = lastEmailAt && (nowMs - new Date(lastEmailAt).getTime() < 15 * 60 * 1000); 

          if (!isThrottled) {
            // Unread check
            const chat = await getChatForContributorService(recipientId);
            if (!chat) return;

            const chatUnread = chat.unreadCounts[recipientId] || 0;
            
            if (chatUnread === 1) {
              await databases.updateDocument(DATABASE_ID, USER_COLLECTION, recipientId, {
                lastMessageEmailAt: new Date().toISOString(),
              });

              const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.ed-library.app";

              await sendChatMessageDigestEmail(
                recipientDoc.email, 
                {
                  recipientName: recipientDoc.username || "Contributor",
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
    const queries = [
      Query.equal("chatId", chatId),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ];

    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    const res = await databases.listDocuments(DATABASE_ID, MESSAGE_COLLECTION, queries);
    
    const messages = res.documents.map(mapMessageDoc).reverse();
    const nextCursor =
      res.documents.length === limit
        ? res.documents[res.documents.length - 1].$id
        : undefined;

    return {
      messages,
      nextCursor,
      hasMore: res.documents.length === limit,
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
    await Promise.all(
      messageIds.map((id) =>
        databases.updateDocument(DATABASE_ID, MESSAGE_COLLECTION, id, {
          status,
        })
      )
    );
    return true;
  } catch (err) {
    console.error("Failed to update message statuses:", err);
    return false;
  }
}
