"use server";
import { ID, Query } from "node-appwrite";
import { databases } from "@/lib/appwrite/server";

const DATABASE_ID = "69617e75000c6c010a75";
const CHAT_COLLECTION = "chats";

export type Chat = {
  $id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageSenderId?: string;
  lastMessageAt?: string;
  unreadCounts: Record<string, number>;
  $createdAt: string;
  $updatedAt: string;
};

function mapChatDoc(doc: any): Chat {
  let participants: string[] = [];
  if (doc.participants) {
    if (typeof doc.participants === "string") {
      try { participants = JSON.parse(doc.participants); } catch { participants = [doc.participants]; }
    } else if (Array.isArray(doc.participants)) {
      participants = doc.participants;
    }
  }

  let unreadCounts: Record<string, number> = {};
  if (doc.unreadCounts) {
    try {
      unreadCounts = typeof doc.unreadCounts === "string" ? JSON.parse(doc.unreadCounts) : doc.unreadCounts;
    } catch { unreadCounts = {}; }
  }

  return {
    $id: doc.$id,
    participants,
    lastMessage: doc.lastMessage || "",
    lastMessageSenderId: doc.lastMessageSenderId || "",
    lastMessageAt: doc.lastMessageAt || "",
    unreadCounts,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
  };
}

export async function createChatService(contributorId: string): Promise<Chat> {
  const participants = [contributorId, "admin"].sort();

  try {
    const res = await databases.listDocuments(DATABASE_ID, CHAT_COLLECTION, [
      Query.contains("participants", contributorId),
      Query.contains("participants", "admin"),
      Query.limit(1)
    ]);

    if (res.documents.length > 0) {
      return mapChatDoc(res.documents[0]);
    }
  } catch (err) {
    console.error("Error checking existing chat:", err);
  }

  const unreadCounts: Record<string, number> = {
    [contributorId]: 0,
    "admin": 0
  };

  const payload = {
    participants,
    unreadCounts: JSON.stringify(unreadCounts),
    lastMessage: "",
    lastMessageSenderId: "",
    lastMessageAt: new Date().toISOString(),
  };

  const doc = await databases.createDocument(
    DATABASE_ID,
    CHAT_COLLECTION,
    ID.unique(),
    payload
  );

  return mapChatDoc(doc);
}

export async function getChatsForAdminService(): Promise<Chat[]> {
  try {
    const res = await databases.listDocuments(DATABASE_ID, CHAT_COLLECTION, [
      Query.contains("participants", "admin"),
      Query.orderDesc("lastMessageAt"),
      Query.limit(100),
    ]);
    return res.documents.map(mapChatDoc);
  } catch (error) {
    console.error("getChatsForAdminService error:", error);
    return [];
  }
}

export async function getChatForContributorService(contributorId: string): Promise<Chat | null> {
  try {
    const res = await databases.listDocuments(DATABASE_ID, CHAT_COLLECTION, [
      Query.contains("participants", contributorId),
      Query.contains("participants", "admin"),
      Query.limit(1),
    ]);
    if (res.documents.length > 0) {
      return mapChatDoc(res.documents[0]);
    }
    return null;
  } catch (error) {
    console.error("getChatForContributorService error:", error);
    return null;
  }
}

export async function getChatByIdService(chatId: string): Promise<Chat | null> {
  try {
    const doc = await databases.getDocument(DATABASE_ID, CHAT_COLLECTION, chatId);
    return mapChatDoc(doc);
  } catch (error) {
    console.error(`getChatByIdService error for ${chatId}:`, error);
    return null;
  }
}

export async function updateChatLastMessageService(
  chatId: string,
  text: string,
  senderId: string
): Promise<Chat> {
  const doc = await databases.getDocument(DATABASE_ID, CHAT_COLLECTION, chatId);
  const chat = mapChatDoc(doc);

  const updatedUnreadCounts = { ...chat.unreadCounts };
  for (const p of chat.participants) {
    if (p !== senderId) {
      updatedUnreadCounts[p] = (updatedUnreadCounts[p] || 0) + 1;
    }
  }

  const now = new Date().toISOString();
  const updated = await databases.updateDocument(DATABASE_ID, CHAT_COLLECTION, chatId, {
    lastMessage: text,
    lastMessageSenderId: senderId,
    lastMessageAt: now,
    unreadCounts: JSON.stringify(updatedUnreadCounts),
  });

  return mapChatDoc(updated);
}

export async function clearChatUnreadCountService(
  chatId: string,
  userId: string
): Promise<Chat> {
  const doc = await databases.getDocument(DATABASE_ID, CHAT_COLLECTION, chatId);
  const chat = mapChatDoc(doc);

  const updatedUnreadCounts = { ...chat.unreadCounts };
  updatedUnreadCounts[userId] = 0;

  const updated = await databases.updateDocument(DATABASE_ID, CHAT_COLLECTION, chatId, {
    unreadCounts: JSON.stringify(updatedUnreadCounts),
  });

  return mapChatDoc(updated);
}
