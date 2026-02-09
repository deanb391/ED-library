"use client";
import BannerAd from "@/components/BannerAd";
import DepartmentRow from "@/components/DepartmentRow";
import RectangularAd from "@/components/RectangularAd";
import { useUser } from "@/context/UserContext";
import { fetchMediumAds } from "@/lib/ads";
import { useEffect, useState } from "react";

const DEPARTMENTS = [
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Computer Engineering",
  "Chemical Engineering",
  "Petroleum Engineering",
  "Agricultural Engineering",
  "Marine Engineering",
];

export type AdItem = {
  id: string;
  fileUrl: string;
  fileType: "image" | "video";
  link?: string;
};


function pickRandom<T>(arr: T[]): T | null {
  if (!arr.length) return null;
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}


export default function AllCoursesPage() {
  const [searchAds, setSearchAds] = useState<AdItem[]>([])
  const [topAds, setTopAds] = useState<AdItem[]>([])
  const [middleAds, setMiddleAds] = useState<AdItem[]>([])
  const [loading, setLoading] = useState(false)
const [bannerAdOpen, setBannerAdOpen] = useState(false);
const [currentBanner, setCurrentBanner] = useState<AdItem | null>(null);
 const {allScreenBannerAds, showAdAll} = useUser()

  useEffect(() => {

  
    async function load() {
      setLoading(true);
      const { oneAds, twoAds, threeAds } = await fetchMediumAds()
      setSearchAds(oneAds);
      setTopAds(twoAds);
      setMiddleAds(threeAds);
      
      const value = showAdAll()
      console.log(value)
    setBannerAdOpen(value)
    const add = pickRandom(allScreenBannerAds)
    console.log(allScreenBannerAds)
    setCurrentBanner(add)
  

      setLoading(false);
    }
  
    load();
  }, [allScreenBannerAds]);
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 bg-[#F8F9FB]">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        All Courses
      </h1>

      <RectangularAd
                ads={topAds}
                className='mb-5'
              />

      {DEPARTMENTS.map((dept, index) => (
  <div key={dept}>
    <DepartmentRow department={dept} />

    {(index + 1) % 3 === 0 && (
      <RectangularAd
        ads={middleAds}
        className="my-6"
      />
    )}
    
  </div>
))}

    {currentBanner && (
  <BannerAd
    ad={currentBanner}
    isOpen={bannerAdOpen}
    onClose={() => setBannerAdOpen(false)}
  />
)}
    </div>

  );
}
