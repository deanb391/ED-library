"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import ContributorChatModal from "./ContributorChatModal";
import { getChatForContributor, updateMessagesStatus } from "@/lib/api/chats";

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

    const loadUnreadCount = async () => {
      try {
        const chat = await getChatForContributor(user.$id);
        if (chat && chat.unreadCounts) {
          setUnreadCount(chat.unreadCounts[user.$id] || 0);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadUnreadCount();
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
