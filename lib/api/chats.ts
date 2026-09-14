// lib/api/chats.ts
// Client-safe helper for chatting features

export type Chat = {
  $id: string;
  id?: string;
  participants: string[];
  lastMessage?: string;
  lastMessageSenderId?: string;
  lastMessageAt?: string;
  unreadCounts: Record<string, number>;
  $createdAt: string;
  $updatedAt: string;
};

export type Message = {
  $id: string;
  id?: string;
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

export async function getChatsForAdmin(): Promise<Chat[]> {
  const res = await fetch("/api/chats");
  if (!res.ok) return [];
  const data = await res.json();
  return data.chats || [];
}

export async function getChatForContributor(contributorId: string): Promise<Chat | null> {
  const res = await fetch(`/api/chats?contributorId=${encodeURIComponent(contributorId)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.chat || null;
}

export async function getChatById(chatId: string): Promise<Chat | null> {
  const res = await fetch(`/api/chats?chatId=${encodeURIComponent(chatId)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.chat || null;
}

export async function createChat(contributorId: string): Promise<Chat> {
  const res = await fetch("/api/chats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contributorId }),
  });
  if (!res.ok) throw new Error("Failed to create chat");
  return res.json();
}

export async function clearChatUnreadCount(chatId: string, userId: string): Promise<Chat> {
  const res = await fetch("/api/chats/clear-unread", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, userId }),
  });
  if (!res.ok) throw new Error("Failed to clear unread");
  return res.json();
}

export async function createMessage(draft: MessageDraft): Promise<Message> {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function getMessagesByChat(
  chatId: string,
  limit = 50,
  cursor?: string
): Promise<{ messages: Message[]; nextCursor?: string; hasMore: boolean }> {
  let url = `/api/messages?chatId=${encodeURIComponent(chatId)}&limit=${limit}`;
  if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;
  const res = await fetch(url);
  if (!res.ok) return { messages: [], hasMore: false };
  return res.json();
}

export async function updateMessagesStatus(
  messageIds: string[],
  status: "delivered" | "seen"
): Promise<boolean> {
  const res = await fetch("/api/messages/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messageIds, status }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return Boolean(data.success);
}
