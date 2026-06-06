"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "@/components/useRouter";
import AccessWall from "@/components/AccessWall";
import { getChatsForAdminService, createChatService, clearChatUnreadCountService, type Chat } from "@/lib/services/chats.service";
import { createMessageService, getMessagesByChatService, type Message } from "@/lib/services/messages.service";
import { client } from "@/lib/appwrite";
import { ArrowLeft, MessageSquare, Search, Plus, Send } from "lucide-react";
import NewChatModal from "@/components/chats/NewChatModal"; // Ensure this import points to your actual file
import { AdminChatDetails } from "@/components/chats/AdminChatDetails"
import { AdminChatsSidebar } from "@/components/chats/AdminChatsSidebar"

const DATABASE_ID = "69617e75000c6c010a75";
const CHAT_COLLECTION = "chats";
const MESSAGE_COLLECTION = "messages";
const BRAND_BLUE = "#2563eb";

import { getContributorByUserId } from "@/lib/api/contributors";
import type { Contributor } from "@/lib/services/contributors.service";

// ==========================================
// 1. MAIN PAGE WRAPPER
// ==========================================
export default function AdminChatsPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const [chats, setChats] = useState<Chat[]>([]);
  const [contributorsMap, setContributorsMap] = useState<Record<string, Contributor>>({});
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const activeChatIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!user?.isAdmin) return;
    let unsubscribe: () => void;

    const loadChatsAndContributors = async () => {
      setLoading(true);
      try {
        const fetchedChats = await getChatsForAdminService();
        setChats(fetchedChats);

        // Fetch contributors for these chats
        const userIds = [...new Set(fetchedChats.map(c => c.participants.find(p => p !== "admin")).filter(Boolean))] as string[];
        const contributorsData: Record<string, Contributor> = {};
        await Promise.all(userIds.map(async (uid) => {
          const c = await getContributorByUserId(uid);
          if (c) contributorsData[uid] = c;
        }));
        setContributorsMap(contributorsData);
      } catch (err) {
        console.error("Failed to load chats", err);
      } finally {
        setLoading(false);
      }
    };

    loadChatsAndContributors();

    unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${CHAT_COLLECTION}.documents`,
      async (response) => {
        if (
          response.events.includes("databases.*.collections.*.documents.*.update") ||
          response.events.includes("databases.*.collections.*.documents.*.create")
        ) {
          const updatedChat = response.payload as any as Chat;
          if (updatedChat.participants.includes("admin")) {
            setChats((prev) => {
              const exists = prev.some(c => c.$id === updatedChat.$id);
              if (exists) {
                return prev.map(c => c.$id === updatedChat.$id ? updatedChat : c).sort((a, b) =>
                  new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
                );
              } else {
                return [updatedChat, ...prev].sort((a, b) =>
                  new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
                );
              }
            });

            // Fetch contributor if not in map
            const contributorUserId = updatedChat.participants.find(p => p !== "admin");
            if (contributorUserId) {
              setContributorsMap(prev => {
                if (prev[contributorUserId]) return prev;
                // If not in prev map, fetch it and update state
                getContributorByUserId(contributorUserId).then(c => {
                  if (c) {
                    setContributorsMap(current => ({ ...current, [contributorUserId]: c }));
                  }
                });
                return prev;
              });
            }
          }
        }
      }
    );

    const unsubscribeMessages = client.subscribe(
      `databases.${DATABASE_ID}.collections.${MESSAGE_COLLECTION}.documents`,
      (response) => {
        if (response.events.includes("databases.*.collections.*.documents.*.create")) {
          const newMsg = response.payload as any;
          if (newMsg.senderId !== "admin") {
            // We need to check if the admin is a participant of this chat
            setChats((prevChats) => {
              const isParticipant = prevChats.some(c => c.$id === newMsg.chatId);
              if (isParticipant) {
                if (newMsg.chatId === activeChatIdRef.current) {
                  // If it's active, AdminChatDetails will handle marking it as "seen"
                  // But just in case, we can also do it here, or let AdminChatDetails do it.
                } else {
                  // Mark as delivered since it was received by the client but not opened
                  import("@/lib/services/messages.service").then((mod) => {
                    mod.updateMessagesStatusService([newMsg.$id], "delivered").catch(() => null);
                  });
                }
              }
              return prevChats;
            });
          }
        }
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [user]);

  const handleCreateChat = async (contributorUserId: string) => {
    try {
      const chat = await createChatService(contributorUserId);
      setChats(prev => {
        if (!prev.some(c => c.$id === chat.$id)) {
          return [chat, ...prev];
        }
        return prev;
      });
      // Ensure contributor is in map
      if (!contributorsMap[contributorUserId]) {
        const c = await getContributorByUserId(contributorUserId);
        if (c) {
          setContributorsMap(current => ({ ...current, [contributorUserId]: c }));
        }
      }
      setActiveChatId(chat.$id);
    } catch (err) {
      console.error("Failed to create chat", err);
    }
  };

  if (!user && !userLoading) return <AccessWall type="user" />;
  if (user && !user.isAdmin) return <AccessWall type="admin" />;

  const activeChat = chats.find(c => c.$id === activeChatId);
  const isDataLoading = userLoading || loading;

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#ffffff", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {activeChat && !isDataLoading ? (
          <AdminChatDetails chat={activeChat} contributorsMap={contributorsMap} onBack={() => setActiveChatId(null)} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", backgroundColor: "#ffffff", borderBottom: "1px solid #f3f4f6", flexShrink: 0 }}>
              <button
                onClick={() => router.push("/admin")}
                style={{ background: "none", border: "none", color: "#6b7280", padding: "0.5rem", marginLeft: "-0.5rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
              >
                <ArrowLeft size={24} />
              </button>
              <h1 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#111827", margin: 0 }}>Administrator Chat</h1>
            </div>
            <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
              <AdminChatsSidebar chats={chats} contributorsMap={contributorsMap} activeChatId={activeChatId} onSelectChat={setActiveChatId} onCreateChat={handleCreateChat} loading={isDataLoading} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- DESKTOP LAYOUT ---
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", padding: "2rem", boxSizing: "border-box", fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 4rem)" }}>

        {/* Desktop Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexShrink: 0 }}>
          <button
            onClick={() => router.push("/admin")}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "50%", cursor: "pointer", color: "#4b5563", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", transition: "transform 0.1s ease" }}
            onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
            onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onPointerLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#111827", margin: 0, letterSpacing: "-0.025em" }}>
            Administrator Chat
          </h1>
        </div>

        {/* Desktop Split Pane */}
        <div style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: "1.5rem", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)", border: "1px solid #f3f4f6", display: "flex", overflow: "hidden", minHeight: 0 }}>
          <div style={{ width: "360px", flexShrink: 0, borderRight: "1px solid #f3f4f6", display: "flex", flexDirection: "column", height: "100%" }}>
            <AdminChatsSidebar chats={chats} contributorsMap={contributorsMap} activeChatId={activeChatId} onSelectChat={setActiveChatId} onCreateChat={handleCreateChat} loading={isDataLoading} />
          </div>
          <div style={{ flex: 1, backgroundColor: "#f9fafb", display: "flex", flexDirection: "column", height: "100%" }}>
            {activeChat && !isDataLoading ? (
              <AdminChatDetails chat={activeChat} contributorsMap={contributorsMap} onBack={() => setActiveChatId(null)} />
            ) : isDataLoading ? (
              <AdminChatDetails chat={null} contributorsMap={{}} onBack={() => { }} loading={true} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "2rem", color: "#6b7280" }}>
                <div style={{ width: "5rem", height: "5rem", backgroundColor: "#eff6ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: BRAND_BLUE, boxShadow: "inset 0 0 0 1px rgba(37, 99, 235, 0.1)", marginBottom: "1.25rem" }}>
                  <MessageSquare size={36} strokeWidth={2} />
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#111827", margin: "0 0 0.5rem 0" }}>Your Messages</h3>
                <p style={{ fontSize: "0.95rem", margin: 0, color: "#6b7280" }}>Select a chat from the sidebar to start messaging.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}