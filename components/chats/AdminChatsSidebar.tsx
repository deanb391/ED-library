"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Filter } from "lucide-react";
import type { Chat } from "@/lib/services/chats.service";
import NewChatModal from "./NewChatModal";

import type { Contributor } from "@/lib/services/contributors.service";

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateChat: (contributorId: string) => void;
  loading?: boolean;
  contributorsMap?: Record<string, Contributor>;
}

const BRAND_BLUE = "#2563eb";

export function AdminChatsSidebar({ chats, activeChatId, onSelectChat, onCreateChat, loading, contributorsMap = {} }: SidebarProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  const filteredChats = chats.filter((chat) => {
    if (filter === "unread" && (chat.unreadCounts["admin"] || 0) === 0) return false;
    const contributorId = chat.participants.find(p => p !== "admin");
    const contributor = contributorId ? contributorsMap[contributorId] : null;
    const name = contributor?.username || contributorId || "";
    if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#ffffff", fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Sidebar Header & Controls */}
      <div style={{ padding: "1.5rem", borderBottom: "1px solid #f3f4f6", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#111827", margin: 0, letterSpacing: "-0.025em" }}>Messages</h2>
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#eff6ff", color: BRAND_BLUE, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", transition: "background-color 0.2s ease" }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#dbeafe"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#eff6ff"}
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "1.25rem" }}>
          <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex", pointerEvents: "none" }}>
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "9999px", fontSize: "0.875rem", color: "#111827", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s ease" }}
            onFocus={(e) => e.currentTarget.style.borderColor = BRAND_BLUE}
            onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
          />
        </div>

        {/* Segmented Pill Filter */}
        <div style={{ display: "flex", backgroundColor: "#f3f4f6", padding: "0.25rem", borderRadius: "9999px" }}>
          <button
            onClick={() => setFilter("all")}
            style={{ flex: 1, padding: "0.5rem", borderRadius: "9999px", fontSize: "0.8125rem", fontWeight: "600", border: "none", cursor: "pointer", transition: "all 0.2s ease", backgroundColor: filter === "all" ? "#ffffff" : "transparent", color: filter === "all" ? "#111827" : "#6b7280", boxShadow: filter === "all" ? "0 1px 2px rgba(0,0,0,0.05)" : "none" }}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            style={{ flex: 1, padding: "0.5rem", borderRadius: "9999px", fontSize: "0.8125rem", fontWeight: "600", border: "none", cursor: "pointer", transition: "all 0.2s ease", backgroundColor: filter === "unread" ? "#ffffff" : "transparent", color: filter === "unread" ? "#111827" : "#6b7280", boxShadow: filter === "unread" ? "0 1px 2px rgba(0,0,0,0.05)" : "none" }}
          >
            Unread
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        {loading ? (
          <div style={{ padding: "1rem" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", marginBottom: "0.5rem" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#e5e7eb", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ height: "1rem", backgroundColor: "#e5e7eb", borderRadius: "0.25rem", width: "60%", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
                  <div style={{ height: "0.875rem", backgroundColor: "#e5e7eb", borderRadius: "0.25rem", width: "80%", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
                </div>
              </div>
            ))}
            <style jsx>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }`}</style>
          </div>
        ) : filteredChats.length === 0 ? (
          <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "#6b7280", fontSize: "0.875rem", fontWeight: "500" }}>
            No chats found.
          </div>
        ) : (
          filteredChats.map((chat) => {
            const unreadCount = chat.unreadCounts["admin"] || 0;
            const contributorId = chat.participants.find(p => p !== "admin");
            const contributor = contributorId ? contributorsMap[contributorId] : null;
            const isActive = activeChatId === chat.$id;
            const displayName = contributor?.username || contributorId?.substring(0, 8) || "Unknown";
            const initial = displayName.substring(0, 2).toUpperCase();

            return (
              <div
                key={chat.$id}
                onClick={() => onSelectChat(chat.$id)}
                style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.5rem", borderBottom: "1px solid #f9fafb", cursor: "pointer", backgroundColor: isActive ? "#eff6ff" : "transparent", transition: "background-color 0.2s ease" }}
                onMouseOver={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "#f9fafb"; }}
                onMouseOut={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                {/* Avatar */}
                {contributor?.profileImage ? (
                   <img src={contributor.profileImage} alt={displayName} style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: isActive ? `2px solid ${BRAND_BLUE}` : "none" }} />
                ) : (
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: isActive ? "#dbeafe" : "#f3f4f6", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: isActive ? BRAND_BLUE : "#6b7280", fontSize: "1rem", border: isActive ? `2px solid ${BRAND_BLUE}` : "none" }}>
                    {initial}
                  </div>
                )}

                {/* Info Content */}
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: unreadCount > 0 ? "800" : "600", color: unreadCount > 0 ? "#111827" : "#374151", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {displayName}
                    </h3>
                    {chat.lastMessageAt && (
                      <span style={{ fontSize: "0.7rem", color: unreadCount > 0 ? BRAND_BLUE : "#9ca3af", fontWeight: unreadCount > 0 ? "700" : "500", whiteSpace: "nowrap", flexShrink: 0, paddingLeft: "0.5rem" }}>
                        {new Date(chat.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                    <p style={{ fontSize: "0.85rem", color: unreadCount > 0 ? "#111827" : "#6b7280", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: unreadCount > 0 ? "600" : "400" }}>
                      {chat.lastMessage || "No messages yet"}
                    </p>
                    {unreadCount > 0 && (
                      <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: BRAND_BLUE, color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: "800", flexShrink: 0 }}>
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isNewChatModalOpen && (
        <NewChatModal
          onClose={() => setIsNewChatModalOpen(false)}
          onSelectContributor={(id) => {
            setIsNewChatModalOpen(false);
            onCreateChat(id);
          }}
        />
      )}
    </div>
  );
}