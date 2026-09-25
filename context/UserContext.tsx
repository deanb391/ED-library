"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getCurrentUser, updateUser } from "@/lib/services/auth.service";
import { BannerOrSquareAdItem, fetchSquareAds } from "@/lib/api/ads";
import { getMyContributor } from "@/lib/api/contributors";
import type { Contributor } from "@/lib/services/contributors.service";
import { fetchWallet } from "@/lib/api/wallet";
import { fetchLibrary } from "@/lib/api/library";
import { useRouter, usePathname } from "next/navigation";
import OfflineModal from "@/components/OfflineModal";

type User = {
  $id: string;
  email: string;
  username: string;
  level: number;
  department: string;
  avatar: string;
  isAdmin?: boolean;
  isContributor?: boolean;
  isPremium?: boolean;
  premiumExpiresAt?: string;
  $createdAt: string;
};

type UserContextType = {
  user: User | null;
  contributor: Contributor | null;
  loading: boolean;
  hasWallet: boolean;
  hasLibrary: boolean;
  isOfflineMode: boolean;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setContributor: (contributor: Contributor | null) => void;
  refetchContributor: () => Promise<Contributor | null>;
  contributorLoading: boolean;

  homeBannerAds: BannerOrSquareAdItem[];
  courseBannerAds: BannerOrSquareAdItem[];
  allScreenBannerAds: BannerOrSquareAdItem[];

  showAdHome: () => boolean;
  showAdCourse: () => boolean;
  showAdAll: () => boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Routes where aggressive offline redirect does NOT apply */
const OFFLINE_SAFE_PATHS = ["/library", "/courses/"];

function isOfflineSafe(pathname: string) {
  return OFFLINE_SAFE_PATHS.some((p) =>
    pathname === p || pathname.startsWith(p)
  );
}

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [contributor, setContributor] = useState<Contributor | null>(null);
  const [loading, setLoading] = useState(true);
  const [contributorLoading, setContributorLoading] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);

  const [homeBannerAds, setHomeBannerAds] = useState<BannerOrSquareAdItem[]>([]);
  const [courseBannerAds, setCourseBannerAds] = useState<BannerOrSquareAdItem[]>([]);
  const [allScreenBannerAds, setAllScreenBannerAds] = useState<BannerOrSquareAdItem[]>([]);
  const [hasWallet, setHasWallet] = useState(false);
  const [hasLibrary, setHasLibrary] = useState(false);

  const fetchContributorForUser = useCallback(
    async (userId: string) => {
      setContributorLoading(true);
      try {
        const contributorAccount = await getMyContributor(userId);
        setContributor(contributorAccount);
        return contributorAccount;
      } catch {
        setContributor(null);
        return null;
      } finally {
        setContributorLoading(false);
      }
    },
    []
  );

  const refetchContributor = useCallback(async () => {
    if (!user?.$id) {
      setContributor(null);
      return null;
    }
    return fetchContributorForUser(user.$id);
  }, [user?.$id, fetchContributorForUser]);

  /** Fetch only what we need when online. Skip all secondary fetches when offline. */
  const fetchUser = async () => {
    setLoading(true);
    const online = typeof navigator !== "undefined" ? navigator.onLine : true;

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser as unknown as User);

      // Only do secondary network fetches if we are online
      if (currentUser && online) {
        try {
          await updateUser({ userId: currentUser.$id, lastTime: new Date() });
        } catch (e) {
          console.error("Failed to update user lastTime", e);
        }

        try {
          await fetchContributorForUser(currentUser.$id);
        } catch (e) {
          console.error("Failed to fetch contributor", e);
        }

        try {
          const walletRes = await fetchWallet(currentUser.$id);
          if (walletRes?.wallet) setHasWallet(true);
        } catch (e) {
          console.error("Failed to fetch wallet", e);
        }

        try {
          const libraryData = await fetchLibrary(currentUser.$id);
          if (libraryData?.wallet) setHasLibrary(true);
        } catch (e) {
          console.error("Failed to fetch library in UserContext", e);
        }
      } else if (!currentUser) {
        setContributor(null);
      }
    } catch {
      setUser(null);
      setContributor(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchBannerAds = async () => {
    try {
      const ads = await fetchSquareAds();
      if (!ads.length) return;
      const shuffled = shuffle(ads);
      setHomeBannerAds(shuffled);
      setCourseBannerAds(shuffled);
      setAllScreenBannerAds(shuffled);
    } catch {
      // Silently fail — ads are non-critical
    }
  };

  /** Re-fetch all secondary data when coming back online */
  const refetchOnOnline = async () => {
    const currentUser = user;
    if (!currentUser) return;

    try {
      await updateUser({ userId: currentUser.$id, lastTime: new Date() });
    } catch {}

    try {
      await fetchContributorForUser(currentUser.$id);
    } catch {}

    try {
      const walletRes = await fetchWallet(currentUser.$id);
      if (walletRes?.wallet) setHasWallet(true);
    } catch {}

    try {
      const libraryData = await fetchLibrary(currentUser.$id);
      if (libraryData?.wallet) setHasLibrary(true);
    } catch {}

    fetchBannerAds();
  };

  // ─── Network event listeners ───────────────────────────────────────────────
  useEffect(() => {
    const online = typeof navigator !== "undefined" ? navigator.onLine : true;
    setIsOfflineMode(!online);

    const handleOffline = () => {
      setIsOfflineMode(true);

      // Read the cached user to know if they are premium
      const cachedRaw = typeof window !== "undefined"
        ? localStorage.getItem("cached_user")
        : null;
      const cachedUser = cachedRaw ? (() => { try { return JSON.parse(cachedRaw); } catch { return null; } })() : null;
      const isPremium = cachedUser?.isPremium ?? false;

      if (isPremium) {
        // Premium: show modal (don't force-redirect)
        setShowOfflineModal(true);
      } else {
        // Non-premium: silently redirect to library if not already on a safe path
        if (!isOfflineSafe(pathname)) {
          router.push("/library");
        }
      }
    };

    const handleOnline = () => {
      setIsOfflineMode(false);
      setShowOfflineModal(false);
      // Fetch user fully and then let it trigger other data inside fetchUser.
      fetchUser();
      refetchOnOnline();
    };

    // Immediate check on mount
    if (!online && !isOfflineSafe(pathname)) {
      // Both premium and non-premium get sent to library on cold start offline
      router.push("/library");
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    fetchUser();
    if (typeof navigator !== "undefined" && navigator.onLine) {
      fetchBannerAds();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showAdHome = (prob: number[] = [1, 0, 0]) => {
    const shuffled = shuffle(prob);
    return shuffled[0] === 1;
  };

  const showAdCourse = (prob: number[] = [1, 0, 0]) => {
    const shuffled = shuffle(prob);
    return shuffled[0] === 1;
  };

  const showAdAll = (prob: number[] = [1, 0, 0]) => {
    const shuffled = shuffle(prob);
    return shuffled[0] === 1;
  };

  return (
    <UserContext.Provider
      value={{
        user,
        contributor,
        loading,
        hasWallet,
        hasLibrary,
        isOfflineMode,
        refreshUser: fetchUser,
        setUser,
        setContributor,
        refetchContributor,
        contributorLoading,

        homeBannerAds,
        courseBannerAds,
        allScreenBannerAds,

        showAdHome,
        showAdCourse,
        showAdAll,
      }}
    >
      {children}
      {showOfflineModal && (
        <OfflineModal onClose={() => setShowOfflineModal(false)} />
      )}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
