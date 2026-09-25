"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Search,
  Mic,
  Plus,
  Bell,
  Menu,
  ArrowLeft,
  History,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useHome } from "@/context/HomeContext";
import { searchCourses, Course } from "@/lib/api/courses";
import { searchContributors } from "@/lib/api/contributors";
import type { Contributor } from "@/lib/services/contributors.service";
import clsx from "clsx";

function HeaderSkeleton() {
  return (
    <div className="h-9 w-20 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
  );
}

export default function Header() {
  const router = useRouter();
  const { user, loading, contributor } = useUser();
  const { 
    isSidebarExpanded, 
    setIsSidebarExpanded,
    submitSearch,
    closeSearch,
    isSearchOverlayOpen
  } = useHome();
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<{ courses: Course[], contributors: Contributor[] }>({ courses: [], contributors: [] });
  const [isSearching, setIsSearching] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  
  const hasContributorAccount = Boolean(contributor);

  const avatarSrc = hasContributorAccount
    ? contributor?.profileImage
    : user?.avatar;

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ed_recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clear search input when overlay is closed
  useEffect(() => {
    if (!isSearchOverlayOpen) {
      setSearchQuery("");
    }
  }, [isSearchOverlayOpen]);

  // Debounced Search API call
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ courses: [], contributors: [] });
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [coursesData, contributorsData] = await Promise.all([
          searchCourses(searchQuery),
          searchContributors(searchQuery)
        ]);
        
        setSearchResults({
          courses: Array.isArray(coursesData) ? coursesData : (coursesData?.courses || []),
          contributors: Array.isArray(contributorsData) ? contributorsData : (contributorsData?.contributors || [])
        });
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;
    
    // Save to recent searches
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("ed_recent_searches", JSON.stringify(updated));
    
    setSearchQuery(query);
    setIsSearchFocused(false);
    submitSearch(query);
  };

  const handleResultClick = (query: string, href: string) => {
    // We don't route! The user said:
    // "let's not route to the course screen of contributor screen. Let's just display the results overlay"
    // So we just submit the search for that query.
    handleSearchSubmit(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    closeSearch();
  };

  return (
    <nav className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-4 h-[72px] flex items-center justify-between sticky top-0 z-50 transition-colors duration-200 w-full relative">
      
      {/* LEFT: Logo - Hidden on mobile if searching or overlay open */}
      <div className={`flex items-center gap-4 w-1/4 min-w-max ${isSearchFocused || isSearchOverlayOpen ? "hidden md:flex" : "flex"}`}>
        <button 
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
        >
          <Menu size={24} className="text-gray-900 dark:text-white" />
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 transition-all active:scale-[0.90]"
        >
          <div className="bg-blue-600 text-white p-1 rounded-md">
            <BookOpen size={20} strokeWidth={2.5} />
          </div>
          <span className={clsx("font-bold text-lg md:text-xl tracking-tight", "text-gray-900 dark:text-white")}>
            {user?.isPremium ? "Premium" : "ED-Library"}
          </span>
        </Link>
      </div>

      {/* CENTER: Search Bar */}
      <div 
        ref={searchRef}
        className={`flex-1 max-w-[600px] flex items-center gap-2 md:gap-4 mx-0 md:mx-4 relative
          ${isSearchFocused || isSearchOverlayOpen ? "flex" : "hidden md:flex"}
        `}
      >
        {/* Mobile Back Button (Only visible when searching on mobile or overlay open) */}
        {(isSearchFocused || isSearchOverlayOpen) && (
          <button 
            className="md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900"
            onClick={() => {
              setIsSearchFocused(false);
              closeSearch();
            }}
          >
            <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
          </button>
        )}

        <div className="flex w-full items-center relative">
          <div className={`flex items-center w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-2 
            ${isSearchFocused ? "rounded-l-xl rounded-r-none md:rounded-l-full border-blue-500 shadow-sm" : "rounded-l-full"}
          `}>
            {isSearchFocused && (
              <Search size={20} className="text-gray-900 dark:text-white mr-2 shrink-0 hidden md:block" />
            )}
            {!isSearchFocused && (
              <Search size={20} className="text-gray-400 mr-2 shrink-0 hidden md:block" />
            )}
            
            <input
              type="text"
              placeholder="Search courses, contributors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearchSubmit(searchQuery);
              }}
              className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500"
            />
            
            {searchQuery && (
              <button 
                onClick={handleClearSearch}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors ml-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
          <button 
            onClick={() => handleSearchSubmit(searchQuery)}
            className="bg-gray-100 dark:bg-gray-800 border border-l-0 border-gray-200 dark:border-gray-800 rounded-r-full px-5 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0"
          >
            <Search size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        <button className="p-2.5 bg-gray-100 dark:bg-gray-900 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors shrink-0">
          <Mic size={20} className="text-gray-900 dark:text-white" />
        </button>

        {/* Dropdown for Search History / Results */}
        {isSearchFocused && (
          <div className="absolute top-[110%] left-0 right-14 md:left-4 md:right-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-50 overflow-hidden py-3 flex flex-col">
            
            {/* If empty query -> Show History */}
            {!searchQuery.trim() && recentSearches.length > 0 && (
              <div className="flex flex-col">
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearchSubmit(search)}
                    className="flex items-center gap-4 px-4 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full text-left"
                  >
                    <History size={20} className="text-gray-500 shrink-0" />
                    <span className="font-semibold text-[15px] text-gray-900 dark:text-white flex-1 truncate">
                      {search}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* If empty query and no history */}
            {!searchQuery.trim() && recentSearches.length === 0 && (
               <div className="px-4 py-3 text-sm text-gray-500 text-center">
                 No recent searches
               </div>
            )}

            {/* If typing -> Show Results */}
            {searchQuery.trim() && (
              <div className="flex flex-col max-h-[60vh] overflow-y-auto">
                {isSearching ? (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center animate-pulse">Searching...</div>
                ) : (
                  <>
                    {/* Courses */}
                    {searchResults.courses.length > 0 && (
                      <>
                        <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-black/50">Courses</div>
                        {searchResults.courses.slice(0, 5).map(course => (
                          <button
                            key={course.id}
                            onClick={() => handleResultClick(course.title, `/courses/${course.id}`)}
                            className="flex items-center gap-4 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full text-left"
                          >
                            <Search size={18} className="text-gray-500 shrink-0" />
                            <span className="font-medium text-[15px] text-gray-900 dark:text-white flex-1 truncate">
                              {course.title}
                            </span>
                          </button>
                        ))}
                      </>
                    )}
                    
                    {/* Contributors */}
                    {searchResults.contributors.length > 0 && (
                      <>
                        <div className="px-4 py-1 mt-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-black/50">Contributors</div>
                        {searchResults.contributors.slice(0, 3).map(contributor => (
                          <button
                            key={contributor.$id}
                            onClick={() => handleResultClick(contributor.username, `/contributor/account/${contributor.$id}`)}
                            className="flex items-center gap-4 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full text-left"
                          >
                            <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700">
                              <img src={contributor.profileImage || "/default-avatar.png"} alt={contributor.username} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-medium text-[15px] text-gray-900 dark:text-white flex-1 truncate">
                              {contributor.username}
                            </span>
                          </button>
                        ))}
                      </>
                    )}

                    {searchResults.courses.length === 0 && searchResults.contributors.length === 0 && (
                       <div className="px-4 py-3 text-sm text-gray-500 text-center">
                         No results found
                       </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT: Actions - Hidden on mobile if searching or overlay open */}
      <div className={`flex items-center justify-end gap-2 sm:gap-4 w-1/4 min-w-max ${isSearchFocused || isSearchOverlayOpen ? "hidden md:flex" : "flex"}`}>
        {/* Mobile Search Icon */}
        <button 
          onClick={() => setIsSearchFocused(true)}
          className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
        >
          <Search size={20} className="text-gray-900 dark:text-white" />
        </button>

        {loading ? (
          <HeaderSkeleton />
        ) : user ? (
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Create Button */}
            <Link
              href={hasContributorAccount ? `/contributor/dashboard/${user.$id}` : "/become-a-contributor"}
              className="hidden sm:flex items-center gap-1.5 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 px-3 py-1.5 rounded-full transition-colors"
            >
              <Plus size={18} className="text-gray-900 dark:text-white" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Create</span>
            </Link>

            {/* Notifications */}
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors relative">
              <Bell size={20} className="text-gray-900 dark:text-white" />
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-600 rounded-full"></span>
            </button>

            {/* Profile Avatar */}
            <Link href="/account" className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 shrink-0">
              {user.avatar || avatarSrc ? (
                <Image
                  src={avatarSrc || user.avatar || "/default-avatar.png"}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {user.username?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/signup" className="hidden sm:block">
              <button className="px-4 py-2 text-sm font-semibold text-white bg-black dark:text-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 rounded-full transition-all active:scale-[0.95]">
                Sign up
              </button>
            </Link>

            <Link href="/signin">
              <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-900 dark:text-white font-semibold px-4 py-2 rounded-full text-sm transition-all active:scale-[0.95]">
                Sign in
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}