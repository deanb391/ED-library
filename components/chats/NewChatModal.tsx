"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { fetchContributors } from "@/lib/api/contributors";
import { Contributor } from "@/lib/services/contributors.service";

interface Props {
  onClose: () => void;
  onSelectContributor: (contributorId: string) => void;
}

export default function NewChatModal({ onClose, onSelectContributor }: Props) {
  const [search, setSearch] = useState("");
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadContributors = async () => {
      setLoading(true);
      try {
        const res = await fetchContributors(50, "live", undefined, search);
        setContributors(res.contributors || []);
      } catch (err) {
        console.error("Failed to fetch contributors:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(loadContributors, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" style={{ top: "100px" }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[65vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold" style={{ color: "#111827" }}>New Chat</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-full" style={{ color: "#6b7280" }}>
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: "#9ca3af" }} />
            <input
              type="text"
              placeholder="Search contributors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ color: "#111827" }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="p-8 text-center" style={{ color: "#6b7280" }}>Loading...</div>
          ) : contributors.length > 0 ? (
            contributors.map((c) => (
              <div
                key={c.$id}
                onClick={() => onSelectContributor(c.user)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:bg-gray-900 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden shrink-0">
                  {c.profileImage ? (
                    <img src={c.profileImage} alt={c.username} className="w-full h-full object-cover" />
                  ) : (
                    c.username?.charAt(0).toUpperCase() || "?"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate text-sm" style={{ color: "#111827" }}>{c.username}</div>
                  <div className="text-xs truncate opacity-70" style={{ color: "#6b7280" }}>{c.institution || "Contributor"}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center" style={{ color: "#6b7280" }}>No contributors found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
