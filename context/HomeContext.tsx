"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  Course,
  fetchCoursesForUser,
  fetchNewCourses,
  fetchPopularCourses,
  fetchRelatedCourse,
} from "@/lib/api/courses";
import { fetchLibraryCourse } from "@/lib/api/library";
import {
  getTopContributors,
  getNewContributors,
} from "@/lib/api/contributors";
import type { Contributor } from "@/lib/services/contributors.service";
import { fetchSmallAds, fetchMediumAds } from "@/lib/api/ads";
import { useUser } from "@/context/UserContext";

export type AdItem = {
  id: string;
  fileUrl: string;
  fileType: "image" | "video";
  link?: string;
};

export type HomeContributor = Contributor & {
  isFollowing: boolean;
};

type HomeContextType = {
  popular: Course[];
  setPopular: React.Dispatch<React.SetStateAction<Course[]>>;
  newCourses: Course[];
  setNewCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  newContributors: HomeContributor[];
  setNewContributors: React.Dispatch<React.SetStateAction<HomeContributor[]>>;
  forYou: Course[];
  library: Course[];
  related: Course[];
  contributors: HomeContributor[];
  setContributors: React.Dispatch<React.SetStateAction<HomeContributor[]>>;

  smallSearchAds: AdItem[];
  smallTopAds: AdItem[];
  smallMiddleAds: AdItem[];
  largeSearchAds: AdItem[];
  largeTopAds: AdItem[];
  largeMiddleAds: AdItem[];

  bannerAdOpen: boolean;
  currentBanner: AdItem | null;

  loading: boolean;
  loadingMore: { popular: boolean; new: boolean };
  
  loadMore: (type: "popular" | "new") => Promise<void>;
};

const HomeContext = createContext<HomeContextType | undefined>(undefined);

function pickRandom<T>(arr: T[]): T | null {
  if (!arr.length) return null;
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

export function HomeProvider({ children }: { children: ReactNode }) {
  const { user, loading: userLoading, homeBannerAds, showAdHome } = useUser();

  const [popular, setPopular] = useState<Course[]>([]);
  const [newCourses, setNewCourses] = useState<Course[]>([]);
  const [newContributors, setNewContributors] = useState<HomeContributor[]>([]);

  const [forYou, setForYou] = useState<Course[]>([]);
  const [library, setLibrary] = useState<Course[]>([]);
  const [related, setRelated] = useState<Course[]>([]);
  const [contributors, setContributors] = useState<HomeContributor[]>([]);

  const [smallSearchAds, setSmallSearchAds] = useState<AdItem[]>([]);
  const [smallTopAds, setSmallTopAds] = useState<AdItem[]>([]);
  const [smallMiddleAds, setSmallMiddleAds] = useState<AdItem[]>([]);
  const [largeSearchAds, setLargeSearchAds] = useState<AdItem[]>([]);
  const [largeTopAds, setLargeTopAds] = useState<AdItem[]>([]);
  const [largeMiddleAds, setLargeMiddleAds] = useState<AdItem[]>([]);
  
  const [bannerAdOpen, setBannerAdOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<AdItem | null>(null);

  const [offsets, setOffsets] = useState({ popular: 0, new: 0 });
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadingMore, setLoadingMore] = useState({ popular: false, new: false });

  // A flag to trace the user ID we last loaded data for, to refresh user-specific sections if user changes
  const [lastUserId, setLastUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (userLoading) return;
    
    // If it has loaded and the user hasn't changed, do not refetch
    if (hasLoaded && lastUserId === user?.$id) return;

    async function load() {
      setLoading(true);

      const value = showAdHome();
      setBannerAdOpen(value);
      setCurrentBanner(pickRandom(homeBannerAds));
      
      const { searchAds, topAds, middleAds } = await fetchSmallAds();
      setSmallSearchAds(searchAds);
      setSmallTopAds(topAds);
      setSmallMiddleAds(middleAds);

      const { oneAds, twoAds, threeAds } = await fetchMediumAds();
      setLargeSearchAds(oneAds);
      setLargeTopAds(twoAds);
      setLargeMiddleAds(threeAds);

      const [p, n, nc, t] = await Promise.all([
        fetchPopularCourses(10, 0),
        fetchNewCourses(10, 0),
        getNewContributors(),
        getTopContributors(),
      ]);

      setPopular(p);
      setNewCourses(n);

      if (user) {
        const [fy, lib, rel] = await Promise.all([
          fetchCoursesForUser(user),
          fetchLibraryCourse(user.$id),
          fetchRelatedCourse(user),
        ]);

        setForYou(fy);
        setLibrary(lib);
        setRelated(rel);
      } else {
        setForYou([]);
        setLibrary([]);
        setRelated([]);
      }

      const mapContributors = (c: Contributor) => {
        let ids: string[] = [];
        try {
          ids = JSON.parse(c.followersIds || "[]");
          if (!Array.isArray(ids)) ids = [];
        } catch {
          ids = [];
        }
        return {
          ...c,
          isFollowing: user?.$id ? ids.includes(user.$id) : false,
        };
      };

      setContributors(t.map(mapContributors));
      setNewContributors(nc.map(mapContributors));
      
      setLastUserId(user?.$id);
      setHasLoaded(true);
      setLoading(false);
    }

    load();
  }, [userLoading, user, hasLoaded, lastUserId, homeBannerAds, showAdHome]);

  const loadMore = async (type: "popular" | "new") => {
    if (loadingMore[type]) return;

    setLoadingMore((l) => ({ ...l, [type]: true }));
    const nextOffset = offsets[type] + 10;

    let data: Course[] = [];

    if (type === "popular") data = await fetchPopularCourses(10, nextOffset);
    if (type === "new") data = await fetchNewCourses(10, nextOffset);

    if (!data.length) {
      setLoadingMore((l) => ({ ...l, [type]: false }));
      return;
    }

    if (type === "popular") setPopular((p) => [...p, ...data]);
    if (type === "new") setNewCourses((p) => [...p, ...data]);

    setOffsets((o) => ({ ...o, [type]: nextOffset }));
    setLoadingMore((l) => ({ ...l, [type]: false }));
  };

  return (
    <HomeContext.Provider
      value={{
        popular, setPopular,
        newCourses, setNewCourses,
        newContributors, setNewContributors,
        forYou,
        library,
        related,
        contributors, setContributors,
        smallSearchAds,
        smallTopAds,
        smallMiddleAds,
        largeSearchAds,
        largeTopAds,
        largeMiddleAds,
        bannerAdOpen,
        currentBanner,
        loading,
        loadingMore,
        loadMore,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
}

export function useHome() {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error("useHome must be used within a HomeProvider");
  }
  return context;
}
