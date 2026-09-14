import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";

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

export function mapChatDoc(doc: any): Chat {
  if (!doc) return null as any;
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
    $id: doc.id || doc.$id,
    participants,
    lastMessage: doc.lastMessage || "",
    lastMessageSenderId: doc.lastMessageSenderId || "",
    lastMessageAt: doc.lastMessageAt instanceof Date ? doc.lastMessageAt.toISOString() : (doc.lastMessageAt || ""),
    unreadCounts,
    $createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.$createdAt || new Date().toISOString()),
    $updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : (doc.$updatedAt || new Date().toISOString()),
  };
}

export async function createChatService(contributorId: string): Promise<Chat> {
  const participants = [contributorId, "admin"].sort();

  try {
    const chats = await prisma.chat.findMany();
    const existing = chats.find((c) => {
      try {
        const p = Array.isArray(c.participants) ? c.participants : JSON.parse(c.participants || "[]");
        return p.includes(contributorId) && p.includes("admin");
      } catch {
        return false;
      }
    });

    if (existing) {
      return mapChatDoc(existing);
    }
  } catch (err) {
    console.error("Error checking existing chat:", err);
  }

  const unreadCounts: Record<string, number> = {
    [contributorId]: 0,
    "admin": 0
  };

  const id = randomUUID();
  const doc = await prisma.chat.create({
    data: {
      id,
      participants: participants,
      unreadCounts: JSON.stringify(unreadCounts),
      lastMessage: "",
      lastMessageSenderId: "",
      lastMessageAt: new Date(),
    },
  });

  return mapChatDoc(doc);
}

export async function getChatsForAdminService(): Promise<Chat[]> {
  try {
    const docs = await prisma.chat.findMany({
      orderBy: { lastMessageAt: 'desc' },
      take: 100,
    });
    return docs.map(mapChatDoc);
  } catch (error) {
    console.error("getChatsForAdminService error:", error);
    return [];
  }
}

export async function getChatForContributorService(contributorId: string): Promise<Chat | null> {
  try {
    const chats = await prisma.chat.findMany();
    const existing = chats.find((c) => {
      try {
        const p = Array.isArray(c.participants) ? c.participants : JSON.parse(c.participants || "[]");
        return p.includes(contributorId) && p.includes("admin");
      } catch {
        return false;
      }
    });

    if (existing) {
      return mapChatDoc(existing);
    }
    return null;
  } catch (error) {
    console.error("getChatForContributorService error:", error);
    return null;
  }
}

export async function getChatByIdService(chatId: string): Promise<Chat | null> {
  try {
    const doc = await prisma.chat.findUnique({
      where: { id: chatId },
    });
    if (!doc) return null;
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
  const doc = await prisma.chat.findUnique({ where: { id: chatId } });
  if (!doc) throw new Error("Chat not found");

  const chat = mapChatDoc(doc);

  const updatedUnreadCounts = { ...chat.unreadCounts };
  for (const p of chat.participants) {
    if (p !== senderId) {
      updatedUnreadCounts[p] = (updatedUnreadCounts[p] || 0) + 1;
    }
  }

  const now = new Date();
  const updated = await prisma.chat.update({
    where: { id: chatId },
    data: {
      lastMessage: text,
      lastMessageSenderId: senderId,
      lastMessageAt: now,
      unreadCounts: JSON.stringify(updatedUnreadCounts),
    },
  });

  return mapChatDoc(updated);
}

export async function clearChatUnreadCountService(
  chatId: string,
  userId: string
): Promise<Chat> {
  const doc = await prisma.chat.findUnique({ where: { id: chatId } });
  if (!doc) throw new Error("Chat not found");

  const chat = mapChatDoc(doc);

  const updatedUnreadCounts = { ...chat.unreadCounts };
  updatedUnreadCounts[userId] = 0;

  const updated = await prisma.chat.update({
    where: { id: chatId },
    data: {
      unreadCounts: JSON.stringify(updatedUnreadCounts),
    },
  });

  return mapChatDoc(updated);
}
