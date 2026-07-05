"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import ContributorChatModal from "./ContributorChatModal";
import { getChatForContributorService } from "@/lib/services/chats.service";
import { client } from "@/lib/appwrite";

const DATABASE_ID = "69617e75000c6c010a75";
const CHAT_COLLECTION = "chats";

export default function ContributorChatFAB() {
  const pathname = usePathname();
  const { user, contributor } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    let unsubscribe: () => void;

    const loadUnreadCount = async () => {
      try {
        const chat = await getChatForContributorService(user.$id);
        if (chat) {
          setUnreadCount(chat.unreadCounts[user.$id] || 0);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadUnreadCount();

    unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${CHAT_COLLECTION}.documents`,
      (response) => {
        if (
          response.events.includes("databases.*.collections.*.documents.*.update") ||
          response.events.includes("databases.*.collections.*.documents.*.create")
        ) {
          const updatedChat = response.payload as any;
          if (updatedChat.participants?.includes(user.$id)) {
            let counts = {};
            if (typeof updatedChat.unreadCounts === "string") {
              try { counts = JSON.parse(updatedChat.unreadCounts); } catch {}
            } else if (typeof updatedChat.unreadCounts === "object") {
              counts = updatedChat.unreadCounts || {};
            }
            setUnreadCount((counts as any)[user.$id] || 0);
          }
        }
      }
    );

    const unsubscribeMessages = client.subscribe(
      `databases.${DATABASE_ID}.collections.messages.documents`,
      (response) => {
        if (response.events.includes("databases.*.collections.*.documents.*.create")) {
          const newMsg = response.payload as any;
          if (newMsg.senderId !== user.$id) {
            // Ensure this message is actually for this contributor's chat
            getChatForContributorService(user.$id).then(chat => {
              if (chat && chat.$id === newMsg.chatId) {
                if (!isOpenRef.current) {
                  // Mark as delivered since it was received but not opened
                  import("@/lib/services/messages.service").then((mod) => {
                    mod.updateMessagesStatusService([newMsg.$id], "delivered").catch(() => null);
                  });
                }
              }
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

  // When modal opens, unread counts are cleared by the modal itself.
  // The subscription will catch the update and set unreadCount to 0.

  if (!user || !contributor || contributor.status !== "live") return null;
  if (!pathname || !pathname.startsWith("/contributor/dashboard")) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-24 right-6 z-[49] w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-transform hover:scale-105 active:scale-95"
        style={{ color: "#ffffff" }}
        aria-label="Chat with Administrator"
      >
        <MessageSquare size={24} />
        {unreadCount > 0 && !isOpen && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <ContributorChatModal onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
