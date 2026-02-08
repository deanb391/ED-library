"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getCurrentUser, updateUser } from "@/lib/appwrite";
import { BannerOrSquareAdItem, fetchSquareAds } from "@/lib/ads";

type User = {
  $id: string;
  email: string;
  username: string;
  level: number;
  department: string;
  avatar: string;
};

type UserContextType = {
  user: any | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;

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
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [homeBannerAds, setHomeBannerAds] = useState<BannerOrSquareAdItem[]>([]);
  const [courseBannerAds, setCourseBannerAds] = useState<BannerOrSquareAdItem[]>([]);
  const [allScreenBannerAds, setAllScreenBannerAds] = useState<BannerOrSquareAdItem[]>([]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        updateUser({
        userId: currentUser?.$id,
        lastTime: new Date()
        })
      }
      
    } catch {
      setUser(null);
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
        loading,
        refreshUser: fetchUser,
        setUser,

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

