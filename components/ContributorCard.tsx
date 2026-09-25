"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toggleFollowContributor } from "@/lib/api/contributors";
import { useUser } from "@/context/UserContext";

export default function ContributorCard({ 
  contributorId, 
  id, 
  name, 
  institution, 
  category, 
  followers, 
  imageUrl,
  initialIsFollowing = false
}: {
  contributorId: string;
  id: string;
  name: string;
  institution: string;
  category?: string[];
  followers: number;
  imageUrl: string;
  initialIsFollowing?: boolean;
}) {
  const { user } = useUser();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(followers || 0);

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user || loading || !contributorId) return;
    
    setLoading(true);
    const wasFollowing = isFollowing;
    
    // Optimistic update
    setIsFollowing(!wasFollowing);
    setFollowersCount(prev => wasFollowing ? prev - 1 : prev + 1);

    try {
      const res = await toggleFollowContributor(user.$id, contributorId);
      if (!res) {
         // Revert on failure
         setIsFollowing(wasFollowing);
         setFollowersCount(prev => wasFollowing ? prev + 1 : prev - 1);
      }
    } catch (err) {
      console.error("Follow error:", err);
      setIsFollowing(wasFollowing);
      setFollowersCount(prev => wasFollowing ? prev + 1 : prev - 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link 
      href={`/contributor/account/${id}`}
      className="flex flex-col items-center justify-between w-full h-[300px] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 bg-white dark:bg-black group hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex flex-col items-center w-full">
        <div className="w-20 h-20 rounded-full border border-gray-200 dark:border-gray-800 overflow-hidden mb-3 bg-gray-100 dark:bg-gray-900 shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800" />
          )}
        </div>
        
        <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-1 text-center line-clamp-1 w-full px-2">
          {name}
        </h3>
        
        <p className="text-[13px] text-gray-500 dark:text-gray-400 text-center mb-2 line-clamp-1 w-full px-2">
          {institution}
        </p>

        {category && category.length > 0 ? (
          <div className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full mb-3 flex flex-wrap gap-1 justify-center max-w-full overflow-hidden">
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 truncate">
              {category[0]}
            </span>
          </div>
        ) : (
          <div className="h-[26px] mb-3" />
        )}

        <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-4">
          {followersCount} {followersCount === 1 ? "follower" : "followers"}
        </p>
      </div>

      <button
        onClick={handleFollow}
        disabled={loading}
        className={`w-full py-3 rounded-full flex items-center justify-center transition-colors font-bold text-[14px] mt-auto ${
          isFollowing 
            ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800" 
            : "bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100"
        }`}
      >
        {loading ? (
          <span className="animate-pulse">...</span>
        ) : isFollowing ? (
          "Unfollow"
        ) : (
          "Follow"
        )}
      </button>
    </Link>
  );
}
