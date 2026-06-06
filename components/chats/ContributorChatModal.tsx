"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, Clock, Check, CheckCheck } from "lucide-react";
import { useUser } from "@/context/UserContext";
import type { Chat } from "@/lib/services/chats.service";
import type { Message } from "@/lib/services/messages.service";
import { getChatForContributorService, createChatService, clearChatUnreadCountService } from "@/lib/services/chats.service";
import { createMessageService, getMessagesByChatService } from "@/lib/services/messages.service";
import { client } from "@/lib/appwrite";

const DATABASE_ID = "69617e75000c6c010a75";
const MESSAGE_COLLECTION = "messages";

interface Props {
  onClose: () => void;
}

export default function ContributorChatModal({ onClose }: Props) {
  const { user } = useUser();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialUnreadCount, setInitialUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const initChat = async () => {
      setLoading(true);
      try {
        let currentChat = await getChatForContributorService(user.$id);
        if (currentChat) {
          setChat(currentChat);

          const currentUnread = currentChat.unreadCounts[user.$id] || 0;
          setInitialUnreadCount(currentUnread);

          const res = await getMessagesByChatService(currentChat.$id, 15);
          setMessages(res.messages);
          setNextCursor(res.nextCursor);
          setHasMore(res.hasMore);

          if (currentUnread > 0) {
            await clearChatUnreadCountService(currentChat.$id, user.$id);
            const unseenMsgIds = res.messages
              .filter((m) => m.senderId !== user.$id && m.status !== "seen")
              .map((m) => m.$id);
            if (unseenMsgIds.length > 0) {
              import("@/lib/services/messages.service").then((mod) => {
                mod.updateMessagesStatusService(unseenMsgIds, "seen").catch(() => null);
              });
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setTimeout(() => messagesEndRef.current?.scrollIntoView(), 100);
      }
    };

    initChat();
  }, [user]);

  useEffect(() => {
    if (!chat || !user) return;

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${MESSAGE_COLLECTION}.documents`,
      (response) => {
        if (
          response.events.includes("databases.*.collections.*.documents.*.create")
        ) {
          const newMsg = response.payload as any as Message;
          if (newMsg.chatId === chat.$id) {
            setMessages((prev) => {
              if (prev.some(m => m.$id === newMsg.$id)) return prev;

              const tempIndex = prev.findIndex(
                (m) =>
                  m.$id.startsWith("temp-") &&
                  m.senderId === newMsg.senderId &&
                  m.text === newMsg.text
              );

              if (tempIndex !== -1) {
                const next = [...prev];
                next[tempIndex] = newMsg;
                return next.sort((a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime());
              }

              return [...prev, newMsg].sort((a, b) =>
                new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime()
              );
            });
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

            // Auto clear unread
            clearChatUnreadCountService(chat.$id, user.$id).catch(console.error);
          }
        }
      }
    );

    return () => unsubscribe();
  }, [chat, user]);


  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;

    const currentText = text;
    setText("");

    try {
      let activeChat = chat;
      // If chat doesn't exist yet, create it on first message
      if (!activeChat) {
        activeChat = await createChatService(user.$id);
        setChat(activeChat);
      }

      const tempId = `temp-${Date.now()}`;
      const tempMsg: Message = {
        $id: tempId,
        chatId: activeChat.$id,
        senderId: user.$id,
        text: currentText,
        status: "pending" as any,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempMsg]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

      await createMessageService({
        chatId: activeChat.$id,
        senderId: user.$id,
        text: currentText,
      });
      // The appwrite subscription will handle replacing the temp message
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const loadMoreMessages = async () => {
    if (!chat || loadingMore || !hasMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await getMessagesByChatService(chat.$id, 15, nextCursor);

      const scrollContainer = messagesEndRef.current?.parentElement;
      const previousScrollHeight = scrollContainer?.scrollHeight || 0;

      setMessages((prev) => [...res.messages, ...prev]);
      setNextCursor(res.nextCursor);
      setHasMore(res.hasMore);

      setTimeout(() => {
        if (scrollContainer) {
          const newScrollHeight = scrollContainer.scrollHeight;
          scrollContainer.scrollTop = newScrollHeight - previousScrollHeight;
        }
      }, 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "6rem",
        right: "1.5rem",
        zIndex: 50,
        width: "calc(100vw - 2rem)", // Responsive width
        maxWidth: "360px",
        height: "600px",
        maxHeight: "70vh",
        backgroundColor: "#ffffff",
        borderRadius: "1.5rem", // Larger, modern radius
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        border: "1px solid rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transformOrigin: "top right",
        animation: "fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#2563eb",
          padding: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          color: "#ffffff"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.875rem" }}>
            AD
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: "700", margin: 0, lineHeight: 1.2 }}>Administrator</h3>
            <p style={{ fontSize: "0.75rem", opacity: 0.9, margin: 0 }}>Usually replies within hours</p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: "2rem",
            height: "2rem",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.1)",
            border: "none",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background-color 0.2s"
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          minHeight: 0, // CRITICAL: Ensures scrolling stays within bounds
          backgroundColor: "#f9fafb",
          overflowY: "auto",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem"
        }}
      >
        {loading ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ alignSelf: "flex-end", width: "50%", height: "3rem", backgroundColor: "#e5e7eb", borderRadius: "1rem", borderBottomRightRadius: "0", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
            <div style={{ alignSelf: "flex-start", width: "60%", height: "3rem", backgroundColor: "#e5e7eb", borderRadius: "1rem", borderBottomLeftRadius: "0", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
            <div style={{ alignSelf: "flex-end", width: "70%", height: "4rem", backgroundColor: "#e5e7eb", borderRadius: "1rem", borderBottomRightRadius: "0", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "1rem" }}>
            <div style={{ width: "4rem", height: "4rem", backgroundColor: "#eff6ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", color: "#2563eb", fontSize: "1.75rem" }}>
              💬
            </div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#111827", margin: "0 0 0.25rem 0" }}>Send a message</h4>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>Have a question? Reach out to the admin.</p>
          </div>
        ) : (
          <>
            {hasMore && (
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                <button
                  onClick={loadMoreMessages}
                  disabled={loadingMore}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#e5e7eb",
                    color: "#374151",
                    border: "none",
                    borderRadius: "2rem",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    cursor: loadingMore ? "not-allowed" : "pointer",
                  }}
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
            {messages.map((msg, index) => {
              const isMe = msg.senderId === user?.$id;
              const unreadStartIndex = messages.length - initialUnreadCount;
              const showUnreadSeparator = initialUnreadCount > 0 && index === unreadStartIndex;

              return (
                <div key={msg.$id}>
                  {showUnreadSeparator && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "1rem 0",
                      }}
                    >
                      <div style={{ flex: 1, height: "1px", backgroundColor: "#B9001B", opacity: 0.2 }} />
                      <span
                        style={{
                          padding: "4px 10px",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#B9001B",
                          backgroundColor: "#FFF0F2",
                          borderRadius: "12px",
                          margin: "0 10px",
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                        }}
                      >
                        {initialUnreadCount} Unread Message{initialUnreadCount > 1 ? "s" : ""}
                      </span>
                      <div style={{ flex: 1, height: "1px", backgroundColor: "#B9001B", opacity: 0.2 }} />
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", width: "100%" }}>
                    <div
                      style={{
                        maxWidth: "85%",
                        padding: "0.625rem 1rem",
                        borderRadius: "1rem",
                        fontSize: "0.9375rem",
                        lineHeight: "1.4",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        backgroundColor: isMe ? "#2563eb" : "#ffffff",
                        color: isMe ? "#ffffff" : "#1f2937",
                        border: isMe ? "none" : "1px solid #e5e7eb",
                        boxShadow: isMe ? "0 2px 4px rgba(37,99,235,0.2)" : "0 1px 2px rgba(0,0,0,0.05)"
                      }}
                    >
                      {msg.text}
                      <div
                        style={{
                          fontSize: "0.65rem",
                          marginTop: "0.25rem",
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          gap: "4px",
                          opacity: isMe ? 0.9 : 0.7
                        }}
                      >
                        <span>{new Date(msg.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && (
                          <span style={{ display: "inline-flex", alignItems: "center" }}>
                            {msg.status === "seen" ? (
                              <CheckCheck size={14} color="#10b981" />
                            ) : msg.status === "delivered" ? (
                              <CheckCheck size={14} color="rgba(255, 255, 255, 0.75)" />
                            ) : msg.status === "sent" ? (
                              <Check size={14} color="rgba(255, 255, 255, 0.75)" />
                            ) : (
                              <Clock size={12} color="rgba(255, 255, 255, 0.75)" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div style={{ backgroundColor: "#ffffff", padding: "0.75rem", borderTop: "1px solid #f3f4f6", flexShrink: 0 }}>
        <form onSubmit={handleSend} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a message..."
            style={{
              flex: 1,
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "9999px",
              padding: "0.625rem 1rem",
              fontSize: "0.9rem",
              outline: "none",
              transition: "border-color 0.2s",
              color: "black"
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = "#2563eb"}
            onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: text.trim() ? "#2563eb" : "#e5e7eb",
              color: "#ffffff",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: text.trim() ? "pointer" : "not-allowed",
              transition: "background-color 0.2s"
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      <style jsx>{`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `}</style>
    </div>
  )
}
