"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import NProgress from "nprogress";
import { ArrowLeft, Send, Clock, Check, CheckCheck } from "lucide-react";
import type { Chat } from "@/lib/services/chats.service";
import type { Message } from "@/lib/services/messages.service";
import { createMessageService, getMessagesByChatService, updateMessagesStatusService } from "@/lib/services/messages.service";
import { clearChatUnreadCountService } from "@/lib/services/chats.service";
import { client } from "@/lib/appwrite";
import type { Contributor } from "@/lib/services/contributors.service";
const BRAND_BLUE = "#2563eb";
const DATABASE_ID = "69617e75000c6c010a75";
const MESSAGE_COLLECTION = "messages";

interface DetailsProps {
  chat: Chat | null;
  onBack: () => void;
  loading?: boolean;
  contributorsMap?: Record<string, Contributor>;
}

export function AdminChatDetails({ chat, onBack, loading: pageLoading, contributorsMap = {} }: DetailsProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialUnreadCount, setInitialUnreadCount] = useState(0);

  const chatId = chat?.$id;
  const adminUnreadCount = chat?.unreadCounts?.["admin"] || 0;

  useEffect(() => {
    if (pageLoading || !chatId) return;

    let unsubscribe: () => void;
    const loadMessages = async () => {
      setLoading(true);
      try {
        const currentUnread = chat?.unreadCounts?.["admin"] || 0;
        setInitialUnreadCount(currentUnread);

        const res = await getMessagesByChatService(chatId, 15);
        setMessages(res.messages);
        setNextCursor(res.nextCursor);
        setHasMore(res.hasMore);

        if (currentUnread > 0) {
          await clearChatUnreadCountService(chatId, "admin");
          const unseenMsgIds = res.messages
            .filter((m) => m.senderId !== "admin" && m.status !== "seen")
            .map((m) => m.$id);
          if (unseenMsgIds.length > 0) {
            updateMessagesStatusService(unseenMsgIds, "seen").catch(() => null);
          }
        }
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        setLoading(false);
        setTimeout(() => messagesEndRef.current?.scrollIntoView(), 100);
      }
    };

    loadMessages();

    unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${MESSAGE_COLLECTION}.documents`,
      (response) => {
        if (
          response.events.includes("databases.*.collections.*.documents.*.create")
        ) {
          const newMsg = response.payload as any as Message;
          if (newMsg.chatId === chatId) {
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

            if (newMsg.senderId !== "admin") {
              clearChatUnreadCountService(chatId, "admin");
            }
          }
        }
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, pageLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !chat) return;

    const payloadText = text.trim();
    setText(""); // Optimistic UI clear

    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = {
      $id: tempId,
      chatId: chat.$id,
      senderId: "admin",
      text: payloadText,
      status: "pending" as any,
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    try {
      await createMessageService({
        chatId: chat.$id,
        senderId: "admin",
        text: payloadText,
      });
      // The appwrite subscription will replace the temp message
    } catch (err) {
      console.error("Failed to send message", err);
      setMessages((prev) => prev.filter(m => m.$id !== tempId));
    }
  };

  const contributorId = chat?.participants.find(p => p !== "admin") || "Unknown";
  const contributor = contributorId !== "Unknown" ? contributorsMap[contributorId] : null;
  const displayName = contributor?.username || (contributorId !== "Unknown" ? contributorId.substring(0, 8) : "");

  const loadMoreMessages = async () => {
    if (!chatId || loadingMore || !hasMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await getMessagesByChatService(chatId, 15, nextCursor);

      const scrollContainer = messagesEndRef.current?.parentElement;
      const previousScrollHeight = scrollContainer?.scrollHeight || 0;

      setMessages((prev) => [...res.messages, ...prev]);
      setNextCursor(res.nextCursor);
      setHasMore(res.hasMore);

      // Restore scroll position
      setTimeout(() => {
        if (scrollContainer) {
          const newScrollHeight = scrollContainer.scrollHeight;
          scrollContainer.scrollTop = newScrollHeight - previousScrollHeight;
        }
      }, 0);
    } catch (err) {
      console.error("Error loading more messages:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Because the parent is strictly sized, flex columns work perfectly here.
  return (
    <div
      style={{
        position: "relative", // CRITICAL FIX: Establishes a strict boundary for absolute children
        width: "100%",
        height: "100%",
        backgroundColor: "#f3f4f6", // Subtle canvas color
        overflow: "hidden",
        flex: 1,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* --- HEADER (Strictly pinned to the top) --- */}
      <div
        style={{
          position: "absolute",
          top: 72,
          left: 0,
          right: 0,
          height: "72px", // Fixed height
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0 1.5rem",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "saturate(180%) blur(16px)",
          WebkitBackdropFilter: "saturate(180%) blur(16px)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
          zIndex: 20,
          boxSizing: "border-box"
        }}
      >
        <button
          onClick={onBack}
          className="md:hidden"
          style={{
            background: "none",
            border: "none",
            padding: "0.5rem",
            marginLeft: "-0.5rem",
            color: "#6b7280",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            WebkitTapHighlightColor: "transparent"
          }}
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>

        {pageLoading ? (
          <>
            <div style={{ width: "42px", height: "42px", borderRadius: "50%", backgroundColor: "#e5e7eb", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
              <div style={{ width: "100px", height: "1rem", backgroundColor: "#e5e7eb", borderRadius: "0.25rem", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
              <div style={{ width: "60px", height: "0.75rem", backgroundColor: "#e5e7eb", borderRadius: "0.25rem", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                if (contributor) {
                  NProgress.start();
                  router.push(`/contributor/account/${contributor.$id}`);
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                background: "none",
                border: "none",
                padding: 0,
                cursor: contributor ? "pointer" : "default",
                textAlign: "left",
                fontFamily: "inherit"
              }}
            >
              {contributor?.profileImage ? (
                <img src={contributor.profileImage} alt={displayName} style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `1px solid rgba(0,0,0,0.1)` }} />
              ) : (
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    backgroundColor: "#eff6ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "0.875rem",
                    letterSpacing: "0.05em",
                    boxShadow: "inset 0 0 0 1px rgba(37, 99, 235, 0.15)",
                    flexShrink: 0
                  }}
                >
                  {displayName.substring(0, 2).toUpperCase()}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: "700", color: "#111827", margin: "0 0 0.125rem 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {displayName}
                </h2>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0, fontWeight: "500" }}>
                  Contributor
                </p>
              </div>
            </button>
          </>
        )}
      </div>

      {/* --- MESSAGES AREA (Strictly constrained between header and footer) --- */}
      <div
        style={{
          position: "absolute",
          top: "150px", // Starts exactly below the header
          bottom: "calc(76px + env(safe-area-inset-bottom, 0px))", // Ends exactly above the input area
          left: 0,
          right: 0,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch", // Smooth iOS scrolling
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.375rem" // Tighter gap for sequential messages
        }}
      >
        {loading ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem" }}>
            <div style={{ alignSelf: "flex-start", width: "60%", height: "3rem", backgroundColor: "#e5e7eb", borderRadius: "1rem", borderBottomLeftRadius: "0", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
            <div style={{ alignSelf: "flex-end", width: "50%", height: "3rem", backgroundColor: "#e5e7eb", borderRadius: "1rem", borderBottomRightRadius: "0", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
            <div style={{ alignSelf: "flex-start", width: "70%", height: "4rem", backgroundColor: "#e5e7eb", borderRadius: "1rem", borderBottomLeftRadius: "0", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
            <div
              style={{
                width: "4.5rem",
                height: "4.5rem",
                backgroundColor: "#e0e7ff",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.75rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
              }}
            >
              👋
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "1.125rem", fontWeight: "700", color: "#111827", margin: "0 0 0.25rem 0" }}>No messages yet</p>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>Start the conversation!</p>
            </div>
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
              const isAdmin = msg.senderId === "admin";
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId;
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

                  <div
                    style={{
                      display: "flex",
                      justifyContent: isAdmin ? "flex-end" : "flex-start",
                      width: "100%",
                      marginTop: isFirstInGroup ? "0.75rem" : "0" // Extra space only between different senders
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "82%",
                        padding: "0.625rem 1rem",
                        backgroundColor: isAdmin ? "#2563eb" : "#ffffff",
                        color: isAdmin ? "#ffffff" : "#1f2937",
                        borderRadius: "1.25rem",
                        // Sharp corner points to the sender
                        borderTopLeftRadius: !isAdmin && !isFirstInGroup ? "0.3rem" : "1.25rem",
                        borderBottomLeftRadius: !isAdmin ? "0.3rem" : "1.25rem",
                        borderTopRightRadius: isAdmin && !isFirstInGroup ? "0.3rem" : "1.25rem",
                        borderBottomRightRadius: isAdmin ? "0.3rem" : "1.25rem",
                        boxShadow: isAdmin ? "0 2px 5px rgba(37, 99, 235, 0.2)" : "0 1px 3px rgba(0,0,0,0.05)",
                        border: isAdmin ? "none" : "1px solid #e5e7eb",
                        display: "flex",
                        flexDirection: "column"
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.9375rem", // 15px
                          lineHeight: "1.45",
                          margin: 0,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word"
                        }}
                      >
                        {msg.text}
                      </p>
                      <div
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: "500",
                          marginTop: "0.3rem",
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          gap: "4px",
                          color: isAdmin ? "rgba(255, 255, 255, 0.75)" : "#9ca3af"
                        }}
                      >
                        <span>{new Date(msg.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isAdmin && (
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

        <div ref={messagesEndRef} style={{ height: "1px", width: "100%" }} />


      </div>

      {/* --- INPUT AREA (Strictly pinned to the bottom) --- */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "calc(76px + env(safe-area-inset-bottom, 0px))", // Fixed height accounting for iOS home bar
          backgroundColor: "#ffffff",
          borderTop: "1px solid #e5e7eb",
          padding: "1rem 1.5rem",
          paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
          zIndex: 20,
          boxSizing: "border-box"
        }}
      >
        <form onSubmit={handleSend} style={{ display: "flex", alignItems: "center", gap: "0.75rem", height: "44px" }}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            style={{
              flex: 1,
              height: "100%",
              backgroundColor: "#f3f4f6",
              border: "1px solid transparent",
              borderRadius: "9999px",
              padding: "0 1.25rem",
              fontSize: "16px", // CRITICAL: 16px exact prevents iOS Safari from zooming in
              color: "#111827",
              outline: "none",
              transition: "border-color 0.2s ease, background-color 0.2s ease",
              boxSizing: "border-box"
            }}
            onFocus={(e) => {
              e.currentTarget.style.backgroundColor = "#ffffff";
              e.currentTarget.style.borderColor = "#2563eb";
            }}
            onBlur={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
              e.currentTarget.style.borderColor = "transparent";
            }}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: text.trim() ? "#2563eb" : "#e5e7eb",
              color: "#ffffff",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: text.trim() ? "pointer" : "not-allowed",
              transition: "background-color 0.2s ease, transform 0.1s ease",
              boxShadow: text.trim() ? "0 4px 10px rgba(37, 99, 235, 0.25)" : "none",
              flexShrink: 0,
              WebkitTapHighlightColor: "transparent"
            }}
            onPointerDown={(e) => { if (text.trim()) e.currentTarget.style.transform = "scale(0.95)"; }}
            onPointerUp={(e) => { if (text.trim()) e.currentTarget.style.transform = "scale(1)"; }}
            onPointerLeave={(e) => { if (text.trim()) e.currentTarget.style.transform = "scale(1)"; }}
          >
            <Send size={18} style={{ marginLeft: "-2px" }} />
          </button>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}