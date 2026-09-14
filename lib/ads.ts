import { uploadToServer } from "./upload";
import {
  fetchActiveAdsService,
  fetchAdByIdService,
  createAdService,
  updateAdService,
  deleteAdService,
  mapAd as mapAdService,
} from "./services/ad.service";

export type Ad = {
  id: string;
  name: string;
  smallImages: string[];
  mediumImages: string[];
  largeImages: string[];
  videos: string[];
  views: number;
  clicks: number;
  uniqueUsers?: string[];
  isExpired: boolean;
  endTime: string;
  user: string;
  type: string;
  link?: string;
};

export async function uploadAdImage(file: File): Promise<string> {
  return uploadToServer(file, "ads/images", "video");
}

export async function uploadAdVideo(file: File): Promise<string> {
  return uploadToServer(file, "ads/videos", "video");
}

export async function createAd(data: {
  name: string;
  smallImages: string[];
  mediumImages: string[];
  largeImages: string[];
  videos: string[];
  endTime: string;
  user: string;
  type: string;
  link?: string;
}) {
  return createAdService(data);
}

interface FetchAdsOptions {
  limit?: number;
  cursor?: string;
  filter?: Partial<{ name: string; type: string; isExpired: boolean }>;
}

export async function fetchAds(options: FetchAdsOptions = {}): Promise<{ ads: Ad[]; nextCursor?: string }> {
  try {
    const res = await fetch("/api/ads/list");
    const data = await res.json();
    return {
      ads: data.ads || data.documents || [],
      nextCursor: undefined,
    };
  } catch (err) {
    console.error("fetchAds error:", err);
    return { ads: [] };
  }
}

export type AdItem = {
  id: string;
  fileUrl: string;
  fileType: "image" | "video";
  link?: string;
};

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export async function fetchActiveAds(): Promise<Ad[]> {
  const ads = await fetchActiveAdsService();
  return ads as Ad[];
}

export async function fetchSmallAds(): Promise<{
  searchAds: AdItem[];
  topAds: AdItem[];
  middleAds: AdItem[];
}> {
  const activeAds = await fetchActiveAds();

  const formatted: AdItem[] = [];

  for (const ad of activeAds) {
    for (const imageUrl of ad.smallImages || []) {
      formatted.push({
        id: ad.id,
        fileUrl: imageUrl,
        fileType: "image",
        link: ad.link,
      });
    }

    for (const videoUrl of ad.videos || []) {
      formatted.push({
        id: ad.id,
        fileUrl: videoUrl,
        fileType: "video",
        link: ad.link,
      });
    }
  }

  if (formatted.length === 0) {
    return {
      searchAds: [],
      topAds: [],
      middleAds: [],
    };
  }

  const shuffled = shuffle(formatted);
  const pick = (items: AdItem[]) => items.slice(0, Math.min(6, items.length));

  return {
    searchAds: pick(shuffled),
    topAds: pick(shuffle(shuffled)),
    middleAds: pick(shuffle(shuffled)),
  };
}

export async function fetchMediumAds(): Promise<{
  oneAds: AdItem[];
  twoAds: AdItem[];
  threeAds: AdItem[];
}> {
  const activeAds = await fetchActiveAds();

  const formatted: AdItem[] = [];

  for (const ad of activeAds) {
    for (const imageUrl of ad.mediumImages || []) {
      formatted.push({
        id: ad.id,
        fileUrl: imageUrl,
        fileType: "image",
        link: ad.link,
      });
    }

    for (const videoUrl of ad.videos || []) {
      formatted.push({
        id: ad.id,
        fileUrl: videoUrl,
        fileType: "video",
        link: ad.link,
      });
    }
  }

  if (formatted.length === 0) {
    return {
      oneAds: [],
      twoAds: [],
      threeAds: [],
    };
  }

  const shuffled = shuffle(formatted);
  const pick = (items: AdItem[]) => items.slice(0, Math.min(6, items.length));

  return {
    oneAds: pick(shuffled),
    twoAds: pick(shuffle(shuffled)),
    threeAds: pick(shuffle(shuffled)),
  };
}

export type BannerOrSquareAdItem = {
  id: string;
  fileUrl: string;
  fileType: "image" | "video";
  link: string;
};

export async function fetchSquareAds(): Promise<BannerOrSquareAdItem[]> {
  const activeAds = await fetchActiveAds();

  const formatted: BannerOrSquareAdItem[] = [];

  for (const ad of activeAds) {
    for (const imageUrl of ad.largeImages || []) {
      formatted.push({
        id: ad.id,
        fileUrl: imageUrl,
        fileType: "image",
        link: ad?.link || "#",
      });
    }

    for (const videoUrl of ad.videos || []) {
      formatted.push({
        id: ad.id,
        fileUrl: videoUrl,
        fileType: "video",
        link: ad?.link || "#",
      });
    }
  }

  return formatted;
}

export async function recordAdView(adId: string, userId?: string) {
  try {
    const ad = await fetchAdById(adId);
    if (!ad) return;

    await updateAdService(adId, {
      views: (ad.views || 0) + 1,
    });
  } catch (err) {
    console.error("Failed to record ad view", err);
  }
}

export async function recordAdClick(adId: string) {
  try {
    const ad = await fetchAdById(adId);
    if (!ad) return;
    await updateAdService(adId, {
      clicks: (ad.clicks || 0) + 1,
    });
  } catch (err) {
    console.error("Failed to record ad click", err);
  }
}

export async function fetchAdById(adId: string): Promise<Ad | null> {
  const ad = await fetchAdByIdService(adId);
  return ad as Ad | null;
}

export async function editAd(
  adId: string,
  data: Partial<{
    name: string;
    smallImages: string[];
    mediumImages: string[];
    largeImages: string[];
    videos: string[];
    endTime: string;
    isExpired: boolean;
    type: string;
    link?: string;
    views?: number;
    clicks?: number;
  }>
) {
  return updateAdService(adId, data);
}

export async function deleteAd(adId: string) {
  return deleteAdService(adId);
}
