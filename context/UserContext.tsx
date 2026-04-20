"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getCurrentUser, updateUser } from "@/lib/appwrite";
import { BannerOrSquareAdItem, fetchSquareAds } from "@/lib/api/ads";
import { getMyContributor } from "@/lib/api/contributors";
import type { Contributor } from "@/lib/services/contributors.service";
import { fetchWallet } from "@/lib/api/wallet";

type User = {
  $id: string;
  email: string;
  username: string;
  level: number;
  department: string;
  avatar: string;
  isAdmin?: boolean;
  $createdAt: string;
};

type UserContextType = {
  user: User | null;
  contributor: Contributor | null;
  loading: boolean;
  hasWallet:boolean;
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

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [contributor, setContributor] = useState<Contributor | null>(null);
  const [loading, setLoading] = useState(true);
  const [contributorLoading, setContributorLoading] = useState(false);

  const [homeBannerAds, setHomeBannerAds] = useState<BannerOrSquareAdItem[]>([]);
  const [courseBannerAds, setCourseBannerAds] = useState<BannerOrSquareAdItem[]>([]);
  const [allScreenBannerAds, setAllScreenBannerAds] = useState<BannerOrSquareAdItem[]>([]);
  const [hasWallet, setHasWallet] = useState(false);

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

  const fetchUser = async () => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser as unknown as User);

      if (currentUser) {
        await updateUser({
          userId: currentUser.$id,
          lastTime: new Date(),
        });
        await fetchContributorForUser(currentUser.$id);

        const walletRes = await fetchWallet(currentUser.$id);
        if (walletRes) {
          setHasWallet(true);
        }
      } else {
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
  const ads = await fetchSquareAds();
  if (!ads.length) return;

  const shuffled = shuffle(ads);
  console.log("All Ads: ", shuffled)

  // Set the same shuffled list for all banner usages
  setHomeBannerAds(shuffled);
  setCourseBannerAds(shuffled);
  setAllScreenBannerAds(shuffled);
};


  useEffect(() => {
    fetchUser();
    fetchBannerAds();
  }, []);

   const showAdHome  = (prob: number[] = [1, 0, 0]) => {
    const shuffled = shuffle(prob);
    return shuffled[0] === 1;
  };

  const showAdCourse  = (prob: number[] = [1, 0, 0, 0, 0]) => {
    const shuffled = shuffle(prob);
    return shuffled[0] === 1;
  };

  const showAdAll  = (prob: number[] = [1, 0, 0]) => {
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

