"use client";

import { useEffect, useState } from "react";
import { getMyContributor } from "@/lib/api/contributors";
import { Contributor } from "@/lib/services/contributors.service";
import Image from "next/image";
import EditContributorModal from "./EditContributorModal";

export default function ContributorSection({ userId }: { userId: string }) {
  const [contributor, setContributor] = useState<Contributor | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchContributor = async () => {
      try {
        const data = await getMyContributor(userId);
        setContributor(data);
      } catch (error) {
        console.error("Error fetching contributor:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContributor();
  }, [userId]);

  if (loading || !contributor) return null;

  return (
    <div className="mt-6 rounded-2xl bg-white shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between border-b pb-4" style={{ marginBottom: 20, paddingBottom: 10 }}>
        <h3 className="text-lg font-semibold text-gray-900">Contributor Profile</h3>
        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
        >
          Edit Profile
        </button>
      </div>

      <div className="flex gap-4 items-start">
        {contributor.profileImage ? (
          <div className="h-16 w-16 shrink-0 rounded-full overflow-hidden bg-gray-100 border border-gray-200 relative">
            <Image
              src={contributor.profileImage}
              alt={contributor.username}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-16 w-16 shrink-0 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 text-xl font-semibold text-gray-500">
            {contributor.username?.[0]?.toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-medium text-gray-900 truncate">{contributor.username}</p>
          {(contributor.institution || contributor.country) && (
            <p className="text-sm text-gray-500 truncate">
              {[contributor.institution, contributor.country].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      </div>

      {contributor.bio && (
        <div className="pt-2">
          <p className="text-sm text-gray-700 leading-relaxed">{contributor.bio}</p>
        </div>
      )}

      {contributor.category && contributor.category.length > 0 && (
        <div className="pt-2 flex flex-wrap gap-2">
          {contributor.category.map((cat, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-full capitalize"
              style={{ paddingRight: 10, paddingLeft: 10 }}
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      {isEditing && (
        <EditContributorModal
          contributor={contributor}
          onClose={() => setIsEditing(false)}
          onSuccess={(updated) => {
            setContributor(updated);
            setIsEditing(false);
          }}
        />
      )}
    </div>
  );
}
