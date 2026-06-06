"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";

const DATABASE_ID = "69617e75000c6c010a75";
const USER_COLLECTION = "user";

type Contributor = {
  $id: string;
  username: string;
  email: string;
  avatar?: string;
  isAdmin?: boolean;
};

interface Props {
  onClose: () => void;
  onSelectContributor: (contributorId: string) => void;
}

export default function NewChatModal({ onClose, onSelectContributor }: Props) {
  const [search, setSearch] = useState("");
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContributors = async () => {
      setLoading(true);
      try {
        const queries = [
          Query.limit(50),
          Query.equal("isAdmin", false)
        ];
        if (search) {
          queries.push(Query.search("username", search));
        }
        
        const res = await databases.listDocuments(DATABASE_ID, USER_COLLECTION, queries);
        setContributors(res.documents as unknown as Contributor[]);
      } catch (err) {
        console.error("Failed to fetch contributors", err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchContributors, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold" style={{ color: "#111827" }}>New Chat</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full" style={{ color: "#6b7280" }}>
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: "#9ca3af" }} />
            <input
              type="text"
              placeholder="Search contributors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                onClick={() => onSelectContributor(c.$id)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {c.avatar ? (
                  <img src={c.avatar} alt={c.username} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold" style={{ color: "#2563eb" }}>
                    {c.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold" style={{ color: "#111827" }}>{c.username}</p>
                  <p className="text-xs" style={{ color: "#6b7280" }}>{c.email}</p>
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
